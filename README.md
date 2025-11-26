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
    // optionaly config
    coverage: {
        // enable "Reporting Build Statistics"
        reporter: ['teamcity'],
    }
});
```

### Reporting Build Statistics
For enabling "[Reporting Build Statistics](https://www.jetbrains.com/help/teamcity/service-messages.html#Reporting+Build+Statistics)" for TeamCity you may add a "[teamcity](https://istanbul.js.org/docs/advanced/alternative-reporters/#teamcity)" coverage reporter that is the default provided by vitest ([vitest](https://vitest.dev/guide/coverage.html#coverage-setup) doc, [istanbul](https://istanbul.js.org/docs/advanced/alternative-reporters/#teamcity) doc)
