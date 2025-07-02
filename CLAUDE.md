# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cleen** is a Korean web content filtering service prototype built as a React-based demonstration application. The project showcases an AI-powered web guardian system that can intelligently filter, blur, or remove inappropriate content from web pages using Google Gemini AI.

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
- **AI Integration**: Google Gemini AI for intelligent content analysis
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: Local React hooks (no global state)
- **Routing**: React Router DOM
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod validation

### Key Directories
```
src/
├── components/ui/          # shadcn/ui components (Button, Card, Input, etc.)
├── components/            # Feature components (BrowserFrame, ContentFilterControls, MockWebsite)
├── pages/                # Route components (Index, NotFound)
├── lib/                  # Utility functions and API clients (gemini.ts)
└── hooks/                # Custom React hooks
```

### AI-Powered Filtering System
The application uses Google Gemini AI to intelligently analyze content and supports three filtering modes:
- **Original Mode**: Display content as-is with "키워드 발견" tags for detected content
- **Mosaic Mode**: Blur inappropriate content with overlay
- **Remove Mode**: Hide inappropriate content completely

#### AI Analysis Process
1. User sets custom keywords (e.g., "욕설", "논란", "19금")
2. Gemini AI analyzes all posts for semantic matches with keywords
3. Returns filtered post IDs for intelligent content detection
4. Fallback to simple text matching if API fails

### Component Architecture
- **Single Page Application**: Simplified from multi-page to focused demo
- **BrowserFrame**: Main container simulating web browser
- **MockWebsite**: Community board with sample posts for demonstration
- **ContentFilterControls**: Keyword management and filtering mode selection
- **AI Integration**: Real-time content analysis with Google Gemini

## Environment Configuration

### Environment Variables
```bash
# Required: Gemini AI API Key
VITE_GEMINI_API_KEY=your_api_key_here
```

### API Key Management
- Create `.env.local` file with your Gemini API key
- Never commit API keys to repository
- Use `.env.example` as template for other developers
- Get API key from: https://makersuite.google.com/app/apikey

### Import Aliases
- Use `@/*` for `./src/*` imports (configured in vite.config.ts and tsconfig.json)

### TypeScript Settings
- Relaxed configuration: `noImplicitAny: false`, `strictNullChecks: false`
- Path aliases configured for clean imports

### Tailwind CSS
- Custom design system with CSS variables
- Configured for shadcn/ui component integration
- Extended color palette and animations

## AI Integration Details

### Gemini AI Model
- **Model**: `gemini-2.0-flash-exp` (latest experimental model)
- **Purpose**: Semantic content analysis for intelligent filtering
- **Input**: Posts content + user-defined keywords
- **Output**: Array of post IDs that match filtering criteria

### Content Analysis Logic
- Analyzes title, content, and author information
- Supports semantic matching (e.g., "욕설" keyword detects "ㅅㅂ" expressions)
- Handles Korean language nuances and slang
- Provides fallback to simple text matching for reliability

## Platform Integration

This project is integrated with Lovable.dev platform:
- Uses lovable-tagger in development mode
- Deployment configured for Lovable platform

## Language & Content

- **UI Language**: All interface text is in Korean
- **Target Market**: Korean web users (parents, educators, content moderators)
- **Demo Content**: Community board posts with various content types for filtering demonstration
- **AI-Powered**: Intelligent Korean content analysis using Google Gemini AI