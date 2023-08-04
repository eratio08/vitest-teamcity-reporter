import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    ...configDefaults,
    reporters: 'vitest-teamcity-reporter',
  },
});
