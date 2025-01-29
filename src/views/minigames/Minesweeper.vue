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
      <div :class="{ active: currentMultiplierIndex >= 0 }">
        <span>x{{ multipliers[currentMultiplierIndex] || '0.00' }}</span>
      </div>
      <div :class="{ next: true }">
        <span>x{{ multipliers[currentMultiplierIndex + 1] || '0.00' }}</span>
      </div>
      <div>
        <span>x{{ multipliers[currentMultiplierIndex + 2] || '0.00' }}</span>
      </div>
    </div>

    <!-- Добавляем после блока с коэффициентами и перед игровым полем -->

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
      <h2 class="betText">{{ t('minigames.minesweeper_game.bet_title') }}</h2>
      <div class="infoImg" @click="showInfo = true">
        <img :src="infoImg" alt="info" />
      </div>
    </div>

    <!-- Выбор параметров игры и кнопки "Начать игру" / "Забрать ... " -->
    <div class="optionsField">
      <!-- Выбор валюты (USDT или scoin) -->
      <div class="swap-card">
        <BaseInput
          v-model="formattedAmountFrom"
          type="number"
          placeholder="0.00"
          class="swap-card__input"
          without-plate
          :readonly="gameStarted"
          :disabled="gameStarted"
        />

        <BaseSelect
          v-model="selectedFrom"
          :options="swappableOptions"
          placement="left"
          @select="handleAction"
          class="swap-card__select"
          :readonly="gameStarted"
          :disabled="gameStarted"
        >
          <template #trigger="{ selected, isOpen }">
            <button :class="['swap-card__select-trigger']">
              <img
                class="swap-card__select-trigger-icon"
                :src="icons[selected.value]"
                alt="filter icon"
              />
              <div class="swap-card__select-trigger-text">
                <p>{{ selected.label }}</p>
                <span>{{ t('minigames.minesweeper_game.bet') }}</span>
              </div>
              <div
                :class="[
                  'filter-button__icon-container',
                  { 'filter-button__icon-container--rotate': isOpen },
                ]"
              >
                <svg
                  width="10"
                  height="7"
                  viewBox="0 0 10 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.58925 6.25594C5.26383 6.58135 4.73617 6.58135 4.41075 6.25594L0.244075 2.08928C-0.0813583 1.76384 -0.0813583 1.2362 0.244075 0.910762C0.569517 0.585329 1.09715 0.585329 1.42259 0.910762L5 4.48819L8.57742 0.910762C8.90283 0.585329 9.4305 0.585329 9.75592 0.910762C10.0813 1.2362 10.0813 1.76384 9.75592 2.08928L5.58925 6.25594Z"
                    fill="white"
                  />
                </svg>
              </div>
            </button>
          </template>
        </BaseSelect>
      </div>

      <!-- Количество мин -->
      <div class="minesAmountContainer">
        <label>{{ t('minigames.minesweeper_game.bet_bomb') }}</label>
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

      <BaseButton :disabled="gameStarted" @click="handlePlay" v-if="!gameStarted">{{
        t('minigames.minesweeper_game.bet_start')
      }}</BaseButton>
      <BaseButton :disabled="!gameStarted || !currentWin" @click="handleWin" v-else
        >{{ t('minigames.minesweeper_game.bet_win') }} {{ currentWin }}</BaseButton
      >
    </div>

    <!-- Добавляем шторку с информацией -->
    <BaseBottomSheet :is-open="showInfo" @update:is-open="showInfo = false">
      <div class="info-sheet">
        <h3 class="info-sheet__title">{{ t('minigames.minesweeper_game.info_title') }}</h3>
        <p class="info-sheet__text">{{ t('minigames.minesweeper_game.info_subtitle') }}</p>
        <div class="info-sheet__content">
          <p class="info-sheet__text">
            {{ t('minigames.minesweeper_game.info_text') }}
          </p>
        </div>
        <img :src="hint" alt="snake" class="info-sheet__image" />
      </div>
    </BaseBottomSheet>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { postCreateMinerGame, postGameCurrentContent } from '@/api/gameApi'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'

// Импорт картинок
import scoinImg from '@/assets/games/minigames/miner/scoin.png'
import bombImg from '@/assets/games/minigames/miner/bomb.png'
import usdtImg from '@/assets/currency-images/usdt.png'
import infoImg from '@/assets/games/minigames/miner/info.png'
import hint from '@/assets/hints/minesweeper.png'
import bitcoinIcon from '@/assets/currency-images/bitcoin.png'
import ethIcon from '@/assets/currency-images/eth.png'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Константы для игры
const minesAmountOptions = [3, 5, 10, 15]
const usdtBetAmountOptions = [1, 3, 5, 10, 20]
const scoinBetAmountOptions = [100, 300, 500, 1000, 2000]

// Состояния (ref) вместо useState
const field = ref(generateField(minesAmountOptions[0]))
const multipliers = ref([])
const openedCells = ref([])
const gameStarted = ref(false)
const coinssLeft = ref(25 - minesAmountOptions[0])

const gameID = ref(null)
const currentWin = ref(0)
const minesAmount = ref(minesAmountOptions[0])
const betAmount = ref(usdtBetAmountOptions[0])
const scoinAmount = ref(scoinBetAmountOptions[0])
const selectedCurrency = ref('USDT_TRC20')
const currentMultiplierIndex = ref(-1)

// Добавляем состояние для шторки
const showInfo = ref(false)

// Добавляем новые computed и refs
const icons = computed(() => ({
  SCOIN: scoinImg,
  BTC: bitcoinIcon,
  ETH: ethIcon,
  USDT_TRC20: usdtImg,
}))

const swappableOptions = computed(() => [
  { value: 'USDT_TRC20', label: 'USDT' },
  { value: 'SCOIN', label: 'SCOIN' },
])

const selectedFrom = ref('USDT_TRC20')
const formattedAmountFrom = computed({
  get: () => betAmount.value,
  set: (value) => {
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.')
      if (decimal && decimal.length > 2) {
        return
      }
    }
    betAmount.value = value
  },
})

const handleAction = () => {
  if (selectedFrom.value === 'USDT_TRC20') {
    betAmount.value = usdtBetAmountOptions[0]
  } else {
    betAmount.value = scoinBetAmountOptions[0]
  }
}

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
  if (isOpened(rowIndex, colIndex)) return

  const content = { content: `${rowIndex},${colIndex}` }
  postGameCurrentContent(gameID.value, content).then((data) => {
    const { symbol, status, canWin } = data
    currentWin.value = canWin
    openedCells.value.push({ row: rowIndex, col: colIndex, symbol })

    if (symbol === 'diamond' && status !== 'LOSE') {
      currentMultiplierIndex.value += 1
    }

    if (status === 'LOSE' || status === 'WIN') {
      gameStarted.value = false
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
      return
    }
    gameID.value = data.id
    gameStarted.value = true
    openedCells.value = []
    multipliers.value = data.multipliers || []
    multipliers.value.push(multipliers.value[multipliers.value.length - 1])
    multipliers.value.push(multipliers.value[multipliers.value.length - 1])
    multipliers.value.push(multipliers.value[multipliers.value.length - 1])
    currentMultiplierIndex.value = 0
    currentWin.value = 0
    field.value = generateField(minesAmount.value)
  })
}

// Нажатие на кнопку "Забрать currentWin"
function handleWin() {
  postGameCurrentContent(gameID.value, { content: 'finish' })
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

.swap-card {
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 12px 20px 12px 12px;
  border-radius: 16px;
  box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
  backdrop-filter: blur(30px);
  background: rgba(27, 24, 41, 0.75);

  &__input {
    :deep(input) {
      width: 100%;
    }
  }

  &__select {
    max-width: 200px;
    display: flex;
    justify-content: flex-end;
  }

  &__select-trigger {
    display: flex;
    align-items: center;
    gap: 16px;

    &-icon {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      @media (max-width: $smallBreakpoint) {
        width: 36px;
        height: 36px;
      }
    }

    &-text {
      display: flex;
      flex-direction: column;
      gap: 2px;

      p {
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        line-height: 22px;
        letter-spacing: 0px;
        width: 72px;
        margin-right: 5px;
        text-align: left;
        @media (max-width: $smallBreakpoint) {
          width: 50px;
        }
      }

      span {
        color: #808080;
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        letter-spacing: 0px;
        text-align: left;
      }
    }
  }
}

.filter-button__icon-container {
  svg {
    transition: all 0.3s ease 0s;
  }
  &--rotate {
    svg {
      transform: rotate(180deg);
    }
  }
}
</style>
