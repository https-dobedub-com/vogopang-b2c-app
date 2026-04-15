import type { HomeFeed } from '../types/homeFeed';

const MOCK_HOME_FEED: HomeFeed = {
  updatedAt: new Date().toISOString(),
  sections: [
    {
      id: 'sec-main-banner',
      type: 'main-banner',
      title: '이번 주 추천',
      banners: [
        {
          id: 'banner-hero-1',
          title: '그리스 로마 신화',
          subtitle: '상상력을 키우는 스토리 시리즈',
          badge: 'BEST',
        },
        {
          id: 'banner-hero-2',
          title: '최고를 꿈꾼 사람들',
          subtitle: '위인전으로 만나는 도전 이야기',
        },
      ],
    },
    {
      id: 'sec-new-books',
      type: 'new-books',
      title: '신규 도서',
      description: '최근 등록된 도서 목록입니다.',
      books: [
        { id: 'book-101', title: '일리어드', author: '글 작가 / 그림 작가', ageRange: '4 ~ 5세 과정' },
        {
          id: 'book-102',
          title: '최고를 꿈꾼 사람들의 이야기',
          author: '글 작가 / 그림 작가',
          ageRange: '5 ~ 7세 과정',
        },
        { id: 'book-103', title: '만화 삼국지 도원결의', author: '글 작가 / 그림 작가', ageRange: '6 ~ 8세 과정' },
      ],
    },
    {
      id: 'sec-recommended-books',
      type: 'recommended-books',
      title: '추천 도서',
      description: '연령/주제 기반 추천 목록입니다.',
      books: [
        { id: 'book-201', title: '100 시리즈', author: '보고팡 출판', ageRange: '5 ~ 7세 과정' },
        { id: 'book-202', title: '함께하는 문화', author: '보고팡 출판', ageRange: '6 ~ 8세 과정' },
        { id: 'book-203', title: '예술 · 감각', author: '보고팡 출판', ageRange: '4 ~ 6세 과정' },
      ],
    },
    {
      id: 'sec-events',
      type: 'events',
      title: '이벤트',
      events: [
        {
          id: 'event-1',
          title: '봄맞이 읽기 챌린지',
          summary: '읽기 목록 5권 달성 시 배지를 지급합니다.',
        },
        {
          id: 'event-2',
          title: '학부모 추천 큐레이션',
          summary: '보호자 평점 상위 도서를 매주 업데이트합니다.',
        },
      ],
    },
  ],
};

export async function getHomeFeed(): Promise<HomeFeed> {
  // TODO: replace with real API call when backend endpoint is ready
  await new Promise((resolve) => setTimeout(resolve, 250));
  return MOCK_HOME_FEED;
}
