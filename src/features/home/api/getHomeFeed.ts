import { MOCK_BOOKS } from '../../books/data/mockBooks';
import type { HomeBook, HomeFeed } from '../types/homeFeed';

function toHomeBook(id: string): HomeBook {
  const book = MOCK_BOOKS.find((item) => item.id === id);

  if (!book) {
    throw new Error(`Missing mock book: ${id}`);
  }

  return {
    id: book.id,
    title: book.title,
    author: book.author,
    ageRange: book.ageRange,
  };
}

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
      books: ['book-101', 'book-102', 'book-103'].map(toHomeBook),
    },
    {
      id: 'sec-recommended-books',
      type: 'recommended-books',
      title: '추천 도서',
      description: '연령/주제 기반 추천 목록입니다.',
      books: ['book-104', 'book-105', 'book-201'].map(toHomeBook),
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
