import snakeSprite from '@/assets/sprites/snake.png'
import snakeBg from '@/assets/games/snake/bg.png'
import coin from '@/assets/games/snake/coin.png'
import rock from '@/assets/games/snake/rock.png'

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
    this.isProcessingCollision = false
    this.isProcessingRequest = false
    this.lastCollisionTime = 0
    this.collisionCooldown = 500
    this.collectedCoins = new Set()
  }

  preload() {
    this.load.spritesheet('snake', snakeSprite, {
      frameWidth: 700,
      frameHeight: 1200
    })
    this.load.image('background', snakeBg)
    this.load.image('coin', coin)
    this.load.image('rock', rock)
  }

  create() {
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
      'snake'
    )
    
    const baseHeight = 1200
    const targetHeight = window.innerHeight * 0.3
    const scale = targetHeight / baseHeight

    this.snake.setScale(scale)

    this.anims.create({
      key: 'snakeAnim',
      frames: this.anims.generateFrameNumbers('snake', {
        start: 0,
        end: 29
      }),
      frameRate: 30,
      repeat: -1
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
    this.snake.play('snakeAnim')
    this.time.delayedCall(100, () => {
      this.tweens.add({
        targets: this.snake,
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
    if (!this.isGameActive || this.isProcessingCollision || this.isProcessingRequest) return

    const snakeHead = {
      x: this.snake.x - 25,
      y: this.snake.y - 100,
      width: 50,
      height: 50
    }
    
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i]
      if (this.collectedCoins.has(coin)) continue

      const coinBounds = {
        x: coin.x - 20,
        y: coin.y - 20,
        width: 40,
        height: 40
      }

      if (this.checkOverlap(snakeHead, coinBounds)) {
        this.collectCoin(coin)
        break
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
    if (this.isProcessingCollision || this.isProcessingRequest) return
    
    this.isProcessingCollision = true
    this.isProcessingRequest = true
    this.collectedCoins.add(coin)

    this.tweens.killTweensOf(coin)
    this.tweens.add({
      targets: coin,
      scale: coin.scale * 1.3,
      alpha: 0,
      duration: 100,
      ease: 'Quad.easeOut',
      onComplete: async () => {
        if (this.collectCallback) {
          await this.collectCallback()
        }
        coin.destroy()
        this.isProcessingCollision = false
        this.isProcessingRequest = false
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
    if (!this.isGameActive || this.isProcessingCollision || this.isProcessingRequest) return

    const snakeHitbox = {
      x: this.snake.x - 15,
      y: this.snake.y - 60,
      width: 30,
      height: 80
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
    if (this.isProcessingCollision || this.isProcessingRequest) return
    
    this.isProcessingCollision = true
    this.isProcessingRequest = true

    this.isGameActive = false
    this.isBackgroundMoving = false
    
    if (this.coinSpawnTimer) this.coinSpawnTimer.remove()
    if (this.obstacleSpawnTimer) this.obstacleSpawnTimer.remove()

    this.snake.stop()
    this.tweens.killAll()

    if (this.obstacleCallback) {
      this.obstacleCallback()
    }

    this.flashRect.setAlpha(1)
    this.tweens.add({
      targets: this.flashRect,
      alpha: 0,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        if (this.finishCallback) {
          this.finishCallback()
        }
        this.resetScene()
      }
    })
  }

  resetScene() {
    if (this.coinSpawnTimer) this.coinSpawnTimer.remove()
    if (this.obstacleSpawnTimer) this.obstacleSpawnTimer.remove()
    
    this.coins.forEach(coin => {
      coin.setActive(false)
      coin.setVisible(false)
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
    
    this.isGameActive = false
    this.isBackgroundMoving = false
    this.lastObstacleLane = null
    
    this.frameCount = 0
    this.collectedCoins.clear()
    this.lastCollisionTime = 0
    this.isProcessingCollision = false
    this.isProcessingRequest = false
  }

  restartGame() {
    this.resetScene()
    this.startGame()
  }

  update() {
    if (this.isGameActive && this.isBackgroundMoving) {
      this.background.tilePositionY -= this.scrollSpeed
      this.checkCoinCollision()
      this.checkObstacleCollision()
    }
  }

  moveLane(direction) {
    if (!this.isGameActive) return

    if (direction === 'left' && this.currentLane > 0) {
      this.currentLane--
    } else if (direction === 'right' && this.currentLane < 2) {
      this.currentLane++
    }

    this.tweens.add({
      targets: this.snake,
      x: this.lanePositions[this.currentLane],
      duration: 300,
      ease: 'Cubic.easeOut'
    })
  }

  handleResize() {
    const width = window.innerWidth
    this.lanePositions = [width * 0.167, width * 0.5, width * 0.833]
    
    const baseHeight = 1200
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
    
    if (this.finishCallback) {
      this.finishCallback()
    }
    this.resetScene()
  }
} 