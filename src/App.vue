<template>
  <div class="wrapper">
    <main class="main">
      <router-view class="router-content" />
    </main>
    <Navigation />
  </div>
</template>

<script>
import Navigation from '@/components/Navigation.vue'

export default {
  name: 'App',
  components: {
    Navigation,
  },
}
</script>

<style scoped lang="scss">
@use './styles/variables.scss' as *;

.main {
  padding: 0 16px;
}
.router-content {
  padding-bottom: 134px; // отступ от нижнего края экрана для навигации
  @media (max-width: $smallBreakpoint) {
    padding-bottom: 96px;
  }
}
</style>
