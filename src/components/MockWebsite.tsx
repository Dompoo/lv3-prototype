import React, { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Share2, Flag, User, Chrome, RefreshCw, ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzeContentWithGemini } from '@/lib/gemini';

interface MockWebsiteProps {
  mosaicEnabled: boolean;
  removeEnabled: boolean;
  filterKeywords?: string[];
}

const MockWebsite: React.FC<MockWebsiteProps> = ({
  mosaicEnabled,
  removeEnabled,
  filterKeywords = [],
}) => {
  const [filteredPostIds, setFilteredPostIds] = useState<number[]>([]);
  
  // filteredPostIds 상태 변화 추적
  useEffect(() => {
    console.log('📋 필터링된 게시물 ID 목록 업데이트:', filteredPostIds);
  }, [filteredPostIds]);
  
  const inappropriateContent = [
    {
      id: 1,
      title: "트페 이번 패치 뭐임?",
      content: "ㅅㅂ 도파 입꼬리 올라가는게 보인다",
      author: "범부"
    },
    {
      id: 2,
      title: "롤 27.0.1 패치 요약",
      content: "트페 궁 사거리 상향, 바루스 Q,W 데미지 너프, 그웬 W 크기 너프, 갱플 귤로 모데 궁 나올 수 있음, 신챔 유나리 추가, 칼바람 리메이크",
      author: "ㅇㅇ"
    },
    {
      id: 3,
      title: "페이커 논란",
      content: "페이커 요즘 살찐거봄? 내부자 고발로는 15킬로 쪘다는데 볼살 통통해진거보니까 진짜긴 한듯?",
      author: "고닉학살자"
    },
    {
      id: 4,
      title: "롤 처음이면 이글부터 봐라",
      content: "일단 CS 먹는것부터 연습해야 함. 브론즈 게임이나 치고받고 싸우지 천상계 게임 한번만 보면 걍 파밍 싸움이란거 알 수 있음. 연습 모드 켜서 3시간 동안 CS만 먹으셈",
      author: "이글"
    },
    {
      id: 5,
      title: "[후방주의] 19금 성인 웹툰 추천",
      content: "성인 대상 웹툰 중에서 스토리가 좋은 작품들을 정리해봤습니다. 7번 작품이 진짜 ㄹㅇ 개쩜",
      author: "ㅇㅇ"
    },
    {
      id: 6,
      title: "커뮤니티 공지사항",
      content: "최근 욕설이나 혐오 표현을 사용하는 회원들이 늘어나고 있어 제재를 강화하기로 했습니다. 모든 회원분들께서 건전한 토론 문화 정착에 협조해주시기 바랍니다.",
      author: "관리자"
    }
  ];

  // Gemini API를 사용해서 키워드와 관련된 게시물 ID들을 가져옴
  useEffect(() => {
    const analyzeContent = async () => {
      if (filterKeywords.length === 0) {
        console.log('🔍 필터 키워드가 없어서 분석을 건너뜁니다.');
        setFilteredPostIds([]);
        return;
      }

      console.log('🚀 Gemini API 분석 시작:', { 
        keywords: filterKeywords,
        posts: inappropriateContent.map(p => ({ id: p.id, title: p.title }))
      });

      try {
        const ids = await analyzeContentWithGemini(inappropriateContent, filterKeywords);
        console.log('✅ Gemini API 응답 성공:', { 
          filteredIds: ids,
          totalPosts: inappropriateContent.length 
        });
        setFilteredPostIds(ids);
      } catch (error) {
        console.error('❌ 콘텐츠 분석 실패:', error);
        setFilteredPostIds([]);
      }
    };

    analyzeContent();
  }, [filterKeywords]);

  const containsKeyword = (post: { id: number }) => {
    const isFiltered = filteredPostIds.includes(post.id);
    console.log(`🔍 게시물 ${post.id} 필터링 체크:`, { 
      postId: post.id, 
      filteredPostIds, 
      isFiltered 
    });
    return isFiltered;
  };

  const renderPost = (post: { id: number; title: string; content: string; author: string }) => {
    const hasFilterKeyword = containsKeyword(post);
    const shouldHide = removeEnabled && hasFilterKeyword;
    const shouldMosaic = mosaicEnabled && hasFilterKeyword && !removeEnabled;

    console.log(`🎭 게시물 ${post.id} 렌더링 결정:`, {
      postId: post.id,
      hasFilterKeyword,
      removeEnabled,
      mosaicEnabled,
      shouldHide,
      shouldMosaic
    });

    if (shouldHide) {
      console.log(`🚫 게시물 ${post.id} 숨김처리`);
      return null;
    }

    return (
      <div
        key={post.id}
        className={cn(
          "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all",
          shouldMosaic && "relative"
        )}
      >
        {shouldMosaic && (
          <>
            {console.log(`🌫️ 게시물 ${post.id} 모자이크 처리 적용`)}
            <div className="absolute inset-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="text-white text-center space-y-2">
                <Flag className="w-8 h-8 mx-auto" />
                <p className="font-semibold">필터링된 키워드</p>
                <p className="text-sm opacity-75">모자이크 처리됨</p>
              </div>
            </div>
          </>
        )}
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-800">{post.author}</span>
              <span className="text-sm text-gray-500">• 방금 전</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">{post.title}</h3>
            <p className="text-gray-700 mb-3">{post.content}</p>
            <div className="flex items-center gap-4 text-gray-500">
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">좋아요</span>
              </button>
              <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">댓글</span>
              </button>
              <button className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">공유</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const visiblePosts = inappropriateContent.filter(post => {
    const hasFilterKeyword = containsKeyword(post);
    return !(removeEnabled && hasFilterKeyword);
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Website Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티 게시판</h1>
        <p className="text-gray-600">다양한 주제의 게시물을 확인해보세요</p>
      </div>

      {/* Filter Status */}
      {filterKeywords.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Cleen 필터 활성화</span>
          </div>
          <div className="text-sm text-blue-700 mt-1">
            <p>
              키워드 필터 적용: {filterKeywords.join(', ')} 
              {removeEnabled ? ' (제거됨)' : mosaicEnabled ? ' (모자이크 처리됨)' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {visiblePosts.length > 0 ? (
          inappropriateContent.map(renderPost)
        ) : (
          <div className="text-center py-12">
            <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              모든 키워드 관련 콘텐츠가 제거되었습니다
            </h3>
            <p className="text-gray-500">
              필터링된 콘텐츠만 표시됩니다
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

// 1번 페르소나(가족/청소년/어린이 친화)용 목업 → 구글 검색 결과 스타일로 전면 수정
export const MockWebsitePersona1: React.FC<MockWebsiteProps & { filterKeywords?: string[] }> = ({ mosaicEnabled, removeEnabled, filterKeywords }) => {
  // 검색 결과 데이터 (위에서부터: 위키, 위키, 광고, 강의, 연예, 강의, 쇼핑, 영상)
  const searchResults = [
    {
      id: 1,
      type: 'wiki',
      title: '인간 심리의 이해 - 나무위키',
      url: 'https://namu.wiki/w/인간%20심리의%20이해',
      snippet: '인간 심리의 다양한 측면과 심리학 이론, 실생활 적용 사례를 정리한 문서입니다.',
      highlight: false
    },
    {
      id: 2,
      type: 'wiki',
      title: '인간 심리의 이해 - 위키백과',
      url: 'https://ko.wikipedia.org/wiki/인간_심리의_이해',
      snippet: '심리학의 기본 개념과 인간 행동의 원인, 심리적 동기 등에 대해 설명합니다.',
      highlight: false
    },
    {
      id: 3,
      type: 'ad',
      title: '[광고] 인간 심리 분석 도서 베스트셀러 - 쿠팡',
      url: 'https://www.coupang.com/psychology-books',
      snippet: '인간 심리 관련 도서, 오늘 주문 내일 도착! 무료배송 특가.',
      highlight: true
    },
    {
      id: 4,
      type: 'lecture',
      title: '인간 심리의 이해를 위한 추천 강의',
      url: 'https://www.edwith.org/psychology-course',
      snippet: '무료로 수강 가능한 심리학 입문 강의 모음. 인간 심리의 기초부터 심화까지.',
      highlight: false
    },
    {
      id: 5,
      type: 'news',
      title: '[연예] 인간 심리와 관련된 스타들의 일화',
      url: 'https://entertain.naver.com/read?oid=123&aid=456789',
      snippet: '최근 한 예능에서 스타들이 밝힌 심리적 고민과 극복 사례가 화제입니다.',
      highlight: true
    },
    {
      id: 6,
      type: 'lecture',
      title: '심리학자들이 말하는 인간 심리의 핵심 강의',
      url: 'https://www.psychologytoday.com/kr/blog/understanding-human-mind',
      snippet: '심리학자들의 연구를 바탕으로 인간 심리의 핵심을 쉽게 설명하는 강의입니다.',
      highlight: false
    },
    {
      id: 7,
      type: 'shopping',
      title: '[쇼핑] 인간 심리 관련 굿즈 모음',
      url: 'https://smartstore.naver.com/psychology-goods',
      snippet: '심리학 명언 엽서, 마스코트 인형 등 다양한 굿즈를 만나보세요.',
      highlight: true
    },
    {
      id: 8,
      type: 'video',
      title: '인간 심리의 이해 - 유튜브 강연',
      url: 'https://www.youtube.com/watch?v=abcd1234',
      snippet: '전문가가 쉽게 설명하는 인간 심리의 이해. 영상으로 배우는 심리학.',
      highlight: false
    },
  ];

  // 필터링: 키워드가 해제된 경우 해당 type의 결과는 제거
  const allowedTypes = filterKeywords ?? ['ad', 'news', 'shopping', 'wiki', 'lecture', 'video'];

  return (
    <div className="bg-gray-100">
      {/* Browser Header - BrowserFrame과 동일한 스타일 적용 */}
      <div className="bg-gray-200 px-4 py-3 flex items-center gap-3 border-b">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
          <ArrowRight className="w-4 h-4" />
          <RefreshCw className="w-4 h-4" />
        </div>

        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2">
          <Chrome className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">https://search/인간-심리의-이해</span>
        </div>

        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </div>

      {/* Website Content */}
      <div className="bg-white min-h-[600px] p-6">
      {/* 구글 로고 */}
      <div className="flex justify-center mt-3 mb-8">
        <div className="text-6xl font-light tracking-tight">
          <span className="text-blue-500">G</span>
          <span className="text-red-500">o</span>
          <span className="text-yellow-500">o</span>
          <span className="text-blue-500">g</span>
          <span className="text-green-500">l</span>
          <span className="text-red-500">e</span>
        </div>
      </div>
      {/* 검색창 */}
      <div className="flex items-center gap-2 mb-6">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          value="인간 심리의 이해"
          readOnly
        />
        <button className="bg-blue-600 text-white rounded-full px-5 py-2 font-semibold shadow hover:bg-blue-700 transition">검색</button>
      </div>
      {/* 키워드 설정 안내 */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-gray-600">Cleen 카테고리 설정:</span>
        {['ad', 'news', 'shopping', 'wiki', 'lecture', 'video'].map(k => (
          <span
            key={k}
            className={`inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-semibold mr-1 ${filterKeywords && !filterKeywords.includes(k) ? 'opacity-40 line-through' : ''}`}
          >
            {k === 'ad' ? '광고' : k === 'news' ? '연예' : k === 'shopping' ? '쇼핑' : k === 'wiki' ? '위키' : k === 'lecture' ? '강의' : '영상'}
          </span>
        ))}
        <span className="ml-2 text-xs text-gray-400">(카테고리 설정 시 아래 결과에서 제거됨)</span>
      </div>
      {/* 검색 결과 */}
      <div className="rounded-xl border border-gray-200 shadow p-6 space-y-6">
        {searchResults.filter(r => allowedTypes.includes(r.type)).map(result => (
          <div key={result.id} className="relative group">
            <div className="block cursor-pointer">
              <h3 className={
                `text-lg font-semibold mb-1 ${result.highlight ? 'text-red-600' : 'text-blue-800'}`
              }>
                {result.title}
                {result.type === 'ad' && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">광고</span>}
                {result.type === 'news' && <span className="ml-2 text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded">연예</span>}
                {result.type === 'shopping' && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">쇼핑</span>}
                {result.type === 'wiki' && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">위키</span>}
                {result.type === 'lecture' && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">강의</span>}
                {result.type === 'video' && <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">영상</span>}
              </h3>
              <div className="text-sm text-gray-700 mb-1">{result.snippet}</div>
              <div className="text-xs text-gray-500">{result.url}</div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default MockWebsite;
