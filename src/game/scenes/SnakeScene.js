import snakeSprite from '@/assets/sprites/snake.png'

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
  }

  preload() {
    this.load.spritesheet('snake', snakeSprite, {
      frameWidth: 700,
      frameHeight: 1200
    })
  }

  create() {
    // Создаем белый прямоугольник для вспышки на весь экран
    this.flashRect = this.add.rectangle(350, 600, 700, 1200, 0xFFFFFF)
    this.flashRect.setAlpha(0)

    this.createSnake()
    this.setupControls()

    // Добавляем обработчик клика для перезапуска
    this.input.on('pointerdown', () => {
      if (!this.isGameActive && this.snake.y === 600) {
        this.restartGame()
      }
    })
  }

  createSnake() {
    this.snake = this.add.sprite(350, 2000, 'snake')
    this.snake.setScale(0.33)

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
        y: 600,
        duration: 2000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.isGameActive = true
          this.startCoinSpawning()
          this.startObstacleSpawning()
        }
      })
    })
  }

  startCoinSpawning() {
    // Запускаем таймер создания монеток
    this.coinSpawnTimer = this.time.addEvent({
      delay: 1000, // раз в секунду
      callback: this.spawnCoin,
      callbackScope: this,
      loop: true
    })
  }

  spawnCoin() {
    if (!this.isGameActive) return

    // Случайно выбираем дорожку для монетки
    const lane = Phaser.Math.Between(0, 2)
    const x = this.lanePositions[lane]

    // Создаем монетку (желтый круг)
    const coin = this.add.circle(x, 0, 20, 0xFFFF00)
    this.coins.push(coin)

    // Добавляем физические свойства для проверки столкновений
    this.tweens.add({
      targets: coin,
      y: 1300, // Чуть ниже экрана
      duration: 3000,
      ease: 'Linear',
      onComplete: () => {
        // Удаляем монетку, если она достигла низа экрана
        this.removeCoin(coin)
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
    const snakeBounds = this.snake.getBounds()
    
    this.coins.forEach(coin => {
      const coinBounds = coin.getBounds()
      if (Phaser.Geom.Intersects.RectangleToRectangle(snakeBounds, coinBounds)) {
        this.collectCoin(coin)
      }
    })
  }

  collectCoin(coin) {
    // Здесь можно добавить эффекты сбора монетки, очки и т.д.
    this.removeCoin(coin)
  }

  startObstacleSpawning() {
    this.obstacleSpawnTimer = this.time.addEvent({
      delay: 2000, // раз в 2 секунды
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true
    })
  }

  spawnObstacle() {
    if (!this.isGameActive) return

    const lane = Phaser.Math.Between(0, 2)
    const x = this.lanePositions[lane]

    const obstacle = this.add.rectangle(x, 0, 60, 60, 0x000000)
    this.obstacles.push(obstacle)

    this.tweens.add({
      targets: obstacle,
      y: 1300,
      duration: 3000,
      ease: 'Linear',
      onComplete: () => {
        this.removeObstacle(obstacle)
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
    const snakeBounds = this.snake.getBounds()
    
    this.obstacles.forEach(obstacle => {
      const obstacleBounds = obstacle.getBounds()
      if (Phaser.Geom.Intersects.RectangleToRectangle(snakeBounds, obstacleBounds)) {
        this.hitObstacle()
      }
    })
  }

  hitObstacle() {
    this.isGameActive = false
    
    // Останавливаем таймеры
    if (this.coinSpawnTimer) this.coinSpawnTimer.remove()
    if (this.obstacleSpawnTimer) this.obstacleSpawnTimer.remove()

    // Останавливаем анимацию змеи
    this.snake.stop()
    
    // Останавливаем все текущие движения объектов
    this.tweens.killAll()
    
    // Останавливаем все монетки и препятствия
    this.coins.forEach(coin => {
      this.tweens.killTweensOf(coin)
    })
    this.obstacles.forEach(obstacle => {
      this.tweens.killTweensOf(obstacle)
    })

    // Создаем вспышку
    this.flashRect.setAlpha(1)
    this.tweens.add({
      targets: this.flashRect,
      alpha: 0,
      duration: 200,
      ease: 'Linear'
    })
  }

  restartGame() {
    // Очищаем все монетки и препятствия
    this.coins.forEach(coin => coin.destroy())
    this.obstacles.forEach(obstacle => obstacle.destroy())
    this.coins = []
    this.obstacles = []

    // Возвращаем змею в начальное положение
    this.snake.y = 2000
    this.currentLane = 1
    this.snake.x = this.lanePositions[this.currentLane]

    // Запускаем игру заново
    this.startGame()
  }

  update() {
    if (this.isGameActive) {
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
} 