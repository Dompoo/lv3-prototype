// DC인사이드 게시글 필터링 콘텐츠 스크립트
console.log('Cleen 콘텐츠 스크립트 로드됨');

// 현재 설정
let currentSettings = {
  filterEnabled: false,
  keywords: ['욕설', '논란', '19금'],
  sensitivityLevel: 2,
  filterMode: 'purify'
};

// 필터링된 게시물 ID들
let filteredPostIds = [];
let purifyData = {};

// DC인사이드 페이지 구조별 선택자 정의
const POST_SELECTORS = {
  // 갤러리 목록 페이지
  galleryList: {
    container: '.gall_list',
    postRows: '.gall_list .us-post[data-no]', // 'data-no' 속성이 있는 게시물 행만 선택
    postTitle: '.gall_tit a', // 제목은 <a> 태그 안에 있음
    postAuthor: '.gall_writer .nickname', // 작성자 닉네임
    postDate: '.gall_date',
    postViews: '.gall_count',
    postComments: '.gall_reply'
  },
  
  // 게시물 상세 페이지
  postDetail: {
    container: '.view_content_wrap',
    title: '.title_subject',
    content: '.writing_view_box .fr-view',
    author: '.gall_writer .nickname',
    date: '.fl .gall_date',
    comments: '.cmt_list .cmt_info'
  },
  
  // 댓글 목록
  comments: {
    container: '.cmt_list',
    commentItems: '.cmt_list li:not(.best_cmt)',
    commentText: '.usertxt ub-word',
    commentAuthor: '.nickname'
  },
  
  // 공통 선택자
  common: {
    postId: function(element) {
      // 게시물 ID 추출 (data-no 속성을 직접 사용)
      return parseInt(element.dataset.no, 10);
    },
    
    // 현재 페이지 타입 감지
    getPageType: function() {
      if (document.querySelector('.view_content_wrap')) {
        return 'detail'; // 게시물 상세 페이지
      } else if (document.querySelector('.gall_list')) {
        return 'list'; // 갤러리 목록 페이지
      } else if (document.querySelector('.minor_ranking_box')) {
        return 'minor'; // 마이너 갤러리
      } else {
        return 'unknown';
      }
    }
  }
};

// 초기화
async function initialize() {
  console.log('Cleen 초기화 시작');
  
  // 설정 로드
  await loadSettings();
  
  // 필터링 적용
  if (currentSettings.filterEnabled) {
    await applyFiltering();
  }
  
  // 동적 콘텐츠 감지를 위한 옵저버 설정
  setupObserver();
  
  console.log('Cleen 초기화 완료');
}

// 설정 로드
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    if (response.success) {
      currentSettings = response.settings;
      console.log('설정 로드됨:', currentSettings);
    }
  } catch (error) {
    console.error('설정 로드 실패:', error);
  }
}

// 필터링 적용
async function applyFiltering() {
  if (!currentSettings.filterEnabled) {
    console.log('필터링이 비활성화되어 있습니다');
    return;
  }
  
  console.log('필터링 적용 시작');
  
  // 게시물 수집
  const posts = collectPosts();
  
  if (posts.length === 0) {
    console.log('분석할 게시물이 없습니다');
    return;
  }
  
  console.log(`${posts.length}개 게시물 수집됨`);
  
  try {
    // 백그라운드 스크립트에 분석 요청
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_CONTENT',
      posts: posts,
      keywords: currentSettings.keywords,
      sensitivityLevel: currentSettings.sensitivityLevel,
      filterMode: currentSettings.filterMode
    });
    
    if (response.success) {
      filteredPostIds = response.result.filteredPostIds || [];
      purifyData = response.result.purifyData || {};
      
      console.log('분석 완료:', {
        filteredCount: filteredPostIds.length,
        purifyDataCount: Object.keys(purifyData).length,
        usedFallback: response.usedFallback
      });
      
      // UI 업데이트
      updatePostsUI();
      
      // 필터링 상태 표시
      showFilteringStatus();
    } else {
      console.error('콘텐츠 분석 실패:', response.error);
    }
  } catch (error) {
    console.error('필터링 적용 실패:', error);
  }
}

// 게시물 수집
function collectPosts() {
  const posts = [];
  const pageType = POST_SELECTORS.common.getPageType();
  
  console.log('페이지 타입:', pageType);
  
  if (pageType === 'list') {
    // 갤러리 목록 페이지에서 게시물 수집
    const postElements = document.querySelectorAll(POST_SELECTORS.galleryList.postRows);
    
    postElements.forEach((element, index) => {
      try {
        const titleElement = element.querySelector(POST_SELECTORS.galleryList.postTitle) || 
                           element.querySelector(POST_SELECTORS.galleryList.postTitleLink);
        const authorElement = element.querySelector(POST_SELECTORS.galleryList.postAuthor);
        
        if (titleElement) {
          const title = titleElement.textContent?.trim() || '';
          const author = authorElement?.textContent?.trim() || '익명';
          const id = POST_SELECTORS.common.postId(element);
          
          // 목록 페이지에서는 제목만 있으므로 content는 title과 동일
          const content = title;
          
          if (title && id) {
            posts.push({
              id,
              title,
              content,
              author,
              element,
              type: 'list'
            });
          }
        }
      } catch (error) {
        console.error('목록 게시물 수집 중 오류:', error, element);
      }
    });
    
  } else if (pageType === 'detail') {
    // 게시물 상세 페이지에서 메인 게시물과 댓글 수집
    
    // 메인 게시물
    const titleElement = document.querySelector(POST_SELECTORS.postDetail.title);
    const contentElement = document.querySelector(POST_SELECTORS.postDetail.content);
    const authorElement = document.querySelector(POST_SELECTORS.postDetail.author);
    
    if (titleElement && contentElement) {
      const title = titleElement.textContent?.trim() || '';
      const content = contentElement.textContent?.trim() || '';
      const author = authorElement?.textContent?.trim() || '익명';
      
      // URL에서 게시물 ID 추출
      const urlMatch = window.location.href.match(/no=(\d+)/);
      const id = urlMatch ? parseInt(urlMatch[1]) : 1;
      
      posts.push({
        id,
        title,
        content,
        author,
        element: contentElement.closest('.view_content_wrap'),
        type: 'detail'
      });
    }
    
    // 댓글들
    const commentElements = document.querySelectorAll(POST_SELECTORS.comments.commentItems);
    commentElements.forEach((element, index) => {
      try {
        const textElement = element.querySelector(POST_SELECTORS.comments.commentText);
        const authorElement = element.querySelector(POST_SELECTORS.comments.commentAuthor);
        
        if (textElement) {
          const content = textElement.textContent?.trim() || '';
          const author = authorElement?.textContent?.trim() || '익명';
          const id = POST_SELECTORS.common.postId(element);
          
          if (content && content.length > 2) { // 짧은 댓글은 제외
            posts.push({
              id,
              title: `댓글: ${content.substring(0, 20)}...`,
              content,
              author,
              element,
              type: 'comment'
            });
          }
        }
      } catch (error) {
        console.error('댓글 수집 중 오류:', error, element);
      }
    });
  }
  
  console.log(`${posts.length}개 게시물/댓글 수집됨 (페이지: ${pageType})`);
  return posts;
}

// 게시물 UI 업데이트
function updatePostsUI() {
  const posts = collectPosts();
  
  posts.forEach(post => {
    const isFiltered = filteredPostIds.includes(post.id);
    
    if (!isFiltered) {
      // 필터링되지 않은 게시물은 원래 상태로 복원
      restorePostElement(post.element);
      return;
    }
    
    console.log(`필터링 적용: ${post.type} ID ${post.id} - ${post.title.substring(0, 20)}...`);
    
    // 필터링된 게시물에 대한 처리
    switch (currentSettings.filterMode) {
      case 'purify':
        applyPurifyMode(post);
        break;
      case 'mosaic':
        applyMosaicMode(post);
        break;
      case 'remove':
        applyRemoveMode(post);
        break;
    }
  });
}

// 순화 모드 적용
function applyPurifyMode(post) {
  if (!purifyData[post.id] || purifyData[post.id].length === 0) {
    addKeywordTag(post.element, post.type);
    return;
  }
  
  const targetWords = purifyData[post.id];
  
  // 게시물 타입별로 다르게 처리
  if (post.type === 'list') {
    // 목록 페이지 - 제목만 처리
    const titleElement = post.element.querySelector(POST_SELECTORS.galleryList.postTitle) ||
                        post.element.querySelector(POST_SELECTORS.galleryList.postTitleLink);
    if (titleElement) {
      const purifiedTitle = purifyText(post.title, targetWords);
      titleElement.innerHTML = purifiedTitle;
    }
  } else if (post.type === 'detail') {
    // 상세 페이지 - 제목과 내용 모두 처리
    const titleElement = post.element.querySelector(POST_SELECTORS.postDetail.title);
    const contentElement = post.element.querySelector(POST_SELECTORS.postDetail.content);
    
    if (titleElement) {
      const purifiedTitle = purifyText(post.title, targetWords);
      titleElement.innerHTML = purifiedTitle;
    }
    
    if (contentElement) {
      const purifiedContent = purifyText(post.content, targetWords);
      contentElement.innerHTML = purifiedContent;
    }
  } else if (post.type === 'comment') {
    // 댓글 - 댓글 텍스트만 처리
    const textElement = post.element.querySelector(POST_SELECTORS.comments.commentText);
    if (textElement) {
      const purifiedText = purifyText(post.content, targetWords);
      textElement.innerHTML = purifiedText;
    }
  }
  
  // 키워드 발견 태그 추가
  addKeywordTag(post.element, post.type);
}

// 모자이크 모드 적용
function applyMosaicMode(post) {
  const postElement = post.element;
  
  // 이미 모자이크가 적용되어 있으면 건너뛰기
  if (postElement.querySelector('.cleen-mosaic-overlay')) {
    return;
  }
  
  // 모자이크 오버레이 생성
  const overlay = document.createElement('div');
  overlay.className = 'cleen-mosaic-overlay';
  
  let overlayText = '필터링된 키워드';
  if (post.type === 'comment') {
    overlayText = '필터링된 댓글';
  } else if (post.type === 'detail') {
    overlayText = '필터링된 게시물';
  }
  
  overlay.innerHTML = `
    <div class="cleen-mosaic-content">
      <div class="cleen-mosaic-icon">🔒</div>
      <div class="cleen-mosaic-text">${overlayText}</div>
      <div class="cleen-mosaic-subtext">모자이크 처리됨</div>
    </div>
  `;
  
  // 댓글인 경우 더 작은 오버레이 사용
  if (post.type === 'comment') {
    overlay.classList.add('cleen-mosaic-comment');
  }
  
  postElement.style.position = 'relative';
  postElement.appendChild(overlay);
}

// 제거 모드 적용
function applyRemoveMode(post) {
  post.element.style.display = 'none';
  post.element.setAttribute('data-cleen-removed', 'true');
}

// 게시물 원래 상태로 복원
function restorePostElement(element) {
  // 모자이크 오버레이 제거
  const overlay = element.querySelector('.cleen-mosaic-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // 숨김 해제
  element.style.display = '';
  element.removeAttribute('data-cleen-removed');
  
  // 키워드 태그 제거
  const tag = element.querySelector('.cleen-keyword-tag');
  if (tag) {
    tag.remove();
  }
}

// 텍스트 순화 처리
function purifyText(text, targetWords) {
  let processedText = text;
  targetWords.forEach(word => {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    processedText = processedText.replace(regex, (match) => {
      return '█'.repeat(match.length);
    });
  });
  return processedText;
}

// 키워드 발견 태그 추가
function addKeywordTag(element, postType) {
  if (element.querySelector('.cleen-keyword-tag')) {
    return; // 이미 태그가 있으면 건너뛰기
  }
  
  const tag = document.createElement('span');
  tag.className = 'cleen-keyword-tag';
  
  let tagText = '키워드 발견';
  if (postType === 'comment') {
    tagText = '댓글 필터링';
  } else if (postType === 'detail') {
    tagText = '게시물 필터링';
  }
  
  tag.textContent = tagText;
  
  // 게시물 타입별로 태그 위치 결정
  let targetElement = null;
  
  if (postType === 'list') {
    targetElement = element.querySelector(POST_SELECTORS.galleryList.postTitle) ||
                   element.querySelector(POST_SELECTORS.galleryList.postTitleLink);
  } else if (postType === 'detail') {
    targetElement = element.querySelector(POST_SELECTORS.postDetail.title);
  } else if (postType === 'comment') {
    targetElement = element.querySelector(POST_SELECTORS.comments.commentText);
  }
  
  if (targetElement) {
    // 태그를 요소 뒤에 추가
    if (targetElement.parentNode) {
      targetElement.parentNode.insertBefore(tag, targetElement.nextSibling);
    } else {
      targetElement.appendChild(tag);
    }
  } else {
    // fallback: 요소 내부에 추가
    element.appendChild(tag);
  }
}

// 필터링 상태 표시
function showFilteringStatus() {
  // 기존 상태 바 제거
  const existingStatus = document.querySelector('.cleen-status-bar');
  if (existingStatus) {
    existingStatus.remove();
  }
  
  if (!currentSettings.filterEnabled) {
    return;
  }
  
  // 새 상태 바 생성
  const statusBar = document.createElement('div');
  statusBar.className = 'cleen-status-bar';
  statusBar.innerHTML = `
    <div class="cleen-status-content">
      <div class="cleen-status-icon">🛡️</div>
      <div class="cleen-status-text">
        Cleen 필터 활성화 - ${filteredPostIds.length}개 게시물 필터링됨
      </div>
      <div class="cleen-status-details">
        키워드: ${currentSettings.keywords.join(', ')} | 
        민감도: ${currentSettings.sensitivityLevel} | 
        모드: ${getModeText(currentSettings.filterMode)}
      </div>
    </div>
  `;
  
  // 페이지 상단에 추가
  document.body.insertBefore(statusBar, document.body.firstChild);
}

// 모드 텍스트 변환
function getModeText(mode) {
  switch (mode) {
    case 'purify': return '순화';
    case 'mosaic': return '모자이크';
    case 'remove': return '제거';
    default: return '알 수 없음';
  }
}

// 동적 콘텐츠 감지를 위한 옵저버 설정
function setupObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldReapplyFiltering = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 새로운 게시물이 추가되었는지 확인
        const hasNewPosts = Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return false;
          
          // 갤러리 목록 테이블 행 확인
          if (node.matches && (
            node.matches('.gall_list tbody tr') ||
            node.matches('.cmt_list li') ||
            node.matches('.view_content_wrap')
          )) {
            return true;
          }
          
          // 하위 요소에서 새 게시물/댓글 확인
          if (node.querySelector) {
            return !!(
              node.querySelector('.gall_list tbody tr') ||
              node.querySelector('.cmt_list li') ||
              node.querySelector('.view_content_wrap')
            );
          }
          
          return false;
        });
        
        if (hasNewPosts) {
          shouldReapplyFiltering = true;
        }
      }
    });
    
    if (shouldReapplyFiltering) {
      console.log('새 콘텐츠 감지됨, 필터링 재적용');
      // 짧은 지연 후 필터링 적용 (DOM 업데이트 대기)
      setTimeout(() => {
        applyFiltering();
      }, 500);
    }
  });
  
  // 관찰할 타겟 요소들 설정
  const targets = [
    document.querySelector('.gall_list'), // 갤러리 목록
    document.querySelector('.cmt_list'), // 댓글 목록
    document.querySelector('.view_content_wrap'), // 게시물 상세
    document.body // fallback
  ].filter(Boolean);
  
  targets.forEach(target => {
    observer.observe(target, {
      childList: true,
      subtree: true
    });
  });
  
  console.log(`DOM 옵저버 설정 완료 (${targets.length}개 타겟)`);
}

// 백그라운드 스크립트에서 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('콘텐츠 스크립트에서 메시지 수신:', request);
  
  if (request.type === 'SETTINGS_UPDATED') {
    currentSettings = request.settings;
    console.log('설정 업데이트됨:', currentSettings);
    
    if (currentSettings.filterEnabled) {
      applyFiltering();
    } else {
      // 필터링 비활성화 시 모든 효과 제거
      const posts = collectPosts();
      posts.forEach(post => restorePostElement(post.element));
      
      const statusBar = document.querySelector('.cleen-status-bar');
      if (statusBar) {
        statusBar.remove();
      }
    }
    
    sendResponse({ success: true });
  }
});

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// 페이지 URL 변경 감지 (SPA 대응)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log('URL 변경 감지, 필터링 재적용');
    setTimeout(initialize, 1000); // 페이지 로드 완료 대기
  }
}, 1000);