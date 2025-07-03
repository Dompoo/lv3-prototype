# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Project Overview

**Cleen** is a Korean web content filtering Chrome extension that intelligently filters inappropriate content from DC인사이드 pages using Google Gemini AI. The extension provides real-time content analysis and filtering with multiple modes, customizable keywords, and adjustable sensitivity levels.

## Development Commands

### Build Commands
```bash
./build.sh         # Build extension for macOS/Linux
build.bat          # Build extension for Windows
```

### No Testing Framework
Currently, no test framework is configured in this codebase.

## Architecture & Code Organization

### Tech Stack
- **Extension Platform**: Chrome Extension Manifest V3
- **AI Integration**: Google Gemini AI for intelligent content analysis
- **Content Filtering**: Real-time DOM manipulation and CSS injection
- **Storage**: Chrome Extension Storage API (`chrome.storage.sync`)
- **Service Worker**: Background script (`background.js`) for AI API calls and settings management

### Key Files
```
├── manifest.json          # Extension metadata and permissions
├── background.js         # Service worker for AI API calls
├── content.js           # Content script for page manipulation
├── popup.html           # Settings interface HTML
├── popup.js             # Settings interface logic
├── styles.css           # Filtering effect styles
├── config.example.js    # Configuration template (for reference)
├── icons/               # Extension icons
├── build.sh/bat         # Build scripts
└── dist/                # Build output directory
```

### AI-Powered Filtering System
The extension uses Google Gemini AI to intelligently analyze content and supports three filtering modes and four sensitivity levels.

- **Filtering Modes**:
  - **순화 모드 (Purify Mode)**: Masks inappropriate words with █ characters.
  - **모자이크 모드 (Mosaic Mode)**: Applies a blur effect to entire posts.
  - **제거 모드 (Remove Mode)**: Completely hides problematic posts.

- **Sensitivity Levels**:
  - **Level 1**: Detects exact keyword matches only.
  - **Level 2**: Includes similar expressions, slang, and acronyms.
  - **Level 3**: Includes semantically related content.
  - **Level 4**: Includes all potentially related content.

#### AI Analysis Process
1. User sets custom keywords (e.g., "욕설", "논란", "19금"), a sensitivity level (1-4), and a filtering mode.
2. Gemini AI analyzes DC인사이드 post titles and content for semantic matches based on the keywords and sensitivity level.
3. The AI returns a list of post IDs to be filtered. For "Purify Mode," it also returns the specific text to be masked.
4. A fallback to simple text matching is implemented if the API call fails.

### Extension Architecture
- **Service Worker**: The background script handles Gemini AI API calls and manages user settings.
- **Content Script**: Injected into DC인사이드 pages for real-time DOM manipulation and filtering.
- **Popup Interface**: A settings UI for managing keywords, sensitivity, and filtering modes.
- **Local Storage**: All user settings are stored locally using `chrome.storage.sync` for privacy and are synced across devices.
- **CSS Injection**: Dynamic styling is used to apply filtering effects like blurring and masking.

## Environment Configuration

### API Key Management
- **Important**: To use the AI features, you must set your own Google Gemini API key.
- Get your API key from: https://makersuite.google.com/app/apikey
- Open the `background.js` file.
- Replace the placeholder `YOUR_GEMINI_API_KEY_HERE` with your actual API key.
- **Never commit API keys to the repository.** The `config.example.js` file is for reference only and is not loaded by the extension.

### Extension Configuration
- All settings are stored in Chrome's sync storage.
- User preferences (filtering enabled/disabled, keywords, sensitivity level, filter mode) persist across browser sessions.
- All settings are user-configurable through the extension's popup.
- The design is privacy-first, with no external data transmission besides the AI API calls.

## AI Integration Details

### Gemini AI Model
- **Model**: `gemini-2.0-flash-exp` (latest experimental model)
- **Purpose**: Semantic content analysis for intelligent filtering.
- **Input**: Post content (title, body, author) + user-defined keywords and sensitivity level.
- **Output**: An array of post IDs that match the filtering criteria. For "Purify Mode," it also includes the specific words to be masked.

### Content Analysis Logic
- Analyzes post title, content, and author information.
- Supports semantic matching based on the selected sensitivity level (e.g., a "욕설" keyword can detect "ㅅㅂ" at higher levels).
- Handles Korean language nuances and slang.
- Provides a reliable fallback to simple text matching if the API fails or the key is not configured.

## Installation & Deployment

### Local Development
1. Clone the repository.
2. Set your Gemini API key in `background.js`.
3. Run the build script: `./build.sh` (Unix) or `build.bat` (Windows).
4. Open Chrome, navigate to `chrome://extensions/`, and enable "Developer mode".
5. Click "Load unpacked" and select the `dist/` folder.

### Chrome Web Store Deployment
- **Status**: Ready for submission.
- **Store Information**: Available in `store-info.md`.
- **Requirements**: Chrome Developer account registration ($5 fee).
- **Review Process**: Must adhere to Chrome Web Store policies.

### Build Process
- Cross-platform build scripts are provided for Unix and Windows.
- The build process prepares the necessary files for the extension in the `dist/` directory.

## Language & Content

- **UI Language**: All interface text is in Korean.
- **Target Market**: Korean web users, particularly parents, educators, and content moderators.
- **Target Platform**: DC인사이드 community boards.
- **AI-Powered**: Features intelligent Korean content analysis using Google Gemini AI.

## Privacy & Security

- **Local Storage Only**: All settings are stored locally on the user's device.
- **Minimal Permissions**: The extension only requests permissions for `storage` and the `gall.dcinside.com` domain.
- **Optional AI**: The Gemini API is only used if a user provides their own API key.
- **No Data Collection**: The extension does not collect or transmit any personal user data.
- **Secure Configuration**: The API key is stored locally and is not transmitted to any service other than the Google Gemini API.