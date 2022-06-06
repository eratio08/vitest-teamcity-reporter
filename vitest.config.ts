import { defineConfig, configDefaults } from 'vitest/config'
import { TeamCityReporter } from './src/reporter'

export default defineConfig({
  test: {
    ...configDefaults,
    // reporters: [...configDefaults.reporters, new TeamCityReporter()]
    clearMocks: true
  },
})

