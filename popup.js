// 기본 설정값
const DEFAULT_SETTINGS = {
  filterEnabled: false,
  keywords: ['욕설', '논란', '19금'],
  sensitivityLevel: 2,
  filterMode: 'purify' // 'purify', 'mosaic', 'remove'
};

// DOM 요소들
let filterEnabledToggle;
let keywordInput;
let addKeywordBtn;
let keywordTags;
let sensitivityLevels;
let filterModes;
let statusBar;
let statusText;
let filterControls;

// 현재 설정
let currentSettings = { ...DEFAULT_SETTINGS };

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  await loadSettings();
  setupEventListeners();
  updateUI();
});

function initializeElements() {
  filterEnabledToggle = document.getElementById('filterEnabled');
  keywordInput = document.getElementById('keywordInput');
  addKeywordBtn = document.getElementById('addKeyword');
  keywordTags = document.getElementById('keywordTags');
  sensitivityLevels = document.querySelectorAll('.sensitivity-level');
  filterModes = document.querySelectorAll('.filter-mode');
  statusBar = document.getElementById('statusBar');
  statusText = document.getElementById('statusText');
  filterControls = document.getElementById('filterControls');
}

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    currentSettings = { ...DEFAULT_SETTINGS, ...result };
    console.log('설정 로드됨:', currentSettings);
  } catch (error) {
    console.error('설정 로드 실패:', error);
    currentSettings = { ...DEFAULT_SETTINGS };
  }
}

async function saveSettings() {
  try {
    await chrome.storage.sync.set(currentSettings);
    console.log('설정 저장됨:', currentSettings);
    
    // 콘텐츠 스크립트에 설정 변경 알림
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('gall.dcinside.com')) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          settings: currentSettings
        });
      } catch (error) {
        console.log('콘텐츠 스크립트에 메시지 전송 실패:', error);
      }
    }
  } catch (error) {
    console.error('설정 저장 실패:', error);
  }
}

function setupEventListeners() {
  // 필터링 활성화/비활성화 토글
  filterEnabledToggle.addEventListener('change', async (e) => {
    currentSettings.filterEnabled = e.target.checked;
    await saveSettings();
    updateUI();
  });

  // 키워드 추가
  addKeywordBtn.addEventListener('click', addKeyword);
  keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  });

  // 민감도 레벨 선택
  sensitivityLevels.forEach(level => {
    level.addEventListener('click', async () => {
      const newLevel = parseInt(level.dataset.level);
      currentSettings.sensitivityLevel = newLevel;
      await saveSettings();
      updateUI();
    });
  });

  // 필터링 모드 선택
  filterModes.forEach(mode => {
    mode.addEventListener('click', async () => {
      const newMode = mode.dataset.mode;
      currentSettings.filterMode = newMode;
      await saveSettings();
      updateUI();
    });
  });
}

async function addKeyword() {
  const keyword = keywordInput.value.trim();
  if (keyword && !currentSettings.keywords.includes(keyword)) {
    currentSettings.keywords.push(keyword);
    keywordInput.value = '';
    await saveSettings();
    updateUI();
  }
}

async function removeKeyword(keyword) {
  currentSettings.keywords = currentSettings.keywords.filter(k => k !== keyword);
  await saveSettings();
  updateUI();
}

function updateUI() {
  // 필터링 활성화 토글
  filterEnabledToggle.checked = currentSettings.filterEnabled;

  // 필터 컨트롤 표시/숨김
  if (currentSettings.filterEnabled) {
    filterControls.classList.remove('hidden');
    statusBar.classList.add('active');
    statusText.textContent = `필터링 활성화됨 (${currentSettings.keywords.length}개 키워드, 민감도 ${currentSettings.sensitivityLevel}, ${getModeText(currentSettings.filterMode)})`;
  } else {
    filterControls.classList.add('hidden');
    statusBar.classList.remove('active');
    statusText.textContent = '필터링이 비활성화되어 있습니다';
  }

  // 키워드 태그 업데이트
  keywordTags.innerHTML = '';
  currentSettings.keywords.forEach(keyword => {
    const tag = document.createElement('div');
    tag.className = 'keyword-tag';
    tag.innerHTML = `
      <span>${keyword}</span>
      <button onclick="removeKeyword('${keyword}')">&times;</button>
    `;
    keywordTags.appendChild(tag);
  });

  // 민감도 레벨 업데이트
  sensitivityLevels.forEach(level => {
    const levelValue = parseInt(level.dataset.level);
    if (levelValue === currentSettings.sensitivityLevel) {
      level.classList.add('active');
    } else {
      level.classList.remove('active');
    }
  });

  // 필터링 모드 업데이트
  filterModes.forEach(mode => {
    const modeValue = mode.dataset.mode;
    if (modeValue === currentSettings.filterMode) {
      mode.classList.add('active');
    } else {
      mode.classList.remove('active');
    }
  });

  // 키워드 입력 버튼 상태
  updateAddKeywordButton();
}

function updateAddKeywordButton() {
  const keyword = keywordInput.value.trim();
  const isValid = keyword && !currentSettings.keywords.includes(keyword);
  addKeywordBtn.disabled = !isValid;
}

function getModeText(mode) {
  switch (mode) {
    case 'purify': return '순화 모드';
    case 'mosaic': return '모자이크 모드';
    case 'remove': return '제거 모드';
    default: return '알 수 없음';
  }
}

// 키워드 제거 함수를 전역으로 노출
window.removeKeyword = removeKeyword;

// 키워드 입력 실시간 업데이트
document.addEventListener('DOMContentLoaded', () => {
  const keywordInput = document.getElementById('keywordInput');
  if (keywordInput) {
    keywordInput.addEventListener('input', updateAddKeywordButton);
  }
});

// 스타일 추가 - hidden 클래스
const style = document.createElement('style');
style.textContent = `
  .hidden {
    display: none !important;
  }
`;
document.head.appendChild(style);