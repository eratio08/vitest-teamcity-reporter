# 📝 vitest-teamcity-reporter

## 💿 Installation

```
pnpm install -D vitest-teamcity-reporter
```

## 🔧 Configuration

Add new custom reporter `vite.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import TeamCityReporter from 'vitest-teamcity-reporter';

export default defineConfig({
  test: {
    reporters: [TeamCityReporter],
  },
});
```
