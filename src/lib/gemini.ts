import { GoogleGenerativeAI } from '@google/generative-ai';

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

export const analyzeContentWithGemini = async (
  posts: Post[],
  filterKeywords: string[]
): Promise<number[]> => {
  try {
    console.log('🔧 Gemini 초기화 시작...');
    const gemini = initializeGemini();
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    console.log('✅ Gemini 모델 초기화 완료');

    const prompt = `
다음 게시물들을 분석해서 키워드와 관련된 내용이 포함된 게시물의 ID만 반환해주세요.

키워드: ${filterKeywords.join(', ')}

게시물들:
${posts.map(post => `ID: ${post.id}
제목: ${post.title}
내용: ${post.content}
작성자: ${post.author}
---`).join('\n')}

분석 기준:
1. 키워드와 직접적으로 일치하는 단어가 포함된 경우
2. 키워드와 의미적으로 관련된 내용이 포함된 경우 (예: "욕설" 키워드에 대해 실제 욕설 표현이 포함된 경우)
3. 키워드의 변형이나 은어가 포함된 경우

응답 형식: 해당하는 게시물 ID들만 쉼표로 구분해서 반환 (예: 1,3,5)
해당하는 게시물이 없으면 빈 문자열 반환
`;

    console.log('📤 Gemini에 보내는 프롬프트:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    console.log('📥 Gemini 원본 응답:', text);
    
    if (!text) {
      console.log('⚠️ 빈 응답 받음');
      return [];
    }

    // 응답에서 숫자 ID들만 추출
    const ids = text.split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id) && posts.some(post => post.id === id));

    console.log('✨ 파싱된 ID들:', ids);
    return ids;
  } catch (error) {
    console.error('Gemini API 호출 중 오류:', error);
    // Gemini API 호출 실패 시 기본 키워드 매칭으로 fallback
    return posts
      .filter(post => {
        const text = `${post.title} ${post.content}`.toLowerCase();
        return filterKeywords.some(keyword => text.includes(keyword.toLowerCase()));
      })
      .map(post => post.id);
  }
};