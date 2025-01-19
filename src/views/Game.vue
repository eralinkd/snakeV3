<template>
  <div class="game">
    <div class="game__top-bar" v-if="!isGameStarted">
      <div class="game__top-bar-balance">
        <img :src="Scoin" alt="balance" />
        <p>120к</p>
      </div>
      <div class="game__top-bar-right">
        <div class="game__top-bar-exchange-rate">
          <div><img :src="usdt" alt="balance" />1</div>
          <div>=</div>
          <div><img :src="Scoin" alt="balance" />20к</div>
        </div>
        <div class="game__top-bar-info">
          <img :src="info" alt="info" />
        </div>
      </div>
    </div>
    <div class="game__main" v-if="!isGameStarted">
      <div class="game__main-left">
        <div class="game__main-left-heart">
          <img :src="heart" alt="heart" />
          <p>5</p>
        </div>
        <div class="game__main-left-energy">
          <img :src="energy" alt="energy" />
          <p>100</p>
        </div>
        <div class="game__main-left-equipment first" @click="router.push('/inventory')">
          <img :src="helmet" alt="helmet" />
        </div>
        <div class="game__main-left-equipment" @click="router.push('/inventory')">
          <img :src="armor" alt="armor" />
        </div>
        <div class="game__main-left-equipment" @click="router.push('/inventory')">
          <img :src="shield" alt="shield" />
        </div>
        <div class="game__main-left-equipment" @click="router.push('/equipment')">
          <img :src="sword" alt="sword" />
        </div>
      </div>
      <div class="game__main-snake" @click="startGame">
        <img :src="snake" alt="snake" />
      </div>
      <div class="game__main-right">
        <div>
          <img :src="energyBoost" alt="energyBoost" />
          <p>4:59</p>
        </div>
        <div>
          <img :src="incomeBoost" alt="incomeBoost" />
          <p>4:59</p>
        </div>
        <div class="game__main-right__inventory" @click="router.push('/inventory')">
          <img :src="inventory" alt="inventory" />
        </div>
      </div>
    </div>
    <div class="game__bottom-bar" v-if="isGameStarted"></div>
    <div 
      id="game-container" 
      @touchmove.prevent
      @touchstart.prevent
      :class="{ 'visible': isGameStarted }"
    ></div>
    <!-- <BaseButton 
      class="start-button" 
      :class="{ hidden: isGameStarted }"
      @click="startGame"
    >
      Начать игру
    </BaseButton> -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
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

const router = useRouter()

const isGameStarted = ref(false)
let game = null
let snakeScene = null

const startGame = () => {
  if (isGameStarted.value) return
  
  isGameStarted.value = true
  // Запускаем игру после небольшой задержки для анимации
  setTimeout(() => {
    if (snakeScene) {
      snakeScene.startGame()
    }
  }, 100)
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
  })
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

      &.first {
        margin-top: 12px;
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
</style>