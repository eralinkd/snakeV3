import snakeSprite from '@/assets/sprites/leagues/snake_1_0.png'
import snakeSprite25 from '@/assets/sprites/progress/snake_1_25.png'
import snakeSprite50 from '@/assets/sprites/progress/snake_1_50.png'
import snakeSprite75 from '@/assets/sprites/progress/snake_1_75.png'
import snakeBg from '@/assets/games/snake/bg.png'
import coin from '@/assets/games/snake/coin.png'
import rock from '@/assets/games/snake/rock.png'
import helmetSprite from '@/assets/sprites/armor/helmet.png'
import chestplateSprite from '@/assets/sprites/armor/chestplate.png'
import shieldSprite from '@/assets/sprites/armor/shield.png'
import swordSprite from '@/assets/sprites/armor/sword.png'

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
  }

  preload() {
    this.load.on('filecomplete', (key, type, data) => {
      const texture = this.textures.get(key)
      console.log('Loaded:', key, {
        type,
        textureWidth: texture.source[0].width,
        textureHeight: texture.source[0].height,
        expectedFrames: Math.floor(texture.source[0].width / 143)
      })
    })

    this.load.on('loaderror', (file) => {
      console.error('Error loading:', file.key, 'Source:', file.url)
    })

    const config = {
      frameWidth: 143,
      frameHeight: 450,
      spacing: 0,
      margin: 0
    }

    const snakeSprites = {
      'snake_0': snakeSprite,
      'snake_25': snakeSprite25,
      'snake_50': snakeSprite50,
      'snake_75': snakeSprite75
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
          console.log(`${prefix}${key} dimensions:`, {
            width: img.width,
            height: img.height,
            expectedFrames: Math.floor(img.width / 143)
          })
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
        
        console.log(`${prefix}Texture ${key}:`, {
          totalWidth,
          height: texture.source[0].height,
          expectedFrames
        })
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

    this.createSnake()
    this.setupControls()

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
    this.snake = this.add.sprite(
      this.lanePositions[1],
      window.innerHeight + 400,
      'snake_0'
    )
    
    const baseHeight = 450
    const targetHeight = window.innerHeight * 0.3
    const scale = targetHeight / baseHeight

    this.snake.setScale(scale)

    const snakeTypes = ['snake_0', 'snake_25', 'snake_50', 'snake_75']
    
    snakeTypes.forEach(type => {
      const texture = this.textures.get(type)
      const totalWidth = texture.source[0].width
      const frameCount = Math.floor(totalWidth / 143)

      console.log(`Creating animation for ${type}:`, {
        totalWidth,
        frameCount
      })

      if (frameCount > 0) {
        this.anims.create({
          key: `${type}Anim`,
          frames: this.anims.generateFrameNumbers(type, {
            start: 0,
            end: frameCount - 1
          }),
          frameRate: 30,
          repeat: -1,
          duration: 2500
        })
      } else {
        console.error(`Invalid frame count for ${type}: ${frameCount}`)
      }
    })

    Object.keys(this.armorSprites).forEach(type => {
      const sprite = this.add.sprite(this.snake.x, this.snake.y, type.toLowerCase())
      sprite.setScale(this.snake.scale)
      sprite.setVisible(false)
      sprite.setDepth(1)
      this.armorSprites[type] = sprite

      const texture = this.textures.get(type.toLowerCase())
      const totalWidth = texture.source[0].width
      const frameCount = Math.floor(totalWidth / 143)

      console.log(`Armor: Creating animation for ${type.toLowerCase()}:`, {
        totalWidth,
        frameCount
      })

      if (frameCount > 0) {
        this.anims.create({
          key: `${type.toLowerCase()}Anim`,
          frames: this.anims.generateFrameNumbers(type.toLowerCase(), {
            start: 0,
            end: frameCount - 1
          }),
          frameRate: 30,
          repeat: -1,
          duration: 2500
        })
      } else {
        console.error(`Armor: Invalid frame count for ${type.toLowerCase()}: ${frameCount}`)
      }
    })
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
    this.snake.play(`${this.currentSnakeSprite}Anim`)
    
    Object.keys(this.armorSprites).forEach(type => {
      if (this.activeArmor[type]) {
        this.armorSprites[type].play(`${type.toLowerCase()}Anim`)
      }
    })

    this.time.delayedCall(100, () => {
      const targets = [
        this.snake,
        ...Object.values(this.armorSprites).filter(sprite => sprite.visible)
      ]

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
      x: this.snake.x - 20,
      y: this.snake.y - 40,
      width: 40,
      height: 60
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

  hitObstacle() {
    if (!this.isGameActive) return

    if (this.obstacleCallback) {
      this.obstacleCallback().finally(() => {
        this.isProcessingRequest = false
        this.isCollisionProcessing = false
      })
    }
  }

  resetScene() {
    if (this.coinSpawnTimer) this.coinSpawnTimer.remove()
    if (this.obstacleSpawnTimer) this.obstacleSpawnTimer.remove()
    
    this.coins.forEach(coin => {
      coin.setActive(false)
      coin.setVisible(false)
      this.tweens.killTweensOf(coin)
    })
    this.obstacles.forEach(obstacle => {
      obstacle.setActive(false)
      obstacle.setVisible(false)
    })
    this.coins = []
    this.obstacles = []

    this.snake.stop()
    this.snake.y = window.innerHeight/2
    this.currentLane = 1
    this.snake.x = this.lanePositions[this.currentLane]
    
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
    if (!this.isGameActive) return

    if (this.isGameActive && this.isBackgroundMoving && !this.isCollisionProcessing) {
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
    this.isGameActive = false
    this.isBackgroundMoving = false
    this.isProcessingRequest = false
    
    if (this.finishCallback) {
      this.finishCallback()
    }
    this.resetScene()
  }

  handleCollision() {
    this.isCollisionProcessing = true
    
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

    const flash = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0xffffff)
    flash.setOrigin(0)
    flash.setAlpha(0.5)

    Object.keys(this.activeArmor).forEach(type => {
      if (this.activeArmor[type] && this.armorSprites[type]) {
        this.armorSprites[type].stop()
        this.tweens.add({
          targets: this.armorSprites[type],
          alpha: 0,
          scale: this.armorSprites[type].scale * 1.5,
          duration: 200,
          onComplete: () => {
            this.armorSprites[type].setVisible(false)
            this.activeArmor[type] = false
          }
        })
      }
    })

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 100,
      ease: 'Power1',
      onComplete: () => {
        flash.destroy()
        this.clearGameObjects()
        
        this.isGameActive = true
        this.isBackgroundMoving = true
        
        this.setupObjectGeneration()
        this.isCollisionProcessing = false
      }
    })
  }

  clearGameObjects() {
    if (this.coinSpawnTimer) {
      this.coinSpawnTimer.remove()
      this.coinSpawnTimer = null
    }
    if (this.obstacleSpawnTimer) {
      this.obstacleSpawnTimer.remove()
      this.obstacleSpawnTimer = null
    }

    this.coins.forEach(coin => {
      this.tweens.killTweensOf(coin)
      coin.setActive(false)
      coin.setVisible(false)
      coin.destroy()
    })
    this.coins = []

    this.obstacles.forEach(obstacle => {
      this.tweens.killTweensOf(obstacle)
      obstacle.setActive(false)
      obstacle.setVisible(false)
      obstacle.destroy()
    })
    this.obstacles = []

    this.objectPool.coins.forEach(coin => {
      if (coin.active) {
        this.tweens.killTweensOf(coin)
        coin.setActive(false)
        coin.setVisible(false)
        coin.destroy()
      }
    })
    this.objectPool.coins = []

    this.objectPool.obstacles.forEach(obstacle => {
      if (obstacle.active) {
        this.tweens.killTweensOf(obstacle)
        obstacle.setActive(false)
        obstacle.setVisible(false)
        obstacle.destroy()
      }
    })
    this.objectPool.obstacles = []

    this.createObjectPools()
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
      }
    })
  }

  setActiveArmor(armorData) {
    Object.keys(this.activeArmor).forEach(type => {
      const isActive = armorData[type]?.activated || false
      this.activeArmor[type] = isActive
      const sprite = this.armorSprites[type]
      
      if (sprite) {
        sprite.setVisible(isActive)
        if (isActive && this.isGameActive) {
          sprite.play(`${type.toLowerCase()}Anim`)
        } else if (!isActive) {
          sprite.stop()
        }
      }
    })
  }

  updateSnakeSprite(progress, needProgress) {
    this.currentProgress = progress
    this.needProgress = needProgress

    const progressPercent = (progress / needProgress) * 100
    let newSpriteKey = 'snake_0'

    if (progressPercent >= 75) {
      newSpriteKey = 'snake_75'
    } else if (progressPercent >= 50) {
      newSpriteKey = 'snake_50'
    } else if (progressPercent >= 25) {
      newSpriteKey = 'snake_25'
    }

    if (this.currentSnakeSprite !== newSpriteKey) {
      this.currentSnakeSprite = newSpriteKey
      
      const currentX = this.snake.x
      const currentY = this.snake.y
      const currentScale = this.snake.scale
      const wasPlaying = this.snake.anims.isPlaying
      
      // Сохраняем текущий прогресс анимации
      const currentProgress = this.snake.anims.currentFrame ? 
        this.snake.anims.currentFrame.index / this.snake.anims.currentAnim.frames.length : 
        0

      this.snake.stop()
      this.snake.setTexture(newSpriteKey)
      this.snake.setPosition(currentX, currentY)
      this.snake.setScale(currentScale)
      
      if (wasPlaying && this.isGameActive) {
        // Запускаем новую анимацию с сохраненным прогрессом
        this.snake.play(`${newSpriteKey}Anim`)
        
        // Устанавливаем текущий кадр на основе сохраненного прогресса
        const newAnim = this.snake.anims.currentAnim
        const targetFrame = Math.floor(currentProgress * newAnim.frames.length)
        this.snake.anims.setProgress(currentProgress)
      }
    }
  }
} 