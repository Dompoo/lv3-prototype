import React from 'react';
import { MessageCircle, ThumbsUp, Share2, Flag, User, Chrome, RefreshCw, ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MockWebsiteProps {
  mosaicEnabled: boolean;
  removeEnabled: boolean;
}

const MockWebsite: React.FC<MockWebsiteProps> = ({
  mosaicEnabled,
  removeEnabled,
}) => {
  const inappropriateContent = [
    {
      id: 1,
      title: "🔥 충격적인 내용이 포함된 게시물",
      content: "이것은 부적절한 언어와 자극적인 내용이 포함된 샘플 게시물입니다. 실제로는 욕설이나 비방 내용이 포함될 수 있습니다.",
      author: "익명사용자123",
      inappropriate: true
    },
    {
      id: 2,
      title: "게임 메타 정보 - 최신 패치 분석",
      content: "이번 패치에서 변경된 챔피언들의 밸런스 변화에 대해 분석해보겠습니다. 정글러들의 루트가 크게 바뀌었네요.",
      author: "게임전문가",
      inappropriate: false
    },
    {
      id: 3,
      title: "⚠️ 논란의 여지가 있는 글",
      content: "이 게시물은 논란이 될 수 있는 내용을 포함하고 있습니다. 모욕적인 표현이나 부적절한 이미지가 포함될 수 있습니다.",
      author: "논란제조기",
      inappropriate: true
    },
    {
      id: 4,
      title: "초보자를 위한 게임 가이드",
      content: "처음 시작하는 분들을 위한 기본적인 게임 플레이 팁을 정리해보았습니다. 단계별로 따라하시면 쉽게 이해할 수 있을 거예요.",
      author: "친절한가이드",
      inappropriate: false
    },
    {
      id: 5,
      title: "🚨 극도로 자극적인 내용 주의",
      content: "이 글은 매우 자극적이고 불쾌감을 줄 수 있는 내용을 담고 있습니다. 혐오 표현이나 부적절한 내용이 포함되어 있을 수 있습니다.",
      author: "문제사용자",
      inappropriate: true
    }
  ];

  const renderPost = (post: any) => {
    const shouldHide = removeEnabled && post.inappropriate;
    const shouldMosaic = mosaicEnabled && post.inappropriate && !removeEnabled;

    if (shouldHide) {
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
          <div className="absolute inset-0 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-white text-center space-y-2">
              <Flag className="w-8 h-8 mx-auto" />
              <p className="font-semibold">부적절한 콘텐츠</p>
              <p className="text-sm opacity-75">모자이크 처리됨</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-800">{post.author}</span>
              <span className="text-sm text-gray-500">• 방금 전</span>
              {post.inappropriate && !shouldMosaic && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                  자극적 콘텐츠
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

  const visiblePosts = inappropriateContent.filter(post => 
    !(removeEnabled && post.inappropriate)
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Website Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티 게시판</h1>
        <p className="text-gray-600">다양한 주제의 게시물을 확인해보세요</p>
      </div>

      {/* Filter Status */}
      {(mosaicEnabled || removeEnabled) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Cleen 필터 활성화</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {removeEnabled 
              ? "부적절한 콘텐츠가 완전히 제거되었습니다" 
              : "부적절한 콘텐츠가 모자이크 처리되었습니다"
            }
          </p>
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
              모든 부적절한 콘텐츠가 제거되었습니다
            </h3>
            <p className="text-gray-500">
              안전한 콘텐츠만 표시됩니다
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
