import snakeSprite from '@/assets/sprites/leagues/snake_legue_1_default.png'
import snakeSprite25 from '@/assets/sprites/progress/progress_league_1_25.png'
import snakeSprite50 from '@/assets/sprites/progress/progress_league_1_50.png'
import snakeSprite75 from '@/assets/sprites/progress/progress_league_1_75.png'
import snakeBg from '@/assets/games/snake/bg.png'
import coin from '@/assets/games/snake/coin.png'
import rock from '@/assets/games/snake/rock.png'
import helmetSprite from '@/assets/sprites/armor/helmet.png'
import chestplateSprite from '@/assets/sprites/armor/chestplate.png'
import shieldSprite from '@/assets/sprites/armor/shield.png'
import swordSprite from '@/assets/sprites/armor/sword.png'
import snakeSprite1 from '@/assets/sprites/leagues/snake_legue_1_default.png'
import snakeSprite2 from '@/assets/sprites/leagues/snake_legue_2_default.png'
import snakeSprite3 from '@/assets/sprites/leagues/snake_legue_3_default.png'
import snakeSprite1_25 from '@/assets/sprites/progress/progress_league_1_25.png'
import snakeSprite1_50 from '@/assets/sprites/progress/progress_league_1_50.png'
import snakeSprite1_75 from '@/assets/sprites/progress/progress_league_1_75.png'
import snakeSprite2_25 from '@/assets/sprites/progress/progress_league_2_25.png'
import snakeSprite2_50 from '@/assets/sprites/progress/progress_league_2_50.png'
import snakeSprite2_75 from '@/assets/sprites/progress/progress_league_2_75.png'
import snakeSprite3_25 from '@/assets/sprites/progress/progress_league_3_25.png'
import snakeSprite3_50 from '@/assets/sprites/progress/progress_league_3_50.png'
import snakeSprite3_75 from '@/assets/sprites/progress/progress_league_3_75.png'

export default class SnakeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SnakeScene' })
    this.snake = null
    this.currentLane = 1
    this.lanePositions = [117, 350, 583]
    this.coins = []
    this.obstacles = []
    this.coinSpawnTimer = null
    this.obstacleSpawnTimer = null
    this.isGameActive = false
    this.touchStartX = 0
    this.swipeThreshold = 50
    this.flashRect = null
    this.background = null
    this.objectSpeed = 3000
    this.scrollSpeed = 1.8
    this.isBackgroundMoving = false
    this.frameCount = 0
    this.objectPool = {
      coins: [],
      obstacles: []
    }
    this.lastObstacleLane = null
    this.finishCallback = null
    this.collectCallback = null
    this.obstacleCallback = null
    this.isProcessingRequest = false
    this.isCollisionProcessing = false
    this.armorSprites = {
      HELMET: null,
      CHESTPLATE: null,
      SHIELD: null,
      SWORD: null
    }
    this.activeArmor = {
      HELMET: false,
      CHESTPLATE: false,
      SHIELD: false,
      SWORD: false
    }
    this.currentProgress = 0
    this.needProgress = 0
    this.currentSnakeSprite = 'snake_0'
    this.pendingArmorUpdate = null
    this.currentLeague = 1
    
    // Если начальная лига больше 3, используем первую лигу
    this.currentLeague = this.currentLeague > 3 ? 1 : this.currentLeague

    this.isSceneReady = false
  }

  preload() {
    this.load.on('filecomplete', (key, type, data) => {
      const texture = this.textures.get(key)
    })

    this.load.on('loaderror', (file) => {
      console.error('Error loading:', file.key, 'Source:', file.url)
    })

    const config = {
      frameWidth: 200,
      frameHeight: 450,
      spacing: 0,
      margin: 0
    }

    const snakeSprites = {
      'snake_0': snakeSprite,
      'snake_25': snakeSprite25,
      'snake_50': snakeSprite50,
      'snake_75': snakeSprite75,
      'snake_1_0': snakeSprite1,
      'snake_1_25': snakeSprite1_25,
      'snake_1_50': snakeSprite1_50,
      'snake_1_75': snakeSprite1_75,
      'snake_2_0': snakeSprite2,
      'snake_2_25': snakeSprite2_25,
      'snake_2_50': snakeSprite2_50,
      'snake_2_75': snakeSprite2_75,
      'snake_3_0': snakeSprite3,
      'snake_3_25': snakeSprite3_25,
      'snake_3_50': snakeSprite3_50,
      'snake_3_75': snakeSprite3_75
    }

    const armorSprites = {
      'helmet': helmetSprite,
      'chestplate': chestplateSprite,
      'shield': shieldSprite,
      'sword': swordSprite
    }

    const checkSpriteDimensions = (sprites, prefix = '') => {
      Object.entries(sprites).forEach(([key, sprite]) => {
        const img = new Image()
        img.onload = () => {
        }
        img.src = sprite

        this.load.spritesheet(key, sprite, config)
      })
    }

    checkSpriteDimensions(snakeSprites, 'Snake: ')
    checkSpriteDimensions(armorSprites, 'Armor: ')

    this.load.image('background', snakeBg)
    this.load.image('coin', coin)
    this.load.image('rock', rock)
  }

  create() {
    const snakeTypes = ['snake_0', 'snake_25', 'snake_50', 'snake_75']
    const armorTypes = ['helmet', 'chestplate', 'shield', 'sword']
    
    const checkTextures = (types, prefix = '') => {
      types.forEach(key => {
        const texture = this.textures.get(key)
        const totalWidth = texture.source[0].width
        const expectedFrames = Math.floor(totalWidth / 143)
      })
    }

    checkTextures(snakeTypes, 'Snake: ')
    checkTextures(armorTypes, 'Armor: ')

    this.background = this.add.tileSprite(
      window.innerWidth/2,
      window.innerHeight/2,
      window.innerWidth,
      window.innerHeight,
      'background'
    )
    this.background.setDisplaySize(window.innerWidth, window.innerHeight)

    this.flashRect = this.add.rectangle(
      window.innerWidth/2,
      window.innerHeight/2,
      window.innerWidth,
      window.innerHeight,
      0xFFFFFF
    )
    this.flashRect.setAlpha(0)

    const width = window.innerWidth
    this.lanePositions = [width * 0.167, width * 0.5, width * 0.833]

    this.isSceneReady = false

    Promise.all([
        this.checkTextureLoaded('background'),
        this.checkTextureLoaded('coin'),
        this.checkTextureLoaded('rock'),
        ...Object.keys(this.armorSprites).map(type => 
            this.checkTextureLoaded(type.toLowerCase())
        ),
        this.checkTextureLoaded(`snake_${this.currentLeague}_0`)
    ]).then(() => {
        this.createSnake()
        this.setupControls()
        this.createObjectPools()
        this.isSceneReady = true
        console.log('Scene is fully loaded and ready')
    }).catch(error => {
        console.error('Error loading scene assets:', error)
    })

    this.input.on('pointerdown', () => {
      if (!this.isGameActive && this.snake.y === window.innerHeight/2) {
        this.restartGame()
      }
    })

    window.addEventListener('resize', () => this.handleResize())

    for (let i = 0; i < 5; i++) {
      const coin = this.add.image(0, 0, 'coin')
      coin.setActive(false)
      coin.setVisible(false)
      this.objectPool.coins.push(coin)

      const obstacle = this.add.image(0, 0, 'rock')
      obstacle.setActive(false)
      obstacle.setVisible(false)
      this.objectPool.obstacles.push(obstacle)
    }
  }

  createSnake() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

    this.snake = this.add.sprite(
      this.lanePositions[1],
      window.innerHeight + 400,
      `snake_${this.currentLeague}_0`
    )
    
    const baseHeight = 450
    const targetHeight = window.innerHeight * 0.3
    const scale = targetHeight / baseHeight

    this.snake.setScale(scale)
    this.snake.setDepth(10)

    // Оптимизированное создание анимаций для мобильных устройств
    for (let league = 1; league <= 3; league++) {
      const progressSteps = [0, 25, 50, 75]
      progressSteps.forEach(progress => {
        const type = `snake_${league}_${progress}`
        
        if (this.anims.exists(`${type}Anim`)) {
          this.anims.remove(`${type}Anim`)
        }

        this.anims.create({
          key: `${type}Anim`,
          frames: this.anims.generateFrameNumbers(type, {
            start: 0,
            end: 74
          }),
          frameRate: isMobile ? 24 : 30, // Уменьшаем частоту кадров на мобильных
          repeat: -1,
          duration: isMobile ? 3000 : 2500, // Увеличиваем длительность на мобильных
          ...(isMobile && {
            skipMissedFrames: true,
            delay: 0,
            yoyo: false,
            showOnStart: true,
            hideOnComplete: false
          })
        })
      })
    }

    // Аналогично для анимаций брони
    Object.keys(this.armorSprites).forEach(type => {
      const sprite = this.add.sprite(this.snake.x, this.snake.y, type.toLowerCase())
      sprite.setScale(this.snake.scale)
      sprite.setDepth(this.snake.depth + 1)
      sprite.setVisible(false)
      sprite.setAlpha(1)
      this.armorSprites[type] = sprite

      const animKey = `${type.toLowerCase()}Anim`
      if (this.anims.exists(animKey)) {
        this.anims.remove(animKey)
      }

      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers(type.toLowerCase(), {
          start: 0,
          end: 74
        }),
        frameRate: isMobile ? 24 : 30,
        repeat: -1,
        duration: isMobile ? 3000 : 2500,
        ...(isMobile && {
          skipMissedFrames: true,
          delay: 0,
          yoyo: false,
          showOnStart: true,
          hideOnComplete: false
        })
      })
    })

    this.currentSnakeSprite = `snake_${this.currentLeague}_0`
  }

  setupControls() {
    this.input.keyboard.on('keydown-LEFT', () => this.moveLane('left'))
    this.input.keyboard.on('keydown-RIGHT', () => this.moveLane('right'))

    this.input.on('pointerdown', (pointer) => {
      this.touchStartX = pointer.x
    })

    this.input.on('pointerup', (pointer) => {
      const swipeDistance = pointer.x - this.touchStartX
      if (Math.abs(swipeDistance) >= this.swipeThreshold) {
        if (swipeDistance > 0) {
          this.moveLane('right')
        } else {
          this.moveLane('left')
        }
      }
    })
  }

  startGame() {
    if (!this.isSceneReady) {
        console.log('Scene is not ready yet, delaying game start')
        this.time.delayedCall(500, () => this.startGame())
        return
    }

    if (!this.snake || this.snake.destroyed) {
        console.log('Snake not ready, recreating...')
        this.createSnake()
    }

    try {
        // Сначала запускаем анимацию змеи с текущим спрайтом
        if (this.snake && !this.snake.destroyed) {
            const currentSpriteKey = `snake_${this.currentLeague}_0`
            this.currentSnakeSprite = currentSpriteKey
            this.snake.play(`${currentSpriteKey}Anim`)
        }
        
        // Запускаем анимации брони
        Object.keys(this.armorSprites).forEach(type => {
            if (this.activeArmor[type] && this.armorSprites[type] && !this.armorSprites[type].destroyed) {
                this.armorSprites[type].play(`${type.toLowerCase()}Anim`)
            }
        })

        this.time.delayedCall(100, () => {
            const targets = [
                this.snake,
                ...Object.values(this.armorSprites).filter(sprite => sprite.visible)
            ].filter(sprite => sprite && !sprite.destroyed)

            this.tweens.add({
                targets: targets,
                y: window.innerHeight * 0.7,
                duration: 2000,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    this.isGameActive = true
                    this.isBackgroundMoving = true
                    this.startGameLoop()
                }
            })
        })
    } catch (error) {
        console.error('Error starting game:', error)
        // В случае ошибки пробуем перезапустить сцену
        this.scene.restart()
    }
  }

  startGameLoop() {
    this.obstacleSpawnTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    })

    this.coinSpawnTimer = this.time.addEvent({
      delay: 800,
      callback: () => {
        this.time.delayedCall(100, () => {
          this.spawnCoin()
        })
      },
      callbackScope: this,
      loop: true
    })
  }

  spawnCoin() {
    if (!this.isGameActive) return

    let availableLanes = [0, 1, 2]
    if (this.lastObstacleLane !== null) {
      availableLanes = availableLanes.filter(lane => lane !== this.lastObstacleLane)
    }

    const lane = Phaser.Math.RND.pick(availableLanes)
    const x = this.lanePositions[lane]

    let coin = this.objectPool.coins.find(c => !c.active)
    if (!coin) {
      coin = this.add.image(0, 0, 'coin')
      this.objectPool.coins.push(coin)
    }

    const coinScale = (window.innerHeight * 0.05) / 100
    coin.setScale(coinScale)
    coin.setPosition(x, 0)
    coin.setActive(true)
    coin.setVisible(true)
    coin.setAlpha(1)
    this.coins.push(coin)

    this.tweens.add({
      targets: coin,
      y: window.innerHeight + 100,
      duration: this.objectSpeed,
      ease: 'Linear',
      onComplete: () => {
        coin.setActive(false)
        coin.setVisible(false)
        const index = this.coins.indexOf(coin)
        if (index > -1) {
          this.coins.splice(index, 1)
        }
      }
    })
  }

  removeCoin(coin) {
    const index = this.coins.indexOf(coin)
    if (index > -1) {
      this.coins.splice(index, 1)
      coin.destroy()
    }
  }

  checkCoinCollision() {
    if (!this.isGameActive || this.isProcessingRequest) return

    const snakeHead = {
      x: this.snake.x - 25,
      y: this.snake.y - 100,
      width: 50,
      height: 50
    }
    
    for (const coin of this.coins) {
      if (!coin.active) continue

      const coinBounds = {
        x: coin.x - 20,
        y: coin.y - 20,
        width: 40,
        height: 40
      }

      if (this.checkOverlap(snakeHead, coinBounds)) {
        this.collectCoin(coin)
        return
      }
    }
  }

  checkOverlap(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    )
  }

  collectCoin(coin) {
    if (this.isProcessingRequest) return
    this.isProcessingRequest = true

    this.tweens.killTweensOf(coin)
    this.tweens.add({
      targets: coin,
      scale: coin.scale * 1.3,
      alpha: 0,
      duration: 100,
      ease: 'Quad.easeOut',
      onComplete: () => {
        coin.setActive(false)
        coin.setVisible(false)
        const index = this.coins.indexOf(coin)
        if (index > -1) {
          this.coins.splice(index, 1)
        }

        if (this.collectCallback) {
          this.collectCallback().finally(() => {
            this.isProcessingRequest = false
          })
        } else {
          this.isProcessingRequest = false
        }
      }
    })
  }

  startObstacleSpawning() {
    this.obstacleSpawnTimer = this.time.addEvent({
      delay: 2000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    })
  }

  spawnObstacle() {
    if (!this.isGameActive) return

    const lane = Phaser.Math.Between(0, 2)
    const x = this.lanePositions[lane]

    let obstacle = this.objectPool.obstacles.find(o => !o.active)
    if (!obstacle) {
      obstacle = this.add.image(0, 0, 'rock')
      this.objectPool.obstacles.push(obstacle)
    }

    const rockScale = (window.innerHeight * 0.04) / 58
    obstacle.setScale(rockScale)
    obstacle.setPosition(x, 0)
    obstacle.setActive(true)
    obstacle.setVisible(true)
    this.obstacles.push(obstacle)

    this.lastObstacleLane = lane

    this.tweens.add({
      targets: obstacle,
      y: window.innerHeight + 100,
      duration: this.objectSpeed,
      ease: 'Linear',
      onComplete: () => {
        obstacle.setActive(false)
        obstacle.setVisible(false)
        const index = this.obstacles.indexOf(obstacle)
        if (index > -1) {
          this.obstacles.splice(index, 1)
        }
      }
    })
  }

  removeObstacle(obstacle) {
    const index = this.obstacles.indexOf(obstacle)
    if (index > -1) {
      this.obstacles.splice(index, 1)
      obstacle.destroy()
    }
  }

  checkObstacleCollision() {
    if (!this.isGameActive || this.isProcessingRequest) return

    const snakeHitbox = {
      x: this.snake.x - 15,
      y: this.snake.y - 80,
      width: 30,
      height: 40
    }
    
    for (const obstacle of this.obstacles) {
      const obstacleHitbox = {
        x: obstacle.x - 15,
        y: obstacle.y - 15,
        width: 30,
        height: 30
      }

      if (this.checkOverlap(snakeHitbox, obstacleHitbox)) {
        this.hitObstacle()
        return
      }
    }
  }

  /**
   * Аналогично collectCoin: не отправляем повторный запрос, пока не завершён предыдущий.
   * По завершении запроса вызываем handleCollision(), затем, если сервер даёт обновлённую броню,
   * вызываем setActiveArmor(...).
   */
  hitObstacle() {
    if (!this.isGameActive || this.isProcessingRequest) return
    this.isProcessingRequest = true

    if (this.obstacleCallback) {
      this.obstacleCallback()
        .then((response) => {
          console.log('Obstacle collision response:', response)
          if (response && response.content) {
            const [action, brokenArmor] = response.content.split('|')
            if (action === 'obstacle' && brokenArmor) {
              const armorType = brokenArmor.toUpperCase()
              console.log('Armor broken:', armorType)
              
              this.pendingArmorUpdate = armorType
            }
          }
          this.handleCollision()
        })
        .catch(error => {
          console.error('Error in obstacle collision:', error)
          this.handleCollision()
        })
        .finally(() => {
          this.isProcessingRequest = false
          this.isCollisionProcessing = false
        })
    } else {
      this.handleCollision()
      this.isProcessingRequest = false
    }
  }

  resetScene() {
    if (this.coinSpawnTimer) {
        this.coinSpawnTimer.remove()
        this.coinSpawnTimer = null
    }
    if (this.obstacleSpawnTimer) {
        this.obstacleSpawnTimer.remove()
        this.obstacleSpawnTimer = null
    }
    
    this.coins.forEach(coin => {
        if (coin && !coin.destroyed) {
            coin.setActive(false)
            coin.setVisible(false)
            this.tweens.killTweensOf(coin)
        }
    })
    this.obstacles.forEach(obstacle => {
        if (obstacle && !obstacle.destroyed) {
            obstacle.setActive(false)
            obstacle.setVisible(false)
        }
    })
    this.coins = []
    this.obstacles = []

    if (this.snake && !this.snake.destroyed) {
        this.snake.stop()
        this.snake.y = window.innerHeight/2
        this.currentLane = 1
        this.snake.x = this.lanePositions[this.currentLane]
    }
    
    this.frameCount = 0
    this.isProcessingRequest = false
    this.isGameActive = false
    this.isBackgroundMoving = false
    this.lastObstacleLane = null
  }

  restartGame() {
    this.resetScene()
    this.startGame()
  }

  update() {
    if (!this.isGameActive || !this.background || !this.scene.isActive()) return

    if (this.isGameActive && this.isBackgroundMoving) {
      this.background.tilePositionY -= this.scrollSpeed
      this.updateArmorPosition()
      
      if (!this.isProcessingRequest) {
        this.checkCoinCollision()
        this.checkObstacleCollision()
      }
    }
  }

  moveLane(direction) {
    if (!this.isGameActive) return

    if (direction === 'left' && this.currentLane > 0) {
      this.currentLane--
    } else if (direction === 'right' && this.currentLane < 2) {
      this.currentLane++
    }

    const newX = this.lanePositions[this.currentLane]
    
    this.tweens.add({
      targets: [this.snake, ...Object.values(this.armorSprites).filter(sprite => sprite.visible)],
      x: newX,
      duration: 300,
      ease: 'Cubic.easeOut'
    })
  }

  handleResize() {
    const width = window.innerWidth
    this.lanePositions = [width * 0.167, width * 0.5, width * 0.833]
    
    const baseHeight = 450
    const targetHeight = window.innerHeight * 0.25
    const scale = targetHeight / baseHeight
    
    if (this.snake) {
      this.snake.setScale(scale)
      this.snake.x = this.lanePositions[this.currentLane]
      if (this.isGameActive) {
        this.snake.y = window.innerHeight * 0.7
      }
    }

    this.background.setSize(window.innerWidth, window.innerHeight)
    this.background.setPosition(window.innerWidth/2, window.innerHeight/2)
    this.background.setDisplaySize(window.innerWidth, window.innerHeight)
    
    this.flashRect.setPosition(window.innerWidth/2, window.innerHeight/2)
    this.flashRect.setSize(window.innerWidth, window.innerHeight)

    const baseCoinSize = 100
    const targetCoinSize = window.innerHeight * 0.05
    const coinScale = targetCoinSize / baseCoinSize
    
    this.coins.forEach(coin => {
      coin.setScale(coinScale)
    })
    
    const baseRockSize = 100
    const targetRockSize = window.innerHeight * 0.04
    const rockScale = targetRockSize / baseRockSize
    
    this.obstacles.forEach(obstacle => {
      obstacle.setScale(rockScale)
    })

    Object.values(this.armorSprites).forEach(sprite => {
      if (sprite) {
        sprite.setScale(scale)
        if (sprite.visible) {
          sprite.x = this.lanePositions[this.currentLane]
          sprite.y = this.snake.y
        }
      }
    })
  }

  setFinishCallback(callback) {
    this.finishCallback = callback
  }

  setCollectCallback(callback) {
    this.collectCallback = callback
  }

  setObstacleCallback(callback) {
    this.obstacleCallback = callback
  }

  forceGameEnd() {
    if (this.coinSpawnTimer) {
        this.coinSpawnTimer.remove()
        this.coinSpawnTimer = null
    }
    if (this.obstacleSpawnTimer) {
        this.obstacleSpawnTimer.remove()
        this.obstacleSpawnTimer = null
    }

    // Останавливаем все анимации и твины
    this.tweens.killAll()
    this.anims.pauseAll()

    // Очищаем все игровые объекты, кроме змеи
    this.clearGameObjectsExceptSnake()

    this.isGameActive = false
    this.isBackgroundMoving = false
    this.isProcessingRequest = false
    
    if (this.finishCallback) {
        this.finishCallback()
    }

    this.resetScene()
  }

  handleCollision() {
    // Проверяем, активна ли сцена
    if (!this.scene?.systems?.isActive) {
        console.log('Scene is not active, skipping collision handling')
        return
    }

    if (this.coinSpawnTimer) {
        this.coinSpawnTimer.remove()
        this.coinSpawnTimer = null
    }
    if (this.obstacleSpawnTimer) {
        this.obstacleSpawnTimer.remove()
        this.obstacleSpawnTimer = null
    }

    this.isGameActive = false
    this.isBackgroundMoving = false

    this.tweens.killAll()
    this.anims.pauseAll()

    // Создаем flash-эффект только если сцена активна
    const flash = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0xffffff)
    flash.setOrigin(0)
    flash.setAlpha(0.5)

    // Обрабатываем сломанную броню
    const brokenArmorType = this.pendingArmorUpdate
    if (brokenArmorType && this.activeArmor[brokenArmorType] && this.armorSprites[brokenArmorType]) {
        console.log('Removing broken armor:', brokenArmorType)
        this.armorSprites[brokenArmorType].stop()
        this.tweens.add({
            targets: this.armorSprites[brokenArmorType],
            alpha: 0,
            scale: this.armorSprites[brokenArmorType].scale * 1.5,
            duration: 200,
            onComplete: () => {
                if (this.scene?.systems?.isActive) {  // Проверяем снова перед изменением состояния
                    this.armorSprites[brokenArmorType].setVisible(false)
                    this.activeArmor[brokenArmorType] = false
                }
            }
        })
    }

    this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 100,
        ease: 'Power1',
        onComplete: () => {
            if (!this.scene?.systems?.isActive) {  // Проверяем снова
                return
            }

            flash.destroy()
            
            // Сохраняем текущую позицию змеи
            const currentX = this.snake ? this.snake.x : this.lanePositions[this.currentLane]
            const currentY = this.snake ? this.snake.y : window.innerHeight * 0.7
            
            // Очищаем объекты, кроме змеи и брони
            this.clearGameObjectsExceptSnake()
            
            // Пересоздаем змею на той же позиции
            if (!this.snake || this.snake.destroyed) {
                this.createSnake()
                this.snake.setPosition(currentX, currentY)
            }
            
            this.isGameActive = true
            this.isBackgroundMoving = true
            
            this.pendingArmorUpdate = null
            
            this.setupObjectGeneration()
            this.anims.resumeAll()
            
            // Запускаем анимацию змеи
            if (this.snake && !this.snake.destroyed) {
                this.snake.play(`${this.currentSnakeSprite}Anim`)
            }

            if (this.scene?.systems?.isActive) {
                this.isCollisionProcessing = false
            }
        }
    })
  }

  // Новый метод для очистки объектов, кроме змеи
  clearGameObjectsExceptSnake() {
    try {
        // Очищаем монеты
        this.coins?.forEach(coin => {
            if (coin?.destroy && !coin.destroyed) {
                coin.destroy()
            }
        })
        this.coins = []

        // Очищаем препятствия
        this.obstacles?.forEach(obstacle => {
            if (obstacle?.destroy && !obstacle.destroyed) {
                obstacle.destroy()
            }
        })
        this.obstacles = []

        // Очищаем пулы объектов
        this.objectPool?.coins?.forEach(coin => {
            if (coin?.destroy && !coin.destroyed) {
                coin.destroy()
            }
        })
        if (this.objectPool) {
            this.objectPool.coins = []
        }

        this.objectPool?.obstacles?.forEach(obstacle => {
            if (obstacle?.destroy && !obstacle.destroyed) {
                obstacle.destroy()
            }
        })
        if (this.objectPool) {
            this.objectPool.obstacles = []
        }

        // НЕ очищаем спрайты брони и змеи
        // Они должны оставаться активными после столкновения
    } catch (error) {
        console.error('Error during cleanup:', error)
    }
  }

  setupObjectGeneration() {
    this.obstacleSpawnTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    })

    this.coinSpawnTimer = this.time.addEvent({
      delay: 800,
      callback: () => {
        this.time.delayedCall(100, () => {
          this.spawnCoin()
        })
      },
      callbackScope: this,
      loop: true
    })
  }

  createObjectPools() {
    for (let i = 0; i < 5; i++) {
      const coin = this.add.image(0, 0, 'coin')
      coin.setActive(false)
      coin.setVisible(false)
      this.objectPool.coins.push(coin)
    }

    for (let i = 0; i < 5; i++) {
      const obstacle = this.add.image(0, 0, 'rock')
      obstacle.setActive(false)
      obstacle.setVisible(false)
      this.objectPool.obstacles.push(obstacle)
    }
  }

  updateArmorPosition() {
    Object.keys(this.armorSprites).forEach(type => {
      if (this.armorSprites[type] && this.activeArmor[type]) {
        this.armorSprites[type].x = this.snake.x
        this.armorSprites[type].y = this.snake.y
        console.log(`Updated armor position for ${type}:`, {
          x: this.snake.x,
          y: this.snake.y,
          visible: this.armorSprites[type].visible,
          active: this.activeArmor[type]
        })
      }
    })
  }

  setActiveArmor(armorData) {
    console.log('Setting active armor with data:', armorData)
    if (!Array.isArray(armorData)) {
        console.warn('Invalid armorData format:', armorData)
        return
    }

    // Проверяем, активна ли сцена
    if (!this.scene?.systems?.isActive) {
        console.log('Scene is not active, skipping armor update')
        return
    }

    console.log('Current armor state before update:', this.activeArmor)

    // Сначала деактивируем всю броню
    Object.keys(this.activeArmor).forEach(typeKey => {
        this.activeArmor[typeKey] = false
        const sprite = this.armorSprites[typeKey]
        if (sprite?.destroy && !sprite.destroyed) {
            try {
                if (sprite.anims) {
                    sprite.stop()
                }
                sprite.setVisible(false)
            } catch (e) {
                console.warn(`Could not update armor sprite ${typeKey}:`, e)
            }
        }
    })

    // Затем активируем нужную броню
    armorData.forEach(typeKey => {
        this.activeArmor[typeKey] = true
        const sprite = this.armorSprites[typeKey]
        if (sprite?.destroy && !sprite.destroyed) {
            try {
                sprite.setVisible(true)
                sprite.setAlpha(1)
                if (this.snake?.x) sprite.x = this.snake.x
                if (this.snake?.y) sprite.y = this.snake.y
                sprite.setDepth(this.snake?.depth + 1 || 11)
                
                if (sprite.anims) {
                    sprite.play(`${typeKey.toLowerCase()}Anim`)
                }
                
                console.log(`Activated armor ${typeKey}:`, {
                    visible: sprite.visible,
                    alpha: sprite.alpha,
                    playing: sprite?.anims?.isPlaying
                })
            } catch (e) {
                console.warn(`Could not activate armor sprite ${typeKey}:`, e)
            }
        }
    })

    console.log('Final armor state:', this.activeArmor)
  }

  updateSnakeSprite(progress, needProgress) {
    this.currentProgress = progress
    this.needProgress = needProgress

    const progressPercent = (progress / needProgress) * 100
    let progressSuffix = '0'

    if (progressPercent >= 75) progressSuffix = '75'
    else if (progressPercent >= 50) progressSuffix = '50'
    else if (progressPercent >= 25) progressSuffix = '25'

    const newSpriteKey = `snake_${this.currentLeague}_${progressSuffix}`

    if (this.currentSnakeSprite !== newSpriteKey) {
      this.currentSnakeSprite = newSpriteKey
      
      const currentX = this.snake.x
      const currentY = this.snake.y
      const currentScale = this.snake.scale
      const wasPlaying = this.snake.anims.isPlaying
      
      const currentProgress = this.snake.anims.currentFrame ? 
        this.snake.anims.currentFrame.index / this.snake.anims.currentAnim.frames.length : 
        0

      this.snake.stop()
      this.snake.setTexture(newSpriteKey)
      this.snake.setPosition(currentX, currentY)
      this.snake.setScale(currentScale)
      
      if (wasPlaying && this.isGameActive) {
        this.snake.play(`${newSpriteKey}Anim`)
        
        const newAnim = this.snake.anims.currentAnim
        const targetFrame = Math.floor(currentProgress * newAnim.frames.length)
        this.snake.anims.setProgress(currentProgress)
      }
    }
  }

  setInitialArmor(initialArmorData) {
    console.log('Setting initial armor:', initialArmorData)
    if (initialArmorData && initialArmorData.armor) {
      const activeArmor = []
      Object.entries(initialArmorData.armor).forEach(([key, value]) => {
        if (value.activated) {
          activeArmor.push(key.toUpperCase())
        }
      })
      this.setActiveArmor(activeArmor)
    }
  }

  shutdown() {
    // Останавливаем все таймеры
    if (this.coinSpawnTimer) {
        this.coinSpawnTimer.remove()
        this.coinSpawnTimer = null
    }
    if (this.obstacleSpawnTimer) {
        this.obstacleSpawnTimer.remove()
        this.obstacleSpawnTimer = null
    }

    // Останавливаем все анимации и твины
    if (this.tweens) {
        this.tweens.killAll()
    }
    if (this.anims) {
        this.anims.pauseAll()
    }

    // Безопасно очищаем все игровые объекты
    try {
        // Очищаем монеты
        this.coins?.forEach(coin => {
            if (coin?.destroy && !coin.destroyed) {
                coin.destroy()
            }
        })
        this.coins = []

        // Очищаем препятствия
        this.obstacles?.forEach(obstacle => {
            if (obstacle?.destroy && !obstacle.destroyed) {
                obstacle.destroy()
            }
        })
        this.obstacles = []

        // Очищаем пулы объектов
        this.objectPool?.coins?.forEach(coin => {
            if (coin?.destroy && !coin.destroyed) {
                coin.destroy()
            }
        })
        this.objectPool.coins = []

        this.objectPool?.obstacles?.forEach(obstacle => {
            if (obstacle?.destroy && !obstacle.destroyed) {
                obstacle.destroy()
            }
        })
        this.objectPool.obstacles = []

        // Останавливаем и уничтожаем спрайты брони
        Object.values(this.armorSprites || {}).forEach(sprite => {
            if (sprite?.destroy && !sprite.destroyed) {
                if (sprite.anims) {
                    try {
                        sprite.stop()
                    } catch (e) {
                        console.warn('Could not stop sprite animation:', e)
                    }
                }
                sprite.destroy()
            }
        })
        this.armorSprites = {}

        // Останавливаем и уничтожаем спрайт змеи
        if (this.snake?.destroy && !this.snake.destroyed) {
            if (this.snake.anims) {
                try {
                    this.snake.stop()
                } catch (e) {
                    console.warn('Could not stop snake animation:', e)
                }
            }
            this.snake.destroy()
            this.snake = null
        }
    } catch (error) {
        console.error('Error during cleanup:', error)
    }

    // Сбрасываем все флаги
    this.isGameActive = false
    this.isBackgroundMoving = false
    this.isProcessingRequest = false
    this.isCollisionProcessing = false
    this.currentLane = 1
    this.frameCount = 0
    this.pendingArmorUpdate = null

    // Очищаем все обработчики событий
    if (this.input?.keyboard) {
        this.input.keyboard.shutdown()
    }
    if (this.input) {
        this.input.shutdown()
    }

    // Останавливаем сцену
    if (this.scene?.systems?.isActive) {
        this.scene.stop()
    }
  }

  setLeague(league) {
    // Если лига больше 3, используем первую лигу
    this.currentLeague = league > 3 ? 1 : league
    
    // Обновляем текущий спрайт с учетом лиги
    const progressPercent = (this.currentProgress / this.needProgress) * 100
    let progressSuffix = '0'
    
    if (progressPercent >= 75) progressSuffix = '75'
    else if (progressPercent >= 50) progressSuffix = '50'
    else if (progressPercent >= 25) progressSuffix = '25'
    
    const newSpriteKey = `snake_${this.currentLeague}_${progressSuffix}`
    
    if (this.snake && !this.snake.destroyed) {
        const currentX = this.snake.x
        const currentY = this.snake.y
        const currentScale = this.snake.scale
        
        this.snake.stop()
        this.snake.setTexture(newSpriteKey)
        this.snake.setPosition(currentX, currentY)
        this.snake.setScale(currentScale)
        
        if (this.isGameActive) {
            this.snake.play(`${newSpriteKey}Anim`)
        }
    }
  }

  clearGameObjects() {
    // Очищаем монеты
    this.coins.forEach(coin => {
        if (coin && !coin.destroyed) {
            coin.destroy()
        }
    })
    this.coins = []

    // Очищаем препятствия
    this.obstacles.forEach(obstacle => {
        if (obstacle && !obstacle.destroyed) {
            obstacle.destroy()
        }
    })
    this.obstacles = []

    // Очищаем пулы объектов
    this.objectPool.coins.forEach(coin => {
        if (coin && !coin.destroyed) {
            coin.destroy()
        }
    })
    this.objectPool.coins = []

    this.objectPool.obstacles.forEach(obstacle => {
        if (obstacle && !obstacle.destroyed) {
            obstacle.destroy()
        }
    })
    this.objectPool.obstacles = []

    // Останавливаем и уничтожаем спрайты брони
    Object.values(this.armorSprites).forEach(sprite => {
        if (sprite && !sprite.destroyed) {
            sprite.stop()
            sprite.destroy()
        }
    })
    this.armorSprites = {}

    // Останавливаем и уничтожаем спрайт змеи
    if (this.snake && !this.snake.destroyed) {
        this.snake.stop()
        this.snake.destroy()
        this.snake = null
    }
  }

  checkTextureLoaded(key) {
    return new Promise((resolve, reject) => {
        if (this.textures.exists(key)) {
            resolve()
        } else {
            reject(new Error(`Texture ${key} not found`))
        }
    })
  }
} 