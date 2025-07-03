// Gemini API 관련 설정
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // 실제 API 키로 교체 필요
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// 확장 프로그램 설치 시 기본 설정 초기화
chrome.runtime.onInstalled.addListener(() => {
  console.log('Cleen 확장 프로그램이 설치되었습니다');
  
  // 기본 설정 저장
  const defaultSettings = {
    filterEnabled: false,
    keywords: ['욕설', '논란', '19금'],
    sensitivityLevel: 2,
    filterMode: 'purify'
  };
  
  chrome.storage.sync.set(defaultSettings);
});

// 콘텐츠 스크립트에서 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background에서 메시지 수신:', request);
  
  if (request.type === 'ANALYZE_CONTENT') {
    handleContentAnalysis(request, sendResponse);
    return true; // 비동기 응답을 위해 true 반환
  }
  
  if (request.type === 'GET_SETTINGS') {
    handleGetSettings(sendResponse);
    return true;
  }
});

// 설정 가져오기
async function handleGetSettings(sendResponse) {
  try {
    const settings = await chrome.storage.sync.get({
      filterEnabled: false,
      keywords: ['욕설', '논란', '19금'],
      sensitivityLevel: 2,
      filterMode: 'purify'
    });
    sendResponse({ success: true, settings });
  } catch (error) {
    console.error('설정 가져오기 실패:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 콘텐츠 분석 요청 처리
async function handleContentAnalysis(request, sendResponse) {
  try {
    const { posts, keywords, sensitivityLevel, filterMode } = request;
    
    if (!posts || !keywords || keywords.length === 0) {
      sendResponse({
        success: false,
        error: '분석할 데이터가 없습니다'
      });
      return;
    }
    
    console.log('Gemini API 분석 시작:', {
      postsCount: posts.length,
      keywords,
      sensitivityLevel,
      filterMode
    });
    
    const result = await analyzeContentWithGemini(posts, keywords, sensitivityLevel, filterMode);
    
    console.log('Gemini API 분석 완료:', result);
    
    sendResponse({
      success: true,
      result
    });
    
  } catch (error) {
    console.error('콘텐츠 분석 실패:', error);
    
    // Fallback으로 기본 키워드 매칭 사용
    const fallbackResult = performFallbackAnalysis(request.posts, request.keywords, request.sensitivityLevel, request.filterMode);
    
    sendResponse({
      success: true,
      result: fallbackResult,
      usedFallback: true
    });
  }
}

// Gemini API를 사용한 콘텐츠 분석
async function analyzeContentWithGemini(posts, keywords, sensitivityLevel, filterMode) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API 키가 설정되지 않았습니다');
  }
  
  const prompt = createAnalysisPrompt(posts, keywords, sensitivityLevel, filterMode);
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API 요청 실패: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Gemini API 응답이 올바르지 않습니다');
  }
  
  const text = data.candidates[0].content.parts[0].text.trim();
  
  return parseGeminiResponse(text, posts, filterMode);
}

// Gemini API 프롬프트 생성
function createAnalysisPrompt(posts, keywords, sensitivityLevel, filterMode) {
  const sensitivityDescription = getSensitivityDescription(sensitivityLevel);
  
  const postsText = posts.map(post => `ID: ${post.id}
제목: ${post.title}
내용: ${post.content}
작성자: ${post.author}
---`).join('\n');
  
  if (filterMode === 'purify') {
    return `
다음 게시물들을 분석해서 키워드와 관련된 내용이 포함된 게시물의 ID와 해당 부분의 텍스트를 반환해주세요.

키워드: ${keywords.join(', ')}
민감도 레벨: ${sensitivityLevel} (${sensitivityDescription})

게시물들:
${postsText}

분석 기준 (민감도 레벨 ${sensitivityLevel}):
${getSensitivityCriteria(sensitivityLevel)}

중요: 다음 JSON 형식으로만 응답하세요. 다른 설명이나 텍스트는 절대 포함하지 마세요.
{
  "filteredIds": [1, 3, 5],
  "purifyData": {
    "1": ["ㅅㅂ", "시발"],
    "3": ["논란적인"],
    "5": ["19금"]
  }
}

해당하는 게시물이 없으면:
{
  "filteredIds": [],
  "purifyData": {}
}
`;
  } else {
    return `
다음 게시물들을 분석해서 키워드와 관련된 내용이 포함된 게시물의 ID만 반환해주세요.

키워드: ${keywords.join(', ')}
민감도 레벨: ${sensitivityLevel} (${sensitivityDescription})

게시물들:
${postsText}

분석 기준 (민감도 레벨 ${sensitivityLevel}):
${getSensitivityCriteria(sensitivityLevel)}

중요: 해당하는 게시물 ID들만 쉼표로 구분해서 반환하세요. 다른 설명이나 텍스트는 절대 포함하지 마세요.
예시: 1,3,5
해당하는 게시물이 없으면 빈 문자열 반환
`;
  }
}

// 민감도 레벨 설명
function getSensitivityDescription(level) {
  switch (level) {
    case 1: return '정확한 키워드 일치만 검출';
    case 2: return '유사한 표현 포함';
    case 3: return '관련 내용 포함';
    case 4: return '연관성 있는 모든 내용';
    default: return '유사한 표현 포함';
  }
}

// 민감도 레벨 기준
function getSensitivityCriteria(level) {
  switch (level) {
    case 1: return '- 키워드와 완전히 일치하는 단어만 검출';
    case 2: return '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말 (예: "욕설" → "ㅅㅂ", "시발")';
    case 3: return '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말\n- 키워드와 의미적으로 관련된 내용 (예: "욕설" → 실제 욕설 표현)';
    case 4: return '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말\n- 키워드와 의미적으로 관련된 내용\n- 키워드와 조금이라도 연관성이 있는 모든 내용';
    default: return '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말';
  }
}

// Gemini 응답 파싱
function parseGeminiResponse(text, posts, filterMode) {
  if (filterMode === 'purify') {
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const jsonResponse = JSON.parse(cleanedText);
      
      return {
        filteredPostIds: jsonResponse.filteredIds || [],
        purifyData: jsonResponse.purifyData || {}
      };
    } catch (error) {
      console.warn('JSON 파싱 실패, 기본 모드로 fallback');
      const ids = text.split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && posts.some(post => post.id === id));
      return { filteredPostIds: ids };
    }
  } else {
    const cleanedText = text.replace(/[^\d,]/g, '').trim();
    
    if (!cleanedText) {
      return { filteredPostIds: [] };
    }
    
    const ids = cleanedText.split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id) && posts.some(post => post.id === id));
    
    return { filteredPostIds: ids };
  }
}

// Fallback 분석 (Gemini API 실패 시 사용)
function performFallbackAnalysis(posts, keywords, sensitivityLevel, filterMode) {
  const fallbackPurifyData = {};
  
  const filteredIds = posts
    .filter(post => {
      const text = `${post.title} ${post.content}`.toLowerCase();
      const foundKeywords = [];
      
      const hasKeyword = keywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        if (text.includes(lowerKeyword)) {
          foundKeywords.push(keyword);
          return true;
        }
        return false;
      });
      
      if (hasKeyword && filterMode === 'purify') {
        const actualFoundWords = [];
        foundKeywords.forEach(keyword => {
          const regex = new RegExp(keyword, 'gi');
          const titleMatches = post.title.match(regex);
          const contentMatches = post.content.match(regex);
          if (titleMatches) actualFoundWords.push(...titleMatches);
          if (contentMatches) actualFoundWords.push(...contentMatches);
        });
        if (actualFoundWords.length > 0) {
          fallbackPurifyData[post.id] = actualFoundWords;
        }
      }
      
      return hasKeyword;
    })
    .map(post => post.id);
  
  return {
    filteredPostIds: filteredIds,
    purifyData: fallbackPurifyData
  };
}