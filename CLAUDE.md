# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cleen** is a Korean web content filtering service prototype built as a React-based demonstration application. The project showcases a web guardian system that can filter, blur, or remove inappropriate content from web pages.

## Development Commands

### Core Commands
```bash
npm run dev        # Start development server on port 8080
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### No Testing Framework
Currently no test framework is configured in this codebase.

## Architecture & Code Organization

### Tech Stack
- **Frontend**: React 18.3.1 + TypeScript + Vite + SWC
- **Styling**: Tailwind CSS with shadcn/ui component library (40+ components)
- **State Management**: Local React hooks (no global state)
- **Routing**: React Router DOM
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod validation

### Key Directories
```
src/
├── components/ui/          # shadcn/ui components (Button, Card, Dialog, etc.)
├── components/            # Feature components (BrowserFrame, FilterControls, MockWebsite)
├── pages/                # Route components (Index, NotFound)
├── hooks/                # Custom React hooks
└── lib/                  # Utility functions
```

### Filtering System Architecture
The application demonstrates three content filtering modes:
- **Original Mode**: Display content as-is
- **Mosaic Mode**: Blur inappropriate content
- **Remove Mode**: Hide inappropriate content completely

### Component Patterns
- **Compound Components**: FilterControls combines multiple filtering options
- **Prop Interfaces**: Strong TypeScript interfaces throughout
- **Presentation Layer**: Pure components with separated business logic
- **Mock Data**: Hardcoded content for demonstration purposes

## Configuration Details

### Import Aliases
- Use `@/*` for `./src/*` imports (configured in vite.config.ts and tsconfig.json)

### TypeScript Settings
- Relaxed configuration: `noImplicitAny: false`, `strictNullChecks: false`
- Path aliases configured for clean imports

### Tailwind CSS
- Custom design system with CSS variables
- Configured for shadcn/ui component integration
- Extended color palette and animations

## Platform Integration

This project is integrated with Lovable.dev platform:
- Uses lovable-tagger in development mode
- Deployment configured for Lovable platform

## Language & Content

- **UI Language**: All interface text is in Korean
- **Target Market**: Korean web users (parents, presenters, gamers)
- **Demo Content**: Contains both appropriate and inappropriate content for filtering demonstration