/* README for client folder structure */

# Collab Desk - Client App

Modern React + TypeScript client application with Vite.

## Folder Structure

```
client/
├── public/                 # Static assets (images, fonts, etc)
├── src/
│   ├── components/        # Reusable React components
│   │   └── Example.tsx
│   ├── pages/            # Page-level components/views
│   │   └── HomePage.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useApi.ts
│   ├── services/         # API calls and external services
│   │   └── api.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── index.ts
│   │   └── api.ts
│   ├── context/          # React Context for state management
│   │   └── AuthContext.tsx
│   ├── utils/            # Utility functions
│   │   └── helpers.ts
│   ├── styles/           # Global and component styles
│   │   ├── index.css
│   │   └── App.css
│   ├── assets/           # Images, fonts, etc
│   ├── constants/        # Application constants
│   │   ├── api.ts
│   │   └── index.ts
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── .eslintrc.cjs         # ESLint config
├── .env.example          # Environment variables template
└── .gitignore            # Git ignore rules
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Start dev server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Path Aliases

TypeScript paths are configured for easy imports:
- `@/*` - `src/`
- `@components/*` - `src/components/`
- `@pages/*` - `src/pages/`
- `@hooks/*` - `src/hooks/`
- `@services/*` - `src/services/`
- `@types/*` - `src/types/`
- `@context/*` - `src/context/`
- `@utils/*` - `src/utils/`
- `@styles/*` - `src/styles/`
- `@assets/*` - `src/assets/`
- `@constants/*` - `src/constants/`

Example import:
```typescript
import { useApi } from '@hooks/useApi'
import { formatDate } from '@utils/helpers'
```

## Best Practices

- Keep components small and focused
- Use custom hooks for shared logic
- Type everything (strict TypeScript mode)
- Use constants for magic strings
- Keep services separate from components
- Organize styles with components when possible
