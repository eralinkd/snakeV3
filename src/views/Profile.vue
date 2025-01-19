<template>
  <div class="profile">
    <img :src="headerBgSrc" alt="background" class="header-background" />

    <div class="header">
      <div class="topbar">
        <div class="stats">
          <div>
            <img :src="heartSrc" alt="hearts" /><span>{{ user?.health || '0' }}</span>
          </div>
          <div>
            <img :src="energySrc" alt="energy" /><span>{{ user?.energy || '0' }}</span>
          </div>
        </div>

        <div class="lang" @click="toggleLanguage">
          <img :src="planetSrc" alt="earth" />
          <span>{{ currentLanguage }}</span>
        </div>
      </div>

      <div class="info">
        <img class="avatar" :src="userData?.photo_url || avatarSrc" alt="avatar" />
        <div class="info-text">
          <p class="username">{{ userData?.first_name || 'Username' }}</p>
          <p class="scoin"><img :src="scoinSrc" alt="scoin" />{{ user?.balances?.SCOIN || '0' }}</p>
        </div>
      </div>
    </div>

    <h2 class="title">{{ $t('profile.title') }}</h2>

    <div class="friends">
      <div class="invite-block">
        <p>{{ $t('profile.invite.description', { percent: 10 }) }}</p>
        <div class="invite-container">
          <BaseButton class="invite-button" @click="handleShare">
            {{ isCopied ? $t('profile.invite.copied') : $t('profile.invite.button') }}
          </BaseButton>
          <div @click="handleCopy" class="copy-container base-button accentGrad">
            <img class="copy-icon" :src="copySrc" alt="copy" />
          </div>
        </div>
      </div>

      <div class="friend" v-for="item in user?.refs" :key="item.id">
        <div class="friend-info">
          <img :src="item.photo_url || avatarSrc" alt="avatar" />
          <div class="friend-info-text">
            <p class="username">{{ item.name }}</p>
            <p class="scoin">{{ item.balance || '0' }} SCOIN</p>
          </div>
        </div>
        <p class="income">+ {{ item.profit || '0' }}<img :src="scoinSrc" alt="scoin" /></p>
      </div>
    </div>

    <div class="quests">
      <BaseTabs v-model:activeTab="selectedQuestType" :tabs="questTabs" class="quests__tabs">
      </BaseTabs>
      <div class="quests__list">
        <div
          v-for="quest in filteredQuests"
          :key="quest.id"
          class="quest-item"
          :class="{ 'quest-item--disabled': quest.completed }"
          @click="handleQuestClick(quest)"
        >
          <div class="quest-item__info">
            <p class="quest-item__description">{{ quest.description }}</p>
            <div class="quest-item__reward">
              <span>+{{ quest.reward }}</span>
              <img :src="scoinSrc" alt="scoin" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import bg from '@/assets/profile/bg.png'
import heart from '@/assets/profile/heart.svg'
import energy from '@/assets/profile/energy.svg'
import scoin from '@/assets/profile/scoin.svg'
import planet from '@/assets/profile/planet.svg'
import avatar from '@/assets/profile/avatar.png'
import copy from '@/assets/profile/copy.svg'
import { useUserStore } from '@/stores/userStore'
import BaseButton from '@/components/BaseButton.vue'
import { ref, watch, computed, onMounted } from 'vue'
import { getUser, getUserQuests, postCompleteQuest, updateLanguage } from '@/api/userApi'
import { useQuery } from '@tanstack/vue-query'
import BaseTabs from '@/components/BaseTabs.vue'
import { useI18n } from 'vue-i18n'

const headerBgSrc = bg
const heartSrc = heart
const energySrc = energy
const scoinSrc = scoin
const planetSrc = planet
const avatarSrc = avatar
const copySrc = copy

const userId = useUserStore().userId
const message = `dsfndshfns !!!`
const shareLink = `https://t.me/share/url?url=t.me/snake_runner_dev_bot/snake_runner_dev?startapp=${userId}&text=${message}`
const copyLink = `https://t.me/snake_runner_dev_bot/snake_runner_dev?startapp=${userId}`

const isCopied = ref(false)
let timeoutId = null

const handleCopy = () => {
  navigator.clipboard.writeText(copyLink)
  isCopied.value = true

  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  timeoutId = setTimeout(() => {
    isCopied.value = false
    timeoutId = null
  }, 2000)
}

const handleShare = () => {
  window.location.href = shareLink
}

const user = ref(null)
const userData = useUserStore().userData
const userQuests = ref(null)

const { data: resp, isError } = useQuery({
  queryKey: ['user'],
  queryFn: getUser,
})

const { data: questsData, isError: questsError } = useQuery({
  queryKey: ['quests'],
  queryFn: getUserQuests,
  staleTime: 5 * 60 * 1000,
  cacheTime: 30 * 60 * 1000,
})

watch(
  resp,
  (newValue) => {
    if (!isError.value) {
      user.value = newValue
    }
  },
  { immediate: true },
)

watch(
  questsData,
  (newValue) => {
    if (!questsError.value) {
      userQuests.value = newValue
    }
  },
  { immediate: true },
)

const selectedQuestType = ref('Ежедневные')
const questTabs = [
  { name: 'Ежедневные', component: 'everyDay' },
  { name: 'Разовые', component: 'oneTime' },
]

const filteredQuests = computed(() => {
  if (!userQuests.value) return []
  const typeMap = {
    Ежедневные: 'everyDay',
    Разовые: 'oneTime',
  }
  return userQuests.value[typeMap[selectedQuestType.value]] || []
})

const handleQuestClick = (quest) => {
  // Для разовых квестов открываем ссылку в новой вкладке
  if (quest.questValue) {
    const isTelegramLink = 
      quest.questValue.startsWith('https://t.me/') || 
      quest.questValue.startsWith('tg://') ||
      quest.questValue.startsWith('t.me/')

    if (isTelegramLink) {
      // Преобразуем t.me ссылки в полный URL если нужно
      const telegramUrl = quest.questValue.startsWith('t.me/') 
        ? `https://${quest.questValue}`
        : quest.questValue
        
      window.open(telegramUrl, '_blank')
    } else {
      // Для других ссылок добавляем https:// если протокол не указан
      const url = quest.questValue.startsWith('http') 
        ? quest.questValue 
        : `https://${quest.questValue}`
        
      window.open(url, '_blank')
    }
  }

  // После открытия ссылки отправляем запрос на выполнение квеста
  postCompleteQuest(quest.id)
    .then(async () => {
      const newQuestsData = await getUserQuests()
      userQuests.value = newQuestsData
    })
    .catch((error) => {
      console.error('Error completing quest:', error)
    })
}

// Автоматическое выполнение ежедневного задания при загрузке
onMounted(async () => {
  try {
    await postCompleteQuest('everyday_join')
    const newQuestsData = await getUserQuests()
    userQuests.value = newQuestsData
  } catch (error) {
    console.error('Error completing daily quest:', error)
  }
})

const { t, locale } = useI18n()

const currentLanguage = computed(() => locale.value)

const toggleLanguage = () => {
  locale.value = locale.value === 'ru' ? 'en' : 'ru'
  // Сохраняем выбранный язык в localStorage
  localStorage.setItem('language', locale.value)
  // Обновляем язык на сервере
  updateLanguage(locale.value)
}

// Загружаем сохраненный язык при монтировании
onMounted(() => {
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) {
    locale.value = savedLanguage
  }
})
</script>

<style scoped lang="scss">
.profile {
  padding: 11px 16px 134px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.purple {
  color: #ae8bff;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: fit-content;
  object-fit: contain;
  border-radius: 0px 0px 16px 16px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stats {
      display: flex;
      gap: 16px;

      div {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
        backdrop-filter: blur(30px);
        background: rgba(27, 24, 41, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0px 7px 30px 0px #00000045;
        backdrop-filter: blur(30px);
      }
    }
  }

  .lang {
    display: flex;
    align-items: center;
    text-transform: uppercase;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    box-shadow: 0px 7px 30px 0px rgba(0, 0, 0, 0.27);
    backdrop-filter: blur(30px);
    background: rgba(27, 24, 41, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0px 7px 30px 0px #00000045;
    backdrop-filter: blur(30px);
  }

  .info {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 106px;
    padding: 13px 20px 13px 20px;
    border-radius: 16px;
    background: rgba(27, 24, 41, 0.75);
    background: #1b182980;
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0px 7px 30px 0px #00000045;
    backdrop-filter: blur(15px);

    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      height: 66px;
      justify-content: space-between;

      .username {
        color: #fff;
        font-size: 20px;
        font-weight: 600;
        line-height: 150%;
        letter-spacing: 0px;
        text-align: center;
      }

      .scoin {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #fff;
        font-size: 16px;
        font-weight: 400;
        line-height: 150%;
        letter-spacing: 0px;
        text-align: left;
      }
    }
  }
}

.title {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  line-height: 150%;
  letter-spacing: 0px;
  text-align: left;
}

.friends {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invite-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(
    130.76deg,
    rgba(27, 24, 41, 0.75) 16.39%,
    rgba(76, 64, 120, 0.75) 140.71%
  );
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px);
  box-shadow: 0px 7px 30px 0px #00000045;

  p {
    font-size: 16px;
    font-weight: 400;
    line-height: 150%;
    letter-spacing: 0px;
    text-align: left;
  }

  .invite-container {
    display: flex;
    gap: 12px;
  }

  .invite-button {
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
    letter-spacing: 0px;
    height: 60px;
  }

  .copy-container {
    flex-shrink: 0;
    width: 60px !important;
    height: 60px;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.1s ease;
    border-radius: 16px;
    font-weight: 700;
    width: 100%;
    object-fit: contain;

    img {
      width: 30px;
      height: 30px;
    }
  }
}

.friend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 20px;
  border-radius: 16px;
  background: #1b1829bf;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px);
  box-shadow: 0px 7px 30px 0px #00000045;

  .friend-info {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      width: 46px;
      height: 46px;
      border-radius: 50%;
    }
  }

  .friend-info-text {
    margin-top: -4px;
    display: flex;
    flex-direction: column;
    height: 41px;
    justify-content: space-between;
    gap: 4px;

    .username {
      font-size: 16px;
      font-weight: 700;
      line-height: 150%;
      letter-spacing: 0px;
    }

    .scoin {
      font-size: 10px;
      font-weight: 400;
      line-height: 150%;
      letter-spacing: 0px;
    }
  }

  .income {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      width: 36px;
      height: 36px;
    }

    p {
      font-size: 16px;
      font-weight: 700;
      line-height: 22px;
      letter-spacing: 0px;
    }
  }
}

.quests {
  &__tabs {
    width: 100%;
  }

  &__list {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

:deep(.nav-tabs) {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

:deep(.nav-tabs__item) {
  width: 100%;
}

.quest-item {
  padding: 20px;
  border-radius: 16px;
  background: rgba(27, 24, 41, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px);
  cursor: pointer;

  &--disabled {
    background: rgba(18, 16, 27, 0.75);
    border-color: rgba(255, 255, 255, 0.02);

    .quest-item__description {
      color: rgba(255, 255, 255, 0.5);
    }

    .quest-item__reward {
      opacity: 0.5;
    }
  }

  &__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  &__description {
    font-size: 16px;
    line-height: 150%;
  }

  &__reward {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;

    span {
      font-weight: 700;
    }

    img {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
