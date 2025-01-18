import snakeSprite from '@/assets/sprites/snake.png'
import snakeBg from '@/assets/games/snake/bg.png'
import coin from '@/assets/games/snake/coin.svg'
import rock from '@/assets/games/snake/rock.svg'

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
    this.objectSpeed = 3000 // Время движения объектов в миллисекундах
    // Упрощенная формула для скорости фона:
    // Делим общее расстояние на время в секундах и дополнительно замедляем
    this.scrollSpeed = ((window.innerHeight + 100) / (this.objectSpeed / 1000)) / 90
    this.isBackgroundMoving = false // Добавляем флаг для контроля движения фона
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
    // Заменяем обычное изображение на tileSprite для возможности скроллинга
    this.background = this.add.tileSprite(
      window.innerWidth/2,
      window.innerHeight/2,
      window.innerWidth,
      window.innerHeight,
      'background'
    )
    this.background.setDisplaySize(window.innerWidth, window.innerHeight)

    // Создаем белый прямоугольник для вспышки на весь экран
    this.flashRect = this.add.rectangle(
      window.innerWidth/2,
      window.innerHeight/2,
      window.innerWidth,
      window.innerHeight,
      0xFFFFFF
    )
    this.flashRect.setAlpha(0)

    // Обновляем позиции дорожек для полноэкранного режима
    const width = window.innerWidth
    this.lanePositions = [width * 0.167, width * 0.5, width * 0.833]

    this.createSnake()
    this.setupControls()

    // Добавляем обработчик клика для перезапуска
    this.input.on('pointerdown', () => {
      if (!this.isGameActive && this.snake.y === window.innerHeight/2) {
        this.restartGame()
      }
    })

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', () => this.handleResize())
  }

  createSnake() {
    this.snake = this.add.sprite(
      this.lanePositions[1],
      window.innerHeight + 400,
      'snake'
    )
    
    const baseHeight = 1200
    const targetHeight = window.innerHeight * 0.25
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
          this.isBackgroundMoving = true // Активируем движение фона только после анимации змеи
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

    const lane = Phaser.Math.Between(0, 2)
    const x = this.lanePositions[lane]

    const coin = this.add.image(x, 0, 'coin')
    
    const baseCoinSize = 100
    const targetCoinSize = window.innerHeight * 0.05
    const coinScale = targetCoinSize / baseCoinSize
    
    coin.setScale(coinScale)
    this.coins.push(coin)

    this.tweens.add({
      targets: coin,
      y: window.innerHeight + 100, // Немного ниже экрана
      duration: this.objectSpeed,
      ease: 'Linear',
      onComplete: () => {
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

    const obstacle = this.add.image(x, 0, 'rock')
    
    const baseRockSize = 100
    const targetRockSize = window.innerHeight * 0.04
    const rockScale = targetRockSize / baseRockSize
    
    obstacle.setScale(rockScale)
    this.obstacles.push(obstacle)

    this.tweens.add({
      targets: obstacle,
      y: window.innerHeight + 100,
      duration: this.objectSpeed,
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
    this.isBackgroundMoving = false // Останавливаем движение фона при столкновении
    
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
    if (this.isGameActive && this.isBackgroundMoving) { // Проверяем оба флага
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
    // Обновляем позиции дорожек
    const width = window.innerWidth
    this.lanePositions = [width * 0.167, width * 0.5, width * 0.833]
    
    // Обновляем размер змеи
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

    // Обновляем размер фона как tileSprite
    this.background.setSize(window.innerWidth, window.innerHeight)
    this.background.setPosition(window.innerWidth/2, window.innerHeight/2)
    this.background.setDisplaySize(window.innerWidth, window.innerHeight)
    
    this.flashRect.setPosition(window.innerWidth/2, window.innerHeight/2)
    this.flashRect.setSize(window.innerWidth, window.innerHeight)

    // Обновляем размер существующих монеток
    const baseCoinSize = 100
    const targetCoinSize = window.innerHeight * 0.05
    const coinScale = targetCoinSize / baseCoinSize
    
    this.coins.forEach(coin => {
      coin.setScale(coinScale)
    })
    
    // Обновляем размер существующих препятствий
    const baseRockSize = 100
    const targetRockSize = window.innerHeight * 0.04
    const rockScale = targetRockSize / baseRockSize
    
    this.obstacles.forEach(obstacle => {
      obstacle.setScale(rockScale)
    })

    // Обновляем скорость скролла при изменении размера экрана
    this.scrollSpeed = ((window.innerHeight + 100) / (this.objectSpeed / 1000)) / 20
  }
} 