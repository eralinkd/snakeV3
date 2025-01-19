<template>
  <div class="game">
    <div class="game__top-bar" v-if="!isGameStarted">
      <div class="game__top-bar-balance">
        <img :src="Scoin" alt="balance" />
        <p>{{ gamedata.balance }}</p>
      </div>
      <div class="game__top-bar-right">
        <div class="game__top-bar-exchange-rate">
          <div><img :src="usdt" alt="balance" />{{ gamedata.exchangeFrom }}</div>
          <div>=</div>
          <div><img :src="Scoin" alt="balance" />{{ gamedata.exchangeTo }}</div>
        </div>
        <div class="game__top-bar-info" @click="showInfo = true">
          <img :src="info" alt="info" />
        </div>
      </div>
    </div>
    <div class="game__main" v-if="!isGameStarted">
      <div class="game__main-left">
        <div class="game__main-left-heart">
          <img :src="heart" alt="heart" />
          <p>{{ gamedata.health }}</p>
        </div>
        <div class="game__main-left-energy">
          <img :src="energy" alt="energy" />
          <p>{{ gamedata.energy }}</p>
        </div>
        <!-- <div class="game__main-left-equipment first" @click="router.push('/inventory')">
          <img
            :class="{ helmet: true, active: gamedata.equipment?.helmet }"
            :src="helmet"
            alt="helmet"
          />
        </div>
        <div class="game__main-left-equipment" @click="router.push('/inventory')">
          <img
            :class="{ armor: true, active: gamedata.equipment?.armor }"
            :src="armor"
            alt="armor"
          />
        </div>
        <div class="game__main-left-equipment" @click="router.push('/inventory')">
          <img
            :class="{ shield: true, active: gamedata.equipment?.shield }"
            :src="shield"
            alt="shield"
          />
        </div>
        <div class="game__main-left-equipment" @click="router.push('/inventory')">
          <img
            :class="{ sword: true, active: gamedata.equipment?.sword }"
            :src="sword"
            alt="sword"
          />
        </div> -->
      </div>
      <div class="game__main-snake" @click="startGame">
        <img :src="snake" alt="snake" />
      </div>
      <div class="game__main-right">
        <div>
          <img :src="energyBoost" alt="energyBoost" />
          <p>{{ gamedata.boosts?.energyBoost || '+' }}</p>
        </div>
  <div>
          <img :src="incomeBoost" alt="incomeBoost" />
          <p>{{ gamedata.boosts?.incomeBoost || '+' }}</p>
        </div>
        <div class="game__main-right__inventory" @click="router.push('/inventory')">
          <img :src="inventory" alt="inventory" />
        </div>
      </div>
    </div>
    <div class="game__top-stats" v-if="isGameStarted">
      <div class="game__stats">
        <div class="game__stats-item">
          <img :src="energy" alt="energy" />
          <p>{{ currentEnergy }}</p>
        </div>
        <div class="game__stats-item">
          <img :src="Scoin" alt="coins" />
          <p>{{ sessionCoins }}</p>
        </div>
      </div>
    </div>
    <div
      id="game-container"
      @touchmove.prevent
      @touchstart.prevent
      :class="{ visible: isGameStarted }"
    ></div>
    <BaseModal
      :isOpen="showNoResourcesModal"
      @update:isOpen="handleModalClose"
      className="store-modal"
    >
      <div class="store-modal__content">
        <BaseModalClose @click="handleModalClose" className="store-modal__close" />
        <div class="store-modal__frame store-modal__frame--fail">
          <div class="store-modal__image">
            <img :src="fail" alt="ошибка" />
          </div>
          <h2 class="store-modal__title">Недостаточно ресурсов</h2>
          <p class="store-modal__description">Для начала игры необходимы жизни и энергия.</p>
          <BaseButton @click="handleModalClose" type="button" size="small"
            >Окей, спасибо</BaseButton
          >
        </div>
      </div>
    </BaseModal>
    <BaseBottomSheet :is-open="showInfo" @update:is-open="showInfo = false">
      <div class="info-sheet">
        <h3 class="info-sheet__title">Как играть?</h3>
        <p class="info-sheet__text">Краткое руководство</p>
        <div class="info-sheet__content">
          <p class="info-sheet__text">
            Куча интересного и не очень текста о том, как играть в змейку. Помните такую на змейку
            на Nokia? Так вот, это не одно и тоже. А вот помните Subway Surf 2014? Вот это уже ближе
            к тому, что вы будете здесь делать.
            <br /><br />Вот даже картинка есть
          </p>

          <img :src="snake" alt="snake" class="info-sheet__image" />
        </div>
      </div>
    </BaseBottomSheet>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'
import SnakeScene from '@/game/scenes/SnakeScene'
import Scoin from '@/assets/currency-images/snake-coin.png'
import usdt from '@/assets/currency-images/usdt.png'
import energyBoost from '@/assets/game/energy-boost.svg'
import energy from '@/assets/game/energy.svg'
import heart from '@/assets/game/heart.svg'
import incomeBoost from '@/assets/game/income-boost.svg'
import info from '@/assets/game/info.svg'
import inventory from '@/assets/game/inventory.svg'
import helmet from '@/assets/game/helmet.png'
import armor from '@/assets/game/armor.png'
import shield from '@/assets/game/shield.png'
import sword from '@/assets/game/sword.png'
import snake from '@/assets/game/snake.png'
import { getGameData, postGameGameEnd, postGameSnakeCreate, postGameCurrentContent } from '@/api/gameApi'
import BaseModal from '@/components/BaseModal.vue'
import BaseModalClose from '@/components/BaseModalClose.vue'
import BaseButton from '@/components/BaseButton.vue'
import fail from '@/assets/game/fail.png'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'

const router = useRouter()
const gamedata = ref({})
const gameId = ref(null)
const isGameStarted = ref(false)
let game = null
let snakeScene = null
const showNoResourcesModal = ref(false)
const showInfo = ref(false)
const collectedCoins = ref(0)
const currentEnergy = ref(100)
const currentCoins = ref(0)
const sessionCoins = ref(0)

const handleModalClose = () => {
  showNoResourcesModal.value = false
}

const startGame = async () => {
  if (isGameStarted.value) return

  if (gamedata.value.energy <= 0 || gamedata.value.health <= 0) {
    showNoResourcesModal.value = true
    return
  }

  try {
    const response = await postGameSnakeCreate()
    if (!response?.id) {
      showNoResourcesModal.value = true
      return
    }
    
    gameId.value = response.id
    currentCoins.value = 0
    sessionCoins.value = 0
    currentEnergy.value = gamedata.value.energy
    
    isGameStarted.value = true
    setTimeout(() => {
      if (snakeScene) {
        snakeScene.startGame()
      }
    }, 100)
  } catch (error) {
    console.error('Error creating game:', error)
    showNoResourcesModal.value = true
  }
}

const finishGame = async () => {
  isGameStarted.value = false
  
  if (!gameId.value) {
    console.error('No gameId available')
    return
  }

  try {
    await postGameGameEnd(gameId.value)
    const newGameData = await getGameData()
    gamedata.value = newGameData
  } catch (error) {
    console.error('Error finishing game:', error)
  }
}

const handleCoinCollect = async () => {
  try {
    const response = await postGameCurrentContent(gameId.value, { content: 'coin' })
    if (response.amount) {
      currentCoins.value = response.amount
      sessionCoins.value += 1
    }
    if (response.energy) {
      currentEnergy.value = response.energy
    }
    if (response.content === 'game_end') {
      snakeScene.forceGameEnd()
    }
  } catch (error) {
    console.error('Error getting current content:', error)
  }
}

const handleObstacleHit = async () => {
  try {
    const response = await postGameCurrentContent(gameId.value, { content: 'obstacle' })
    if (response.amount) {
      currentCoins.value = response.amount
    }
    if (response.energy) {
      currentEnergy.value = response.energy
    }
    if (response.content === 'game_end') {
      snakeScene.forceGameEnd()
    }
  } catch (error) {
    console.error('Error getting current content:', error)
  }
}

onMounted(() => {
  const config = {
    type: Phaser.CANVAS,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1B1829',
    scene: SnakeScene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: false,
      antialias: true,
      powerPreference: 'high-performance',
    },
    input: {
      keyboard: true,
    },
  }

  game = new Phaser.Game(config)

  game.events.once('ready', () => {
    snakeScene = game.scene.getScene('SnakeScene')
    snakeScene.setFinishCallback(finishGame)
    snakeScene.setCollectCallback(handleCoinCollect)
    snakeScene.setObstacleCallback(handleObstacleHit)
  })

  // Загрузка данных игры
  // Раскомментируйте для использования реального API
  // getGameData().then((data) => {
  //   gamedata.value = data
  // })

  gamedata.value = {
    balance: '120к',
    exchangeFrom: '1',
    exchangeTo: '20к',
    energy: 100,
    health: 100,
    boosts: {
      energyBoost: 0,
      incomeBoost: 0,
    },
    equipment: {
      helmet: false,
      armor: false,
      shield: false,
      sword: false,
    },
  }
})

onUnmounted(() => {
  if (game) {
    game.destroy(true)
  }
})
</script>

<style scoped lang="scss">
.game {
  position: relative;
  width: 100%;
  height: 100vh;
  touch-action: none;
  overflow: hidden;
  padding-top: 24px;
}

#game-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  touch-action: none;
  opacity: 0;
  visibility: hidden;
  transform: scale(1.1);
  transition: all 0.3s ease;

  &.visible {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
  }

  canvas {
    width: 100%;
    height: 100vh;
    object-fit: cover;
  }
}

.game__top-bar {
  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  display: flex;
  justify-content: space-between;
  align-items: center;
  .game__top-bar-balance {
    width: 89px;
    height: 40px;
    gap: 10px;
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;
    letter-spacing: 0px;
    text-align: left;
    color: #fff;
    border-radius: 8px;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.05);

    img {
      width: 20px;
      height: 20px;
    }
  }

  .game__top-bar-right {
    gap: 12px;

    .game__top-bar-exchange-rate {
      gap: 17.5px;
      font-size: 16px;
      font-weight: 400;
      line-height: 150%;
      letter-spacing: 0px;
      width: 164px;
      height: 40px;
      color: #fff;
      border-radius: 8px;
      box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
      backdrop-filter: blur(30px);
      background: rgba(27, 24, 41, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.05);

      > div {
        img {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }
        gap: 10px;
      }
    }

    .game__top-bar-info {
      width: 40px;
      height: 40px;
      background: rgba(27, 24, 41, 0.75);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
  }
}

.game__main {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 24px;
  max-width: 100%;

  .game__main-snake {
    img {
      width: 100%;
    }
  }

  .game__main-left,
  .game__main-right {
    display: flex;
    flex-direction: column;
    gap: 12px;

    div {
      padding: 0 12px;
      gap: 10px;
      min-width: 69px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      color: rgb(255, 255, 255);
      font-family: Montserrat;
      font-size: 16px;
      font-weight: 400;
      line-height: 150%;
      letter-spacing: 0px;
      text-align: left;
      border-radius: 8px;
      box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
      backdrop-filter: blur(30px);
      background: rgba(27, 24, 41, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .game__main-right__inventory {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: flex-end;
      width: 80px;
      height: 80px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .game__main-left-equipment {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 69px;
      height: 67px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;

      &.first {
        margin-top: 12px;
      }

      .helmet {
        width: 34px;
      }

      .armor {
        width: 54px;
      }

      .shield {
        width: 57px;
      }

      .sword {
        width: 57px;
      }
    }
  }
}

.start-button {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  transition: opacity 0.3s ease;

  &.hidden {
    opacity: 0;
    pointer-events: none;
  }
}

.store-modal {
  position: relative;

  &__close {
    position: absolute;
    top: 0px;
    right: 0px;
  }

  &__content {
    border-radius: 16px;
    background: rgba(27, 24, 41, 0.75);
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(15px);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__frame {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  &__image {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__title {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    line-height: 150%;
  }

  &__description {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    max-width: 240px;
  }
}

.info-sheet {
  &__title {
    font-family: Montserrat;
    font-size: 24px;
    font-weight: 700;
    line-height: 36px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: #fff;
  }

  &__text {
    font-family: Montserrat;
    font-size: 10px;
    font-weight: 400;
    line-height: 15px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    margin-top: 2px;
    margin-bottom: 24px;
  }

  &__content {
    font-family: Montserrat;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: #ffffff80;
    margin-bottom: 24px;
  }

  &__image {
    width: 100%;
    // height: 345px    margin: 0 auto;
  }
}

.game__top-stats {
  position: fixed;
  top: 20px;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 0 20px;
  pointer-events: none;
}

.game__stats {
  display: flex;
  gap: 12px;
  justify-content: center;

  &-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background: rgba(27, 24, 41, 0.9);
    backdrop-filter: blur(15px);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);

    img {
      width: 20px;
      height: 20px;
    }

    p {
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
