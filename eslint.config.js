import pluginVue from 'eslint-plugin-vue';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'], // Поддержка JavaScript и Vue
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'], // Игнорируем ненужные пути
  },

  // Подключаем конфигурацию Vue
  ...pluginVue.configs['flat/essential'],

  // Подключаем Prettier (чтобы избежать конфликтов форматирования)
  skipFormatting,

  // Добавляем базовые правила ESLint
  {
    rules: {
      'no-unused-vars': 'warn', // Предупреждение о неиспользуемых переменных
      'no-console': 'off',      // Разрешаем console.log
      'no-debugger': 'warn',    // Предупреждение для debugger
    },
  },
];
