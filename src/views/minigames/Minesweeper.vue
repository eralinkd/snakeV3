<template>
  <div class="page">
    <!-- Верхняя панель с информацией о мине и оставшихся монетах -->
    <div class="fieldInfo">
      <div>
        <img :src="scoinImg" alt="scoin" />
        {{ coinssLeft }}
      </div>
      <div>
        <img :src="bombImg" alt="bomb" />
        {{ minesAmount }}
      </div>
    </div>

    <div class="coefficients">
      <div class="active"><span>x1.234</span></div>
      <div class="next"><span>x1.234</span></div>
      <div><span>x1.234</span></div>
    </div>

    <!-- Основное игровое поле 5×5 -->
    <div class="gameField">
      <button
        v-for="(cell, index) in field.flat()"
        :key="index"
        type="button"
        :disabled="!gameStarted"
        :class="['cell', isOpened(Math.floor(index / 5), index % 5) ? 'opened' : '']"
        @click="openCell(Math.floor(index / 5), index % 5)"
      >
        <!-- Если ячейка открыта, показываем бомбу или монету -->
        <img
          v-if="isOpened(Math.floor(index / 5), index % 5)"
          :src="isBomb(Math.floor(index / 5), index % 5) ? bombImg : scoinImg"
          :alt="isBomb(Math.floor(index / 5), index % 5) ? 'bomb' : 'scoin'"
        />
      </button>
    </div>

    <!-- Информация о ставке -->
    <div class="info">
      <h2 class="betText">Сделайте ставку</h2>
      <div class="infoImg" @click="showInfo = true">
        <img :src="infoImg" alt="info" />
      </div>
    </div>

    <!-- Выбор параметров игры и кнопки "Начать игру" / "Забрать ... " -->
    <div class="optionsField">
      <!-- Выбор валюты (USDT или scoin) -->
      <div class="currencySelector">
        <div
          :class="[
            'option',
            selectedCurrency === 'USDT_TRC20' ? 'selected' : '',
            gameStarted ? 'disabled' : '',
          ]"
          @click="setSelectedCurrency('USDT_TRC20')"
        >
          <img :src="usdtImg" alt="USDT_TRC20" />
        </div>
        <div
          :class="[
            'option',
            selectedCurrency === 'scoin' ? 'selected' : '',
            gameStarted ? 'disabled' : '',
          ]"
          @click="setSelectedCurrency('scoin')"
        >
          <img :src="scoinImg" alt="scoin" />
        </div>
      </div>

      <!-- Выбор ставки -->
      <div class="betAmountContainer">
        <div class="betSelector">
          <div
            v-for="option in selectedCurrency === 'USDT_TRC20'
              ? usdtBetAmountOptions
              : scoinBetAmountOptions"
            :key="option"
            @click="handleBetOptionClick(option)"
            :class="[
              'option',
              isBetOptionSelected(option) ? 'selected' : '',
              gameStarted ? 'disabled' : '',
            ]"
          >
            {{ option }}
          </div>
        </div>
      </div>

      <!-- Количество мин -->
      <div class="minesAmountContainer">
        <label>Выберите количество бомб</label>
        <div class="minesSelector">
          <div
            v-for="option in minesAmountOptions"
            :key="option"
            @click="setMinesAmount(option)"
            :class="[
              'option',
              option === minesAmount ? 'selected' : '',
              gameStarted ? 'disabled' : '',
            ]"
          >
            {{ option }}
          </div>
        </div>
      </div>

      <BaseButton :disabled="gameStarted" @click="handlePlay" v-if="!gameStarted"
        >Начать игру</BaseButton
      >
      <BaseButton :disabled="!gameStarted" @click="handleWin" v-else
        >Забрать {{ currentWin }}</BaseButton
      >
    </div>

    <!-- Добавляем шторку с информацией -->
    <BaseBottomSheet :is-open="showInfo" @update:is-open="showInfo = false">
      <div class="info-sheet">
        <h3 class="info-sheet__title">Как играть?</h3>
        <p class="info-sheet__text">Краткое руководство</p>
        <div class="info-sheet__content">
          <p class="info-sheet__text">
            Зачем мне объяснять вам как играть в сапёра? Есть монета - ты хочешь монету, есть бомба
            - ты не хочешь бомбу. Тыкай на клетку и надейся на лучшее. А и да, тебе нужно платить
            SCOIN или USDT, чтобы иметь хоть какие-то шансы.
            <br /><br />
            А ты что думал? Бесплатный сыр?
          </p>
        </div>
        <img :src="snake" alt="snake" class="info-sheet__image" />
      </div>
    </BaseBottomSheet>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { postCreateMinerGame, postGameCurrentContent } from '@/api/gameApi'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'
import BaseButton from '@/components/BaseButton.vue'

// Импорт картинок
import scoinImg from '@/assets/games/minigames/miner/scoin.png'
import bombImg from '@/assets/games/minigames/miner/bomb.png'
import usdtImg from '@/assets/currency-images/usdt.png'
import infoImg from '@/assets/games/minigames/miner/info.png'
import snake from '@/assets/game/snake.png'

// Константы для игры
const minesAmountOptions = [3, 5, 10, 15]
const usdtBetAmountOptions = [1, 3, 5, 10, 20]
const scoinBetAmountOptions = [100, 300, 500, 1000, 2000]

// Состояния (ref) вместо useState
const field = ref(generateField(minesAmountOptions[0]))
const openedCells = ref([])
const gameStarted = ref(false)
const coinssLeft = ref(25 - minesAmountOptions[0])

const gameID = ref(null)
const currentWin = ref(0)
const minesAmount = ref(minesAmountOptions[0])
const betAmount = ref(usdtBetAmountOptions[0])
const scoinAmount = ref(scoinBetAmountOptions[0])
const selectedCurrency = ref('USDT_TRC20')

// Добавляем состояние для шторки
const showInfo = ref(false)

// Аналог generateField() из React
function generateField(mines) {
  const size = 5
  const newField = Array.from({ length: size }, () => Array(size).fill('e'))

  let placedMines = 0
  while (placedMines < mines) {
    const row = Math.floor(Math.random() * size)
    const col = Math.floor(Math.random() * size)
    if (newField[row][col] !== 'm') {
      newField[row][col] = 'm'
      placedMines++
    }
  }
  return newField
}

// Аналог useEffect(() => { ... }, [minesAmount])
watch(minesAmount, (val) => {
  field.value = generateField(val)
  openedCells.value = []
})

// Аналог useEffect(() => { coinssLeft = 25 - minesAmount }, [minesAmount])
watch(
  minesAmount,
  (val) => {
    coinssLeft.value = 25 - val
  },
  { immediate: true },
)

// Проверка, открыта ли ячейка
function isOpened(rowIndex, colIndex) {
  return openedCells.value.some((cell) => cell.row === rowIndex && cell.col === colIndex)
}

// Проверка, бомба ли там
function isBomb(rowIndex, colIndex) {
  const found = openedCells.value.find((cell) => cell.row === rowIndex && cell.col === colIndex)
  if (!found) return false
  return found.symbol === 'bomb'
}

// Обработка клика по ячейке (открыть)
function openCell(rowIndex, colIndex) {
  if (!gameStarted.value) return

  // Уже открыта?
  if (isOpened(rowIndex, colIndex)) {
    return
  }

  const content = `${rowIndex} ${colIndex}`
  postGameCurrentContent(gameID.value, content).then((data) => {
    const { symbol, status, canWin } = data
    currentWin.value = canWin

    // Записываем, что эта ячейка открыта с symbol
    openedCells.value.push({ row: rowIndex, col: colIndex, symbol })

    if (status === 'LOSE') {
      gameStarted.value = false
      // Можно показать модалку с проигрышем
    }
    if (status === 'WIN') {
      gameStarted.value = false
      // Можно показать модалку с выигрышем
    }
  })
}

// Нажатие на кнопку "Начать игру" или "Повторить" в React
function handlePlay() {
  const gameData = {
    content: '',
    bombs: minesAmount.value,
    bet: selectedCurrency.value === 'USDT_TRC20' ? betAmount.value : scoinAmount.value,
    crypto: selectedCurrency.value.toUpperCase(),
  }
  postCreateMinerGame(gameData).then((data) => {
    if (!data.success) {
      // Вывести ошибку о нехватке баланса
      return
    }
    gameID.value = data.id
    gameStarted.value = true
    openedCells.value = []

    // Генерируем новое поле
    field.value = generateField(minesAmount.value)
  })
}

// Нажатие на кнопку "Забрать currentWin"
function handleWin() {
  // Здесь же можно вызвать закрытие игры, получение выигрыша и т.д.
  gameStarted.value = false
}

// Смена валюты
function setSelectedCurrency(currency) {
  if (gameStarted.value) return
  selectedCurrency.value = currency
}

// Выбор ставки
function handleBetOptionClick(option) {
  if (gameStarted.value) return
  if (selectedCurrency.value === 'USDT_TRC20') {
    betAmount.value = option
  } else {
    scoinAmount.value = option
  }
}
function isBetOptionSelected(option) {
  return selectedCurrency.value === 'USDT_TRC20'
    ? betAmount.value === option
    : scoinAmount.value === option
}

// Установка количества мин
function setMinesAmount(option) {
  if (gameStarted.value) return
  minesAmount.value = option
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
/* Below is the style code formerly in Minesweeper.module.scss */
.page {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-direction: column;
  padding: 24px 17px 134px 17px;
}

.fieldInfo {
  display: flex;
  gap: 12px;
  width: 100%;
  & > div {
    width: 100%;
    gap: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;
    letter-spacing: 0px;
    border-radius: 8px;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.05);
    img {
      width: 20px;
    }
  }
}

.gameField {
  display: grid;
  max-width: 335px;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  grid-gap: 7px;
  width: 100%;
  position: relative;
}

.cell {
  border-radius: 8px;
  backdrop-filter: blur(30px);
  background: linear-gradient(
    -14.11deg,
    rgba(27, 24, 41, 0.75) -51.653%,
    rgba(76, 64, 120, 0.75) 405.229%
  );
  cursor: pointer;
  width: 100%;
  max-width: 67px;
  aspect-ratio: 1;
  padding: 5px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.cell[disabled] {
  cursor: not-allowed;
}

.opened {
  box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
  backdrop-filter: blur(30px);
  background: rgba(27, 24, 41, 0.75);
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  .betText {
    font-size: 16px;
    font-weight: 500;
    line-height: 150%;
    letter-spacing: 0px;
  }

  .infoImg {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.optionsField {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
}

.currencySelector {
  margin-top: -12px;
  display: flex;
  width: 100%;
  gap: 10px;
  justify-content: center;
}

.option {
  width: 100px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(87.71deg, rgb(25, 22, 38) 0.807%, rgb(27, 24, 41) 99.193%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease 0s;
  font-size: 16px;
  font-weight: 700;
  line-height: 150%;
  letter-spacing: 0px;
  display: flex;

  img {
    display: block;
    max-width: 45%;
    max-height: 100%;
    border-radius: 50%;
  }
}

.selected {
  box-shadow:
    0px 0px 15px 0px rgba(149, 125, 255, 0.32),
    inset 0px 0px 10px 0px rgba(255, 255, 255, 0.25);
  background: linear-gradient(39.39deg, rgb(149, 125, 255) -6.617%, rgb(223, 157, 255) 152.675%);
}

label {
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
  letter-spacing: 0px;
  margin-bottom: 18px;
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.betAmountContainer,
.minesAmountContainer {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
}

.betSelector,
.minesSelector {
  display: flex;
  gap: 5px;
  width: 100%;
}

.betSelector .option,
.minesSelector .option {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease 0s;
}

.playButton {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to top right, #81f8fd, #4be);
  border-radius: 6px;
  text-shadow: 1px 1px 1px #000;
  transition: all 0.3s;
  margin-top: 10px;
}

.coefficients {
  display: flex;
  gap: 12px;
  width: 100%;
  & > div {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background: linear-gradient(87.71deg, rgb(25, 22, 38) 0.189%, rgb(27, 24, 41) 99.811%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    height: 40px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
    font-weight: 500;
    line-height: 150%;
    letter-spacing: 0px;
    text-align: center;

    &.active {
      box-shadow:
        0px 0px 15px 0px rgba(149, 125, 255, 0.32),
        inset 0px 0px 10px 0px rgba(255, 255, 255, 0.25);
      background: linear-gradient(
        39.55deg,
        rgb(149, 125, 255) -13.595%,
        rgb(223, 157, 255) 137.28%
      );
      color: #fff;
    }

    &.next {
      color: #fff;
    }
  }
}

.info-sheet {
  &__title {
    font-family: Montserrat;
    font-size: 24px;
    font-weight: 700;
    line-height: 36px;
    text-align: left;
    color: #fff;
  }

  &__text {
    font-family: Montserrat;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    text-align: left;
    color: #ffffff80;
    margin-top: 2px;
    margin-bottom: 24px;
  }

  &__content {
    margin-bottom: 24px;
  }

  &__image {
    width: 100%;
    object-fit: contain;
  }
}
</style>
