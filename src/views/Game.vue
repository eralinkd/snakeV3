<template>
  <div class="game">
    <div 
      id="game-container" 
      @touchmove.prevent
      @touchstart.prevent
      :class="{ 'visible': isGameStarted }"
    ></div>
    <BaseButton 
      class="start-button" 
      :class="{ hidden: isGameStarted }"
      @click="startGame"
    >
      Начать игру
    </BaseButton>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Phaser from 'phaser'
import SnakeScene from '@/game/scenes/SnakeScene'
import BaseButton from '@/components/BaseButton.vue'

const isGameStarted = ref(false)
let game = null
let snakeScene = null

const startGame = () => {
  // window.Telegram.WebApp.HapticFeedback.impactOccurred('rigid');
  window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');

  isGameStarted.value = true
  // Запускаем игру после анимации появления
  setTimeout(() => {
    if (snakeScene) {
      snakeScene.startGame()
    }
  }, 1000) // Задержка равна длительности анимации появления
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
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      pixelArt: false,
      antialias: true,
      powerPreference: 'high-performance'
    },
    input: {
      keyboard: true
    }
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
  background: #1B1829;
}

#game-container {
  position: fixed;
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
  transform: scale(1.1);
  transition: all 1s ease;
  
  &.visible {
    opacity: 1;
    transform: scale(1);
  }
  
  canvas {
    width: 100%;
    height: 100vh;
    object-fit: cover;
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
