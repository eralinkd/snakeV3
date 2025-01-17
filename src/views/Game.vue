<template>
  <div class="game">
    <div 
      id="game-container" 
      @touchmove.prevent
      @touchstart.prevent
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
  if (snakeScene) {
    isGameStarted.value = true
    snakeScene.startGame()
    document.getElementById('game-container').focus()
  }
}

onMounted(() => {
  const config = {
    type: Phaser.CANVAS,
    parent: 'game-container',
    width: 700,
    height: 1200,
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
}

#game-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  touch-action: none;
  
  canvas {
    max-width: 100%;
    max-height: 100vh;
    object-fit: contain;
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
