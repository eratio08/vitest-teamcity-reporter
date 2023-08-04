# 📝 vitest-teamcity-reporter

## 💿 Installation

```bash
pnpm install -D vitest-teamcity-reporter
```

```bash
npm install -D vitest-teamcity-reporter
```


## 🔧 Configuration

Add new custom reporter `vite.config.ts`

```typescript
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        // path to reporter
        reporters: 'vitest-teamcity-reporter',
    },
});
```
