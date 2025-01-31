<template>
  <div class="game" :class="{ 'game--playing': isGameStarted }" v-if="gamedata">
    <!-- Упрощенный экран загрузки -->
    <div class="game-loader" v-if="isLoading">
      <div class="game-loader__spinner"></div>
    </div>
    <!-- Добавляем тестовую панель -->
    <div class="test-panel" v-if="isDev">
      <div class="test-panel__group">
        <button 
          v-for="progress in [0, 25, 50, 75]" 
          :key="progress"
          @click="testSnakeProgress(progress)"
          :class="{ active: currentTestProgress === progress }"
        >
          Progress {{ progress }}%
        </button>
      </div>
      <div class="test-panel__group">
        <button 
          v-for="league in [1, 2, 3]" 
          :key="league"
          @click="testSnakeLeague(league)"
          :class="{ active: currentTestLeague === league }"
        >
          League {{ league }}
        </button>
      </div>
    </div>
    <div class="game__top-bar" v-if="!isGameStarted">
      <div class="game__top-bar-balance">
        <img :src="Scoin" alt="balance" />
        <p>{{ gamedata.scoins }}</p>
      </div>
      <div class="game__top-bar-right">
        <div class="game__top-bar-exchange-rate">
          <div>
            <img :src="usdt" alt="balance" />
            {{ gamedata.snakeCoinInfo?.needFor1USDT == 0 ? 0 : 1 }}
          </div>
          <div>=</div>
          <div>
            <img :src="Scoin" alt="balance" />
            {{ gamedata.snakeCoinInfo?.needFor1USDT }}
          </div>
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
        <div
          v-if="gamedata.inventory?.armor.HELMET.activated"
          class="game__main-left-equipment first"
        >
          <img class="helmet" :src="helmet" alt="helmet" />
        </div>
        <div
          v-if="gamedata.inventory?.armor.CHESTPLATE.activated"
          class="game__main-left-equipment"
        >
          <img class="armor" :src="armor" alt="armor" />
        </div>
        <div v-if="gamedata.inventory?.armor.SHIELD.activated" class="game__main-left-equipment">
          <img class="shield" :src="shield" alt="shield" />
        </div>
        <div v-if="gamedata.inventory?.armor.SWORD.activated" class="game__main-left-equipment">
          <img class="sword" :src="sword" alt="sword" />
        </div>
      </div>
      <div class="game__main-snake" >
        <img :src="currentSnakeImage" alt="snake" />
      </div>
      <div class="game__main-right">
        <div @click="router.push('/shop')">
          <img :src="energyBoost" alt="energyBoost" />
          <p v-if="energyBoostTimeLeft > 0">{{ formatBoostTime(energyBoostTimeLeft) }}</p>
          <p v-else><img :src="boosterPlus" alt="plus" /></p>
        </div>
        <div @click="router.push('/shop')">
          <img :src="incomeBoost" alt="incomeBoost" />
          <p v-if="gamedata.moneyBoostTimeLeft > 0">
            {{ formatBoostTime(gamedata.moneyBoostTimeLeft) }}
          </p>
          <p v-else><img :src="boosterPlus" alt="plus" /></p>
        </div>
        <div 
          class="game__main-right__inventory" 
          :class="{ 'game__main-right__inventory--attention': gamedata?.shouldCheckInventory }"
          @click="router.push('/inventory')"
        >
          <img :src="inventory" alt="inventory" />
        </div>
      </div>
    </div>

    <div class="game__main-bottom" v-if="!isGameStarted" @click="router.push('/leagues')">
      <h2>{{ t(stageName) }}</h2>
      <div class="game__main-bottom-progress">
        <div class="game__main-bottom-progress-bar" :style="{ width: `${progressPercent}%` }"></div>
        <p class="game__main-bottom-progress-left">{{ formattedProgress }}</p>
        <p class="game__main-bottom-progress-right">{{ formattedNeedProgress }}</p>
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
          <h2 class="store-modal__title">{{ t('game.modal_noHearts_title') }}</h2>
          <p class="store-modal__description">{{ t('game.modal_noHearts_description') }}</p>
          <BaseButton @click="handleModalClose" type="button" size="small">
            {{ t('game.modal_agree_button') }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
    <BaseBottomSheet :is-open="showInfo" @update:is-open="showInfo = false">
      <div class="info-sheet">
        <h3 class="info-sheet__title">{{ t('game.info_title') }}</h3>
        <p class="info-sheet__text">{{ t('game.info_subtitle') }}</p>
        <p class="info-sheet__text">{{ t('game.info_text') }}</p>
        <div class="info-sheet__content">
          <img :src="snakeHint1" alt="hint" class="info-sheet__image" />
          <img :src="snakeHint2" alt="hint" class="info-sheet__image" />
          <img :src="snakeHint3" alt="hint" class="info-sheet__image" />
        </div>
      </div>
    </BaseBottomSheet>
    <!-- <div class="game__armor" v-if="isGameStarted && hasActiveArmor">
      <div v-if="gamedata.inventory?.armor.HELMET.activated" class="game__armor-item">
        <img class="helmet" :src="helmet" alt="helmet" />
      </div>
      <div v-if="gamedata.inventory?.armor.CHESTPLATE.activated" class="game__armor-item">
        <img class="armor" :src="armor" alt="armor" />
      </div>
      <div v-if="gamedata.inventory?.armor.SHIELD.activated" class="game__armor-item">
        <img class="shield" :src="shield" alt="shield" />
      </div>
      <div v-if="gamedata.inventory?.armor.SWORD.activated" class="game__armor-item">
        <img class="sword" :src="sword" alt="sword" />
      </div>
    </div> -->
    <BaseModal
      :isOpen="showGameEndModal"
      @update:isOpen="handleGameEndModalClose"
      className="store-modal"
    >
      <div class="store-modal__content">
        <BaseModalClose @click="handleGameEndModalClose" className="store-modal__close" />
        <div class="store-modal__frame store-modal__frame--success">
          <h2 class="store-modal__title">{{ t('game.modal_game_over_title') }}</h2>
          <p class="store-modal__description">{{ t('game.modal_game_over_description') }}</p>
          <div class="store-modal__reward">
            <p>+{{ displayCoins }}</p>
            <img :src="scoinGame" alt="coins" />
          </div>
          <p v-if="hasActiveArmor" class="store-modal__description">
            {{ t('game.modal_game_over_armor') }}
          </p>
          <div v-if="hasActiveArmor" class="store-modal__equipment">
            <div
              v-if="gamedata.inventory?.armor.HELMET.activated"
              class="store-modal__equipment-item"
            >
              <img class="helmet" :src="helmet" alt="helmet" />
            </div>
            <div
              v-if="gamedata.inventory?.armor.CHESTPLATE.activated"
              class="store-modal__equipment-item"
            >
              <img class="armor" :src="armor" alt="armor" />
            </div>
            <div
              v-if="gamedata.inventory?.armor.SHIELD.activated"
              class="store-modal__equipment-item"
            >
              <img class="shield" :src="shield" alt="shield" />
            </div>
            <div
              v-if="gamedata.inventory?.armor.SWORD.activated"
              class="store-modal__equipment-item"
            >
              <img class="sword" :src="sword" alt="sword" />
            </div>
          </div>
          <BaseButton @click="handleGameEndModalClose" type="button" size="small">{{
            t('game.modal_agree_button')
          }}</BaseButton>
        </div>
      </div>
    </BaseModal>

    <div class="start_game_button" @click="handleSnakeClick">
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Phaser from 'phaser'
import { useQuery } from '@tanstack/vue-query'
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
import scoinGame from '@/assets/game/scoin-game.png'
import boosterPlus from '@/assets/game/booster-plus.png'
import {
  getGameData,
  postGameGameEnd,
  postGameSnakeCreate,
  postGameCurrentContent,
} from '@/api/gameApi'
import BaseModal from '@/components/BaseModal.vue'
import BaseModalClose from '@/components/BaseModalClose.vue'
import BaseButton from '@/components/BaseButton.vue'
import fail from '@/assets/game/fail.png'
import BaseBottomSheet from '@/components/BaseBottomSheet.vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import snakeLegue1 from '@/assets/game/snakes/snake_legue_1_default_main.png'
import snakeLegue2 from '@/assets/game/snakes/snake_legue_2_default_main.png'
import snakeLegue3 from '@/assets/game/snakes/snake_legue_3_default_main.png'
import snakeHint1 from '@/assets/hints/snake_hint1.png'
import snakeHint2 from '@/assets/hints/snake_hint2.png'
import snakeHint3 from '@/assets/hints/snake_hint3.png'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()
const gamedata = ref(null)
const gameId = ref(null)
const isGameStarted = ref(false)
let game = null
let snakeScene = null
const showNoResourcesModal = ref(false)
const showInfo = ref(false)
const currentEnergy = ref(0)
const sessionCoins = ref(0)
const finalGameCoins = ref(0)
const energyBoostTimeLeft = ref(0)
const showGameEndModal = ref(false)
let energyInterval = null
let energyTickCounter = 0
const isLoading = ref(false)

// Добавляем определение режима разработки
const isDev = process.env.NODE_ENV === 'development'

// Добавляем состояние для тестовой панели
const currentTestProgress = ref(0)
const currentTestLeague = ref(1)

// Добавим новые переменные в setup
const clickCount = ref(0)
const clickTimer = ref(null)
const CLICK_TIMEOUT = 500 // время в мс для сброса счетчика кликов
const REQUIRED_CLICKS = 3 // количество требуемых кликов

// Функция для тестирования прогресса змеи
const testSnakeProgress = (progress) => {
  currentTestProgress.value = progress
  if (snakeScene) {
    // Используем фиксированное значение needProgress для тестов
    const testNeedProgress = 100
    snakeScene.updateSnakeSprite(progress, testNeedProgress)
  }
}

const testSnakeLeague = (league) => {
  currentTestLeague.value = league
  if (snakeScene) {
    snakeScene.setLeague(league)
  }
}

// Вычисляемое свойство для проверки авторизации
const isAuthorized = computed(() => {
  console.log('isAuthorized', !!userStore.token, !!userStore.isAuthorized)
  return !!userStore.token && !!userStore.isAuthorized
})

// Используем Vue Query для получения данных игры
const { data: gameQueryData, isError: gameDataError } = useQuery({
  queryKey: ['gameData'],
  queryFn: getGameData,
  staleTime: 30 * 60 * 1000,
  cacheTime: 35 * 60 * 1000,
})

// Обновляем gamedata при получении новых данных
watch(
  gameQueryData,
  (newData) => {
    if (newData) {
      gamedata.value = newData
      // energyBoostTimeLeft.value = newData.energyBoostTimeLeft
    }
  },
  { immediate: true },
)

// Следим за изменением статуса авторизации
watch(isAuthorized, (newValue) => {
  if (newValue && !gamedata.value) {
    // Принудительно запрашиваем данные, если их еще нет
    gameQueryData.value?.refetch?.()
  }
})

// Отслеживаем ошибки при загрузке данных
watch(gameDataError, (error) => {
  if (error) {
    console.error('Failed to fetch game data:', error)
  }
})

const handleModalClose = () => {
  showNoResourcesModal.value = false
}

// Функция для создания игры
const createGame = () => {
  if (game) {
    console.log('Game already exists, destroying...')
    game.destroy(true)
    game = null
    snakeScene = null
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    scene: SnakeScene,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      pixelArt: false,
      antialias: true,
      powerPreference: 'high-performance',
      clearBeforeRender: true,
      preserveDrawingBuffer: true
    },
    // Специальные настройки для мобильных устройств
    ...(isMobile && {
      type: Phaser.CANVAS,
      roundPixels: true,
      transparent: false,
      clearBeforeRender: true,
      desynchronized: true,
      banner: false,
      antialiasGL: false,
      maxLights: 0,
      maxTextures: 1,
      mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
      failIfMajorPerformanceCaveat: true
    })
  }

  return new Promise((resolve, reject) => {
    try {
      game = new Phaser.Game(config)
      
      const checkSceneReady = () => {
        if (!game || !game.scene) {
          setTimeout(checkSceneReady, 100)
          return
        }

        snakeScene = game.scene.getScene('SnakeScene')
        if (snakeScene) {
          // Устанавливаем лигу после создания сцены
          snakeScene.setLeague(gamedata.value?.stage?.level || 1)
          
          if (snakeScene.isSceneReady) {
            snakeScene.setFinishCallback(handleGameEnd)
            snakeScene.setCollectCallback(handleCoinCollect)
            snakeScene.setObstacleCallback(handleObstacleHit)
            console.log('Game scene initialized successfully')
            resolve()
          } else {
            setTimeout(checkSceneReady, 100)
          }
        } else {
          setTimeout(checkSceneReady, 100)
        }
      }

      game.events.once('ready', checkSceneReady)

      setTimeout(() => {
        if (!snakeScene?.isSceneReady) {
          reject(new Error('Scene initialization timeout'))
        }
      }, 5000)
    } catch (error) {
      reject(error)
    }
  })
}

// Обновляем функцию startGame
const startGame = async () => {
  if (!gamedata.value) {
    console.log('Game data not loaded yet')
    return
  }

  if (gamedata.value.energy <= 0) {
    showNoResourcesModal.value = true
    return
  }

  try {
    isLoading.value = true
    await createGame()
    isGameStarted.value = true
    sessionCoins.value = 0
    finalGameCoins.value = 0
    currentEnergy.value = gamedata.value.energy
    document.documentElement.setAttribute('data-playing', 'true')

    const response = await postGameSnakeCreate()
    if (!response?.id) {
      showNoResourcesModal.value = true
      return
    }

    gameId.value = response.id
    energyBoostTimeLeft.value = gamedata.value.energyBoostTimeLeft

    // Теперь мы точно знаем, что сцена готова
    const activeArmor = Object.entries(gamedata.value.inventory.armor)
      .filter(([_, value]) => value.activated)
      .map(([key]) => key.toUpperCase())
    
    console.log('Setting initial armor:', activeArmor)
    snakeScene.setActiveArmor(activeArmor)
    snakeScene.startGame()

    // Скрываем экран загрузки после полной инициализации
    isLoading.value = false

    // Запускаем интервал для энергии
    energyInterval = setInterval(async () => {
      if (!isGameStarted.value) return

      // Если остался буст (energyBoostTimeLeft > 0), то уменьшаем энергию в 2 раза медленнее:
      // При boostTimeLeft > 0: уменьшаем энергию каждые 2 "тики" (2 секунды).
      // Если буста нет, уменьшаем энергию каждый тик (1 секунда).
      const decrementDelay = energyBoostTimeLeft.value > 0 ? 2 : 1
      energyTickCounter++

      if (energyTickCounter >= decrementDelay) {
        energyTickCounter = 0
        currentEnergy.value--

        // Отправляем запрос на проверку состояния игры
        try {
          postGameCurrentContent(gameId.value, { content: 'check' })
            .catch(error => {
              console.error('Error checking game state:', error)
              // При ошибке останавливаем игру
              forceStopGame()
            })
        } catch (e) {
          console.error('Error sending check request:', e)
          forceStopGame()
        }

        if (currentEnergy.value <= 0) {
          try {
            await postGameCurrentContent(gameId.value, { content: 'time_out' })
          } catch (error) {
            console.error('Error sending time_out:', error)
          }
          handleGameEnd()
        }
      }
    }, 1000)
  } catch (error) {
    console.error('Error starting game:', error)
    if (game) {
      game.destroy(true)
      game = null
      snakeScene = null
    }
    isLoading.value = false // Скрываем загрузку в случае ошибки
    showNoResourcesModal.value = true
  }
}

const handleGameEnd = async () => {
  console.log('Game ending, current coins:', sessionCoins.value)
  
  try {
    if (isGameStarted.value) {
      console.log('Game was active, cleaning up...')
      
      // Сначала сохраним все важные данные
      const finalCoins = sessionCoins.value
      const currentGameId = gameId.value
      
      // Очищаем состояние игры
      isGameStarted.value = false
      document.documentElement.removeAttribute('data-playing')
      
      if (energyInterval) {
        clearInterval(energyInterval)
        energyInterval = null
      }

      // Принудительно останавливаем игру перед показом модального окна
      if (game) {
        try {
          game.destroy(true)
          game = null
          snakeScene = null
        } catch (e) {
          console.error('Error destroying game:', e)
        }
      }

      // Показываем модальное окно только если были собраны монеты
      if (finalCoins > 0) {
        finalGameCoins.value = finalCoins
        displayCoins.value = 0
        
        // Форсируем обновление DOM перед показом модального окна
        await new Promise(resolve => setTimeout(resolve, 0))
        
        console.log('Showing end game modal immediately')
        showGameEndModal.value = true
        
        // Добавляем проверку видимости модального окна
        const checkModalVisibility = () => {
          const modalElement = document.querySelector('.modal')
          console.log('Modal element exists:', !!modalElement)
          console.log('Modal element visible:', modalElement?.style.display !== 'none')
          
          if (!modalElement || modalElement.style.display === 'none') {
            console.log('Modal not visible, retrying...')
            showGameEndModal.value = false
            
            // Форсируем перерисовку
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                console.log('Retrying to show modal')
                showGameEndModal.value = true
                
                // Проверяем еще раз через небольшую задержку
                setTimeout(checkModalVisibility, 300)
              })
            })
          }
        }

        // Запускаем первую проверку
        setTimeout(checkModalVisibility, 100)
        
        // Запускаем резервную проверку через 2 секунды
        setTimeout(() => {
          if (!document.querySelector('.modal')) {
            console.log('Backup check: Modal still not visible')
            
            // Последняя попытка показать модальное окно
            showGameEndModal.value = true
          }
        }, 2000)
      }

      // Обновляем данные игры после показа модального окна
      try {
        console.log('Getting new game data...')
        const newGameData = await getGameData()
        gamedata.value = newGameData
      } catch (e) {
        console.error('Error updating game data:', e)
      }
    }
  } catch (error) {
    console.error('Error in game end:', error)
  }
}

const handleCoinCollect = async () => {
  if (!isGameStarted.value) {
    console.log('Game ended, skipping coin request.')
    return
  }

  try {
    const response = await postGameCurrentContent(gameId.value, { content: 'coin' })
    console.log('Coin collect response:', response)

    if (response.error === 'game_not_found') {
      forciblyClearGame('game_not_found')
      return
    }

    if (response.amount !== undefined) {
      const prevCoins = sessionCoins.value
      sessionCoins.value += response.amount
      console.log('Coins updated:', {
        prev: prevCoins,
        added: response.amount,
        new: sessionCoins.value,
      })
    }
    if (response.energy) {
      currentEnergy.value = response.energy
    }
    // Добавляем обновление спрайта змеи
    if (response.progressBarProgress !== undefined && response.stage?.needProgress) {
      snakeScene.updateSnakeSprite(response.progressBarProgress, response.stage.needProgress)
    }
    if (response.content === 'game_end') {
      snakeScene.forceGameEnd()
    }
  } catch (error) {
    console.error('Error getting current content:', error)
  }
}

const handleObstacleHit = async (armorType) => {
  if (!isGameStarted.value) {
    console.log('Game ended, skipping obstacle request.')
    return
  }

  try {
    const response = await postGameCurrentContent(gameId.value, { content: 'obstacle' })
    if (response.error === 'game_not_found') {
      forciblyClearGame('game_not_found')
      return
    }

    if (typeof response.amount !== 'undefined') {
      sessionCoins.value += response.amount
      console.log('Obstacle hit - coins updated:', {
        previous: sessionCoins.value - response.amount,
        added: response.amount,
        new: sessionCoins.value,
      })
    }
    if (response.energy) {
      currentEnergy.value = response.energy
    }

    // Добавляем обновление спрайта змеи
    if (response.progressBarProgress !== undefined && response.stage?.needProgress) {
      snakeScene.updateSnakeSprite(response.progressBarProgress, response.stage.needProgress)
    }

    if (response.content === 'game_end') {
      snakeScene.forceGameEnd()
    } else {
      // Обновляем броню в сцене
      if (snakeScene) {
        snakeScene.setActiveArmor(response.activatedArmor)
      }
    }

    await postGameGameEnd(gameId.value)
    forceStopGame()
  } catch (error) {
    console.error('Error in obstacle hit:', error)
  }
}

// Добавляем функцию форматирования времени
const formatBoostTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Добавляем функцию для запуска таймеров
const startBoostTimers = () => {
  const energyTimer = setInterval(() => {
    if (energyBoostTimeLeft.value > 0) {
      energyBoostTimeLeft.value--
    } else {
      clearInterval(energyTimer)
    }
  }, 1000)

  const moneyTimer = setInterval(() => {
    if (gamedata.value.moneyBoostTimeLeft > 0) {
      gamedata.value.moneyBoostTimeLeft--
    } else {
      clearInterval(moneyTimer)
    }
  }, 1000)

  // Очистка таймеров при размонтировании компонента
  onUnmounted(() => {
    clearInterval(energyTimer)
    clearInterval(moneyTimer)
  })
}

const handleGameEndModalClose = () => {
  showGameEndModal.value = false
  // Даём закрыться модалке, потом обнуляем
  setTimeout(() => {
    finalGameCoins.value = 0
    sessionCoins.value = 0
  }, 0)
  router.push('/')
}

// Добавим вычисляемое свойство для проверки наличия активной брони
const hasActiveArmor = computed(() => {
  console.log('dsadasd----------------', gamedata.value)
  return (
    gamedata.value?.inventory?.armor &&
    Object.values(gamedata.value.inventory.armor).some((item) => item.activated)
  )
})

// Добавим наблюдатель за состоянием игры для управления навигацией
watch(isGameStarted, (playing) => {
  document.documentElement.setAttribute('data-playing', playing.toString())
})

// В script setup добавим вычисляемые свойства
const stageName = computed(() => {
  return gamedata.value?.stage?.name || t('game.stage.title')
})

const progressPercent = computed(() => {
  const progress = gamedata.value?.stageProgress || 0
  const needProgress = gamedata.value?.stage?.needProgress || 100
  return Math.min((progress / needProgress) * 100, 100)
})

const formattedProgress = computed(() => {
  const progress = gamedata.value?.stageProgress || 0
  return progress >= 1000 ? `${(progress / 1000).toFixed(1)}к` : progress
})

const formattedNeedProgress = computed(() => {
  const needProgress = gamedata.value?.stage?.needProgress || 0
  return needProgress >= 1000 ? `${(needProgress / 1000).toFixed(1)}к` : needProgress
})

// Обновим вычисляемое свойство для отображения результата
const displayCoins = computed(() => {
  console.log('Displaying coins in modal:', finalGameCoins.value)
  return finalGameCoins.value
})

// Добавим функцию, которая полностью останавливает игру и очищает данные
const forciblyClearGame = (reason) => {
  console.log(`Forcibly clearing game due to: ${reason}`)
  isGameStarted.value = false
  if (energyInterval) {
    clearInterval(energyInterval)
    energyInterval = null
  }
  energyTickCounter = 0

  if (game?.value) {
    game.value.destroy(true)
    game.value = null
  }
  gamedata.value = {}
  showGameEndModal.value = false
  document.documentElement.setAttribute('data-playing', 'false')
}

// Функция для немедленной остановки игры
const forceStopGame = () => {
  if (isGameStarted.value) {
    console.log('Force stopping game')
    
    // Останавливаем все таймеры
    if (energyInterval) {
      clearInterval(energyInterval)
      energyInterval = null
    }
    energyTickCounter = 0
    
    // Останавливаем игровые процессы
    if (game && snakeScene) {
      try {
        // Синхронно останавливаем все процессы игры
        snakeScene.isGameActive = false
        snakeScene.isBackgroundMoving = false
        if (snakeScene.coinSpawnTimer) {
          snakeScene.coinSpawnTimer.remove()
          snakeScene.coinSpawnTimer = null
        }
        if (snakeScene.obstacleSpawnTimer) {
          snakeScene.obstacleSpawnTimer.remove()
          snakeScene.obstacleSpawnTimer = null
        }
        snakeScene.tweens?.killAll()
        snakeScene.anims?.pauseAll()
        snakeScene.clearGameObjects()
      } catch (e) {
        console.error('Error during force stop:', e)
      }
    }
    
    // Сбрасываем состояние
    isGameStarted.value = false
    document.documentElement.setAttribute('data-playing', 'false')
    
    // Используем sendBeacon для отправки данных при закрытии страницы
    if (gameId.value) {
      const data = new Blob([JSON.stringify({ gameId: gameId.value })], { type: 'application/json' })
      const success = navigator.sendBeacon(`/api/game/game-end/${gameId.value}`, data)
      console.log('Game end request sent:', {
        success,
        gameId: gameId.value,
        timestamp: new Date().toISOString()
      })

      // Добавляем обработчик для проверки статуса запроса
      if (success) {
        const checkResponse = async () => {
          try {
            const response = await fetch(`/api/game/status/${gameId.value}`)
            const result = await response.json()
            console.log('Game end response:', result)
          } catch (e) {
            console.error('Error checking game end status:', e)
          }
        }
        checkResponse()
      }
    }
  }
}

// Обработчик закрытия страницы
const handleBeforeUnload = (event) => {
  if (isGameStarted.value) {
    forceStopGame()
    // Показываем предупреждение пользователю
    event.preventDefault()
    event.returnValue = ''
  }
}

// Обработчик видимости страницы
const handleVisibilityChange = async () => {
  if (document.hidden && isGameStarted.value) {
    try {
      // Используем обычный асинхронный запрос для visibilitychange
      await postGameGameEnd(gameId.value)
    } catch (e) {
      console.error('Error sending game end request:', e)
    } finally {
      forceStopGame()
    }
  }
}

// Добавляем вычисляемое свойство для определения изображения змеи
const currentSnakeImage = computed(() => {
  if (!gamedata.value?.stage?.level) return snakeLegue1
  
  const league = gamedata.value.stage.level
  
  if (league > 3) return snakeLegue1
  
  switch (league) {
    case 1:
      return snakeLegue1
    case 2:
      return snakeLegue2
    case 3:
      return snakeLegue3
    default:
      return snakeLegue1
  }
})

const handleAppClose = () => {
  console.log("Telegram Mini App is closing...");
  if (isGameStarted.value) {
    // Используем комбинацию методов для максимальной надежности
    try {
      // 1. Пробуем синхронный XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/game/game-end/${gameId.value}`, false); // false для синхронного запроса
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ gameId: gameId.value }));
      
      // 2. Дублируем через sendBeacon для надежности
      const beaconData = new Blob([JSON.stringify({ gameId: gameId.value })], { 
        type: 'application/json' 
      });
      navigator.sendBeacon(`/api/game/game-end/${gameId.value}`, beaconData);
      
    } catch (e) {
      console.error('Error during force close:', e);
      
      // 3. Если предыдущие методы не сработали, пробуем fetch с keepalive
      fetch(`/api/game/game-end/${gameId.value}`, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId: gameId.value }),
      }).catch(console.error);
    } finally {
      forceStopGame();
    }
  }
}

// Добавим новую функцию для обработки кликов
const handleSnakeClick = () => {
  clickCount.value++
  
  // Очищаем предыдущий таймер если он был
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
  }
  
  // Если достигли нужного количества кликов - запускаем игру
  if (clickCount.value === REQUIRED_CLICKS) {
    clickCount.value = 0
    if (clickTimer.value) {
      clearTimeout(clickTimer.value)
    }
    startGame()
    return
  }
  
  // Устанавливаем таймер для сброса счетчика
  clickTimer.value = setTimeout(() => {
    clickCount.value = 0
  }, CLICK_TIMEOUT)
}

onMounted(async () => {
  // Загрузка данных игры
  gamedata.value = await getGameData()
  energyBoostTimeLeft.value = gamedata.value.energyBoostTimeLeft
  // Запускаем оба таймера
  startBoostTimers()

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
    snakeScene.setFinishCallback(handleGameEnd)
    snakeScene.setCollectCallback(handleCoinCollect)
    snakeScene.setObstacleCallback(handleObstacleHit)
  })

  // Добавляем слушатели событий
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('unload', forceStopGame)

  // Добавляем слушатель для Telegram WebApp
  if (window.Telegram?.WebApp) {
    console.log('Telegram WebApp is available')
    window.Telegram.WebApp.onEvent('close', handleAppClose);
    window.Telegram.WebApp.onEvent('mainButton:click', handleAppClose);
    window.Telegram.WebApp.onEvent('backButton:click', handleAppClose);
    
    // Добавляем обработчик deactivated
    window.Telegram.WebApp.onEvent('deactivated', () => {
      console.log('Telegram Mini App deactivated');
      if (isGameStarted.value) {
        try {
          // Используем базовый URL из конфига
          const baseUrl = import.meta.env.VITE_BASE_URL;
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${baseUrl}/api/game/game-end/${gameId.value}`, false);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({ gameId: gameId.value }));
        } catch (e) {
          console.error('Error during deactivation:', e);
        } finally {
          forceStopGame();
        }
      }
    });
  }
  
  // Добавляем слушатель для мобильных событий
  window.addEventListener('pagehide', handleAppClose);
  window.addEventListener('beforeunload', handleAppClose);

  // Добавляем слушатель visibilitychange
  document.addEventListener('visibilitychange', () => {
    console.log('Visibility changed:', document.visibilityState)
    if (document.visibilityState === 'visible' && showGameEndModal.value) {
      console.log('Page became visible, checking modal')
      const modalElement = document.querySelector('.modal')
      if (!modalElement || modalElement.style.display === 'none') {
        console.log('Modal not visible after page show, retrying...')
        showGameEndModal.value = false
        setTimeout(() => {
          showGameEndModal.value = true
        }, 100)
      }
    }
  })
})

onUnmounted(() => {
  if (game?.value) {
    game.value.destroy(true)
  }
  document.documentElement.removeAttribute('data-playing')
  if (energyInterval) {
    clearInterval(energyInterval)
    energyInterval = null
  }

  // Удаляем все слушатели
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('unload', forceStopGame)

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.offEvent('close', handleAppClose);
    window.Telegram.WebApp.offEvent('mainButton:click', handleAppClose);
    window.Telegram.WebApp.offEvent('backButton:click', handleAppClose);
    // Удаляем обработчик deactivated
    window.Telegram.WebApp.offEvent('deactivated', handleAppClose);
  }
  
  window.removeEventListener('pagehide', handleAppClose);
  window.removeEventListener('beforeunload', handleAppClose);
  
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
  }
})

// В watch для showGameEndModal добавим отслеживание
watch(showGameEndModal, (newValue) => {
  if (newValue) {
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

    .game__main-left-heart,
    .game__main-left-energy {
      width: 69px;
    }

    div {
      padding: 0 12px;
      gap: 10px;
      width: 100px;
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
      position: relative;
      transition: transform 0.3s ease;

      // Добавляем стили для состояния attention
      &--attention {
        animation: pulse 2s infinite;
        
        &::after {
          content: '';
          position: absolute;
          top: -5px;
          right: -5px;
          width: 15px;
          height: 15px;
          background: #FF4B4B;
          border-radius: 50%;
          border: 2px solid #1B1829;
          animation: blink 1s infinite;
        }

        &::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid #AE8BFF;
          border-radius: 8px;
          animation: borderPulse 2s infinite;
        }
      }
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
    animation: bounce 0.5s ease;

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

@keyframes bounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
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
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__image {
    width: 100%;
    height: auto;
    object-fit: contain;
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

.store-modal__equipment {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  .store-modal__equipment-item {
    width: 67px;
    height: 67px;
    background: #12101b;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;

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

.store-modal__reward {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #12101b;
  font-family: Montserrat;
  font-size: 32px;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  width: 223px;
  height: 80px;
  margin-top: 12px;
}

.game__armor {
  position: fixed;
  bottom: 30px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 0 20px;
  z-index: 100;
  pointer-events: none;

  &-item {
    width: 67px;
    height: 67px;
    background: rgba(27, 24, 41, 0.9);
    backdrop-filter: blur(15px);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);

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

// Обновим стили для App.vue через глобальный класс
:root {
  &[data-playing='true'] {
    :deep(.navigation),
    :deep(.bottom-navigation) {
      display: none !important; // Добавим !important для гарантированного скрытия
    }
  }
}

.game__main-bottom {
  position: fixed;
  bottom: 150px;
  left: 0;
  width: 100%;
  padding: 0 20px;
  z-index: 100;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  h2 {
    font-family: Montserrat;
    font-size: 24px;
    font-weight: 700;
    line-height: 36px;
    text-align: center;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    margin-bottom: 12px;
  }

  &-progress {
    position: relative;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    // overflow: hidden;
    border-radius: 8px;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.05);

    &-bar {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 30%;
      background: #ae8bff;
      border-radius: 7.5px;
      transition: width 0.3s ease;
    }

    &-left,
    &-right {
      position: absolute;
      bottom: -30px;
      font-family: Montserrat;
      font-size: 16px;
      font-weight: 700;
      line-height: 24px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
    }

    &-left {
      left: 0;
    }

    &-right {
      right: 0;
    }
  }
}

.test-panel {
  display: none !important;
  position: fixed;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 0 0 8px 8px;

  &__group {
    display: flex;
    gap: 8px;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #333;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background: #444;
    }

    &.active {
      background: #ae8bff;
    }
  }
}

.game-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #ffffff3d;
    border-top: 4px solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

.start_game_button {
  position: fixed;
  width: 100px;
  height: 100px;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  border-radius: 50%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Добавляем анимации
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@keyframes borderPulse {
  0% {
    border-color: rgba(174, 139, 255, 0.4);
  }
  50% {
    border-color: rgba(174, 139, 255, 1);
  }
  100% {
    border-color: rgba(174, 139, 255, 0.4);
  }
}
</style>
