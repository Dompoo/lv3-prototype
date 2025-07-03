// Cleen Chrome Extension 설정 예시 파일
// 이 파일을 복사하여 config.js로 이름을 변경하고 실제 값을 입력하세요

const CONFIG = {
  // Google Gemini API 설정
  GEMINI: {
    API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
    MODEL: 'gemini-2.0-flash-exp',
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models'
  },
  
  // 기본 설정값
  DEFAULT_SETTINGS: {
    filterEnabled: false,
    keywords: ['욕설', '논란', '19금'],
    sensitivityLevel: 2,
    filterMode: 'purify' // 'purify', 'mosaic', 'remove'
  },
  
  // DC인사이드 도메인 설정
  TARGET_DOMAINS: [
    'gall.dcinside.com',
    'm.dcinside.com'
  ],
  
  // 디버그 모드 (개발 시에만 true로 설정)
  DEBUG: false,
  
  // API 요청 설정
  API_SETTINGS: {
    timeout: 10000, // 10초
    retryCount: 3,
    retryDelay: 1000 // 1초
  }
};

// config.js에서는 이 내용을 수정하여 사용하세요
// background.js에서 이 설정을 import하여 사용할 수 있습니다