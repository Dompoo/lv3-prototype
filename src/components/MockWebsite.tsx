import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, ThumbsUp, Share2, Flag, User } from 'lucide-react';
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

  // 이전 키워드를 추적하기 위한 ref
  const prevKeywordsRef = useRef<string[]>([]);
  
  // Gemini API를 사용해서 키워드와 관련된 게시물 ID들을 가져옴
  useEffect(() => {
    // 키워드가 실제로 변경되었는지 확인
    const keywordsChanged = JSON.stringify(filterKeywords) !== JSON.stringify(prevKeywordsRef.current);
    
    if (!keywordsChanged) {
      console.log('🔍 키워드 변경 없음, API 호출 스킵');
      return;
    }
    
    // 현재 키워드를 저장
    prevKeywordsRef.current = [...filterKeywords];
    
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
        // API 제한 오류 시 fallback으로 기본 키워드 매칭 사용
        const fallbackIds = inappropriateContent
          .filter(post => {
            const text = `${post.title} ${post.content}`.toLowerCase();
            return filterKeywords.some(keyword => text.includes(keyword.toLowerCase()));
          })
          .map(post => post.id);
        console.log('🔄 Fallback 키워드 매칭 결과:', fallbackIds);
        setFilteredPostIds(fallbackIds);
      }
    };

    // Debounce: 500ms 지연 후 API 호출
    const timeoutId = setTimeout(analyzeContent, 500);
    return () => clearTimeout(timeoutId);
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
              {hasFilterKeyword && !shouldMosaic && !shouldHide && (
                <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded">
                  키워드 발견
                </span>
              )}
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


export default MockWebsite;
