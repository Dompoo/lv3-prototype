import { GoogleGenerativeAI } from '@google/generative-ai';
import { SensitivityLevel } from '@/components/ContentFilterControls';

// Gemini API 키를 환경 변수에서 가져옴
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다');
  }
  return apiKey;
};

let genAI: GoogleGenerativeAI | null = null;

const initializeGemini = (): GoogleGenerativeAI => {
  if (!genAI) {
    const apiKey = getApiKey();
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
}

interface AnalysisResult {
  filteredPostIds: number[];
  purifyData?: { [postId: number]: string[] }; // 순화 모드용 감지된 텍스트 배열
}

export const analyzeContentWithGemini = async (
  posts: Post[],
  filterKeywords: string[],
  sensitivityLevel: SensitivityLevel = 2,
  purifyMode: boolean = false
): Promise<AnalysisResult> => {
  try {
    console.log('🔧 Gemini 초기화 시작...');
    const gemini = initializeGemini();
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    console.log('✅ Gemini 모델 초기화 완료');

    const getSensitivityDescription = (level: SensitivityLevel): string => {
      switch (level) {
        case 1:
          return '정확한 키워드 일치만 검출 - 키워드가 완전히 일치하는 경우만 해당';
        case 2:
          return '유사한 표현 포함 - 키워드의 변형이나 은어, 줄임말 포함';
        case 3:
          return '관련 내용 포함 - 키워드와 의미적으로 관련된 모든 내용 포함';
        case 4:
          return '연관성 있는 모든 내용 - 키워드와 조금이라도 연관성이 있는 모든 내용 포함';
      }
    };

    const prompt = purifyMode ? `
다음 게시물들을 분석해서 키워드와 관련된 내용이 포함된 게시물의 ID와 해당 부분의 텍스트를 반환해주세요.

키워드: ${filterKeywords.join(', ')}
민감도 레벨: ${sensitivityLevel} (${getSensitivityDescription(sensitivityLevel)})

게시물들:
${posts.map(post => `ID: ${post.id}
제목: ${post.title}
내용: ${post.content}
작성자: ${post.author}
---`).join('\n')}

분석 기준 (민감도 레벨 ${sensitivityLevel}):
${sensitivityLevel === 1 ? '- 키워드와 완전히 일치하는 단어만 검출' : ''}
${sensitivityLevel === 2 ? '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말 (예: "욕설" → "ㅅㅂ", "시발")' : ''}
${sensitivityLevel === 3 ? '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말\n- 키워드와 의미적으로 관련된 내용 (예: "욕설" → 실제 욕설 표현)' : ''}
${sensitivityLevel === 4 ? '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말\n- 키워드와 의미적으로 관련된 내용\n- 키워드와 조금이라도 연관성이 있는 모든 내용' : ''}

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
` : `
다음 게시물들을 분석해서 키워드와 관련된 내용이 포함된 게시물의 ID만 반환해주세요.

키워드: ${filterKeywords.join(', ')}
민감도 레벨: ${sensitivityLevel} (${getSensitivityDescription(sensitivityLevel)})

게시물들:
${posts.map(post => `ID: ${post.id}
제목: ${post.title}
내용: ${post.content}
작성자: ${post.author}
---`).join('\n')}

분석 기준 (민감도 레벨 ${sensitivityLevel}):
${sensitivityLevel === 1 ? '- 키워드와 완전히 일치하는 단어만 검출' : ''}
${sensitivityLevel === 2 ? '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말 (예: "욕설" → "ㅅㅂ", "시발")' : ''}
${sensitivityLevel === 3 ? '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말\n- 키워드와 의미적으로 관련된 내용 (예: "욕설" → 실제 욕설 표현)' : ''}
${sensitivityLevel === 4 ? '- 키워드와 직접적으로 일치하는 단어\n- 키워드의 변형이나 은어, 줄임말\n- 키워드와 의미적으로 관련된 내용\n- 키워드와 조금이라도 연관성이 있는 모든 내용' : ''}

중요: 해당하는 게시물 ID들만 쉼표로 구분해서 반환하세요. 다른 설명이나 텍스트는 절대 포함하지 마세요.
예시: 1,3,5
해당하는 게시물이 없으면 빈 문자열 반환
`;

    console.log('📤 Gemini에 보내는 프롬프트:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    console.log('📥 Gemini 원본 응답:', text);
    
    if (!text) {
      console.log('⚠️ 빈 응답 받음');
      return { filteredPostIds: [] };
    }

    if (purifyMode) {
      try {
        // JSON 응답에서 불필요한 텍스트 제거
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        
        // JSON 응답 파싱 시도
        const jsonResponse = JSON.parse(cleanedText);
        const ids = jsonResponse.filteredIds || [];
        const purifyData = jsonResponse.purifyData || {};
        
        console.log('✨ 파싱된 순화 모드 결과:', { ids, purifyData });
        return { 
          filteredPostIds: ids.filter((id: number) => posts.some(post => post.id === id)),
          purifyData
        };
      } catch (error) {
        console.warn('⚠️ JSON 파싱 실패, 기본 모드로 fallback');
        // JSON 파싱 실패 시 기본 모드로 처리
        const ids = text.split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id) && posts.some(post => post.id === id));
        return { filteredPostIds: ids };
      }
    } else {
      // 기본 모드: 쉼표로 구분된 ID들 파싱
      // 응답에서 불필요한 텍스트 제거
      const cleanedText = text.replace(/[^\d,]/g, '').trim();
      
      if (!cleanedText) {
        return { filteredPostIds: [] };
      }
      
      const ids = cleanedText.split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && posts.some(post => post.id === id));

      console.log('✨ 파싱된 ID들:', ids);
      return { filteredPostIds: ids };
    }
  } catch (error) {
    console.error('Gemini API 호출 중 오류:', error);
    
    // Rate limit 오류인지 확인
    if (error.message && error.message.includes('429')) {
      console.warn('⚠️ API 요청 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.');
    }
    
    // Gemini API 호출 실패 시 기본 키워드 매칭으로 fallback
    console.log('🔄 기본 키워드 매칭으로 fallback 실행');
    const fallbackIds = posts
      .filter(post => {
        const text = `${post.title} ${post.content}`.toLowerCase();
        return filterKeywords.some(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          if (sensitivityLevel === 1) {
            // 정확한 키워드 일치만
            return text.includes(lowerKeyword);
          } else {
            // 모든 레벨에서 기본적으로 키워드 포함 검사
            return text.includes(lowerKeyword);
          }
        });
      })
      .map(post => post.id);
      
    return { filteredPostIds: fallbackIds };
  }
};