<template>
  <div class="minigames">
    <h1>Зарабатывайте, играя в мини-игры!</h1>
    <div class="minigames__list">
      <div class="minigames__item" @click="router.push('/minigames/minesweeper')">
        <img :src="minesweeper" alt="Сапёр" />
        <h2>Сапёр</h2>
      </div>
      <div class="minigames__item">
        <img :src="crash" alt="Сапёр" />
        <h2>Crash</h2>
      </div>
      <div class="minigames__item">
        <img :src="coinflip" alt="Сапёр" />
        <h2>Coinflip</h2>
      </div>
      <div class="minigames__item">
        <img :src="roulette" alt="Сапёр" />
        <h2>Рулетка</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import minesweeper from '@/assets/games/minigames/miner.png'
import crash from '@/assets/games/minigames/crash.png'
import coinflip from '@/assets/games/minigames/coinflip.png'
import roulette from '@/assets/games/minigames/roulette.png'

const router = useRouter()
</script>

<style scoped lang="scss">
.minigames {
  padding: 24px 15px 134px 15px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  h1 {
    font-family: Montserrat;
    font-size: 24px;
    font-weight: 700;
    line-height: 36px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: #fff;
  }

  .minigames__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .minigames__item {
    // width: 100%;
    height: 100%;
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);
    border-radius: 16px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 1px 1px 16px 1px;
    color: rgb(255, 255, 255);
    font-family: Montserrat;
    font-size: 16px;
    font-weight: 700;
    line-height: 150%;
    letter-spacing: 0px;
    text-align: left;

    h2 {
      align-self: flex-start;
      padding-left: 16px;
    }

    img {
      width: 100%;
    }
  }
}
</style>
