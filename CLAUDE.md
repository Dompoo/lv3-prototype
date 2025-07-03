# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cleen** is a Korean web content filtering Chrome extension that intelligently filters inappropriate content from DC인사이드 pages using Google Gemini AI. The extension provides real-time content analysis and filtering with multiple modes and customizable sensitivity levels.

## Development Commands

### Build Commands
```bash
./build.sh         # Build extension for macOS/Linux
build.bat          # Build extension for Windows
```

### No Testing Framework
Currently no test framework is configured in this codebase.

## Architecture & Code Organization

### Tech Stack
- **Extension Platform**: Chrome Extension Manifest V3
- **AI Integration**: Google Gemini AI for intelligent content analysis
- **Content Filtering**: Real-time DOM manipulation and CSS injection
- **Storage**: Chrome Extension Local Storage API
- **Service Worker**: Background script for AI API calls

### Key Files
```
├── manifest.json          # Extension metadata and permissions
├── background.js         # Service worker for AI API calls
├── content.js           # Content script for page manipulation
├── popup.html           # Settings interface HTML
├── popup.js             # Settings interface logic
├── styles.css           # Filtering effect styles
├── config.example.js    # Configuration template
├── icons/               # Extension icons
├── build.sh/bat         # Build scripts
└── dist/                # Build output directory
```

### AI-Powered Filtering System
The extension uses Google Gemini AI to intelligently analyze content and supports three filtering modes:
- **순화 모드**: Masks inappropriate words with █ characters
- **모자이크 모드**: Applies blur effect to entire posts
- **제거 모드**: Completely hides problematic posts

#### AI Analysis Process
1. User sets custom keywords (e.g., "욕설", "논란", "19금")
2. Gemini AI analyzes DC인사이드 posts for semantic matches with keywords
3. Returns filtered post IDs for intelligent content detection
4. Fallback to simple text matching if API fails

### Extension Architecture
- **Service Worker**: Background script handles Gemini AI API calls
- **Content Script**: Injected into DC인사이드 pages for real-time filtering
- **Popup Interface**: Settings UI for keyword management and mode selection
- **Local Storage**: All user settings stored locally for privacy
- **CSS Injection**: Dynamic styling for filtering effects

## Environment Configuration

### API Key Management
- Copy `config.example.js` to create your configuration
- Set your Gemini API key in the background script
- Never commit API keys to repository
- Get API key from: https://makersuite.google.com/app/apikey

### Extension Configuration
- All settings stored in Chrome Extension Local Storage
- User preferences persist across browser sessions
- Keywords and filtering modes are user-configurable
- Privacy-first design with no external data transmission

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

## Installation & Deployment

### Local Development
1. Clone the repository
2. Copy `config.example.js` and configure your Gemini API key
3. Run build script: `./build.sh` (Unix) or `build.bat` (Windows)
4. Load the `dist/` folder in Chrome Developer Mode

### Chrome Web Store Deployment
- **Status**: Ready for submission
- **Store Information**: Available in `store-info.md`
- **Requirements**: Developer account registration ($5)
- **Review Process**: Follows Chrome Web Store policies

### Build Process
- Cross-platform build scripts (Unix/Windows)
- Automatic minification and optimization
- dist/ folder generation for Chrome extension loading

## Language & Content

- **UI Language**: All interface text is in Korean
- **Target Market**: Korean web users (parents, educators, content moderators)
- **Target Platform**: DC인사이드 community boards
- **AI-Powered**: Intelligent Korean content analysis using Google Gemini AI

## Privacy & Security

- **Local Storage Only**: No external data transmission
- **Minimal Permissions**: Only DC인사이드 domains
- **Optional AI**: Gemini API used only when configured
- **No Data Collection**: Complete user privacy protection
- **Secure Configuration**: API keys stored locally, never transmitted