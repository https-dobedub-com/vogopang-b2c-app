import type { HomeFeed } from '../types/homeFeed';

const MOCK_HOME_FEED: HomeFeed = {
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: 'sec-main-banner',
      type: 'main-banner',
      title: '메인 배너',
      description: '이번 주 추천 도서를 배너로 노출합니다.',
    },
    {
      id: 'sec-new-books',
      type: 'new-books',
      title: '신규 도서',
      description: '최근 등록된 도서 카드 목록입니다.',
    },
    {
      id: 'sec-recommended-books',
      type: 'recommended-books',
      title: '추천 도서',
      description: '연령/주제 기반 추천 목록입니다.',
    },
    {
      id: 'sec-events',
      type: 'events',
      title: '이벤트',
      description: '프로모션 및 기획전 영역입니다.',
    },
  ],
};

export async function getHomeFeed(): Promise<HomeFeed> {
  // TODO: replace with real API call when backend endpoint is ready
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_HOME_FEED;
}
