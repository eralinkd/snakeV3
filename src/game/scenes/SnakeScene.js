import snakeSprite from '@/assets/sprites/snake.png'

export default class SnakeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SnakeScene' })
    this.snake = null
    this.currentLane = 1
    this.lanePositions = [117, 350, 583]
    this.coins = []
    this.coinSpawnTimer = null
    this.isGameActive = false
    this.touchStartX = 0
    this.swipeThreshold = 50 // Минимальное расстояние для свайпа
  }

  preload() {
    this.load.spritesheet('snake', snakeSprite, {
      frameWidth: 700,
      frameHeight: 1200
    })
  }

  create() {
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

    // Клавиатура
    this.input.keyboard.on('keydown-LEFT', () => this.moveLane('left'))
    this.input.keyboard.on('keydown-RIGHT', () => this.moveLane('right'))

    // Свайпы
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

    // Отключаем стандартный скролл страницы при свайпах
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        pointer.event.preventDefault()
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

  update() {
    if (this.isGameActive) {
      this.checkCoinCollision()
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