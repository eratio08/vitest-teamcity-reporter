import { defineConfig, configDefaults } from 'vitest/config';
import { TeamCityReporter } from 'vitest-teamcity-reporter';

export default defineConfig({
  test: {
    ...configDefaults,
    reporters: [...configDefaults.reporters, TeamCityReporter],
  },
});
