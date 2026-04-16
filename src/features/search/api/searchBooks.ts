import type { AppMode } from '../../mode/context/AppModeProvider';
import type { SearchBook } from '../types/searchBook';

const MOCK_BOOKS: SearchBook[] = [
  {
    id: 'book-101',
    title: '일리어드',
    author: '글 작가 / 그림 작가',
    ageRange: '4 ~ 5세 과정',
    allowedModes: ['kids', 'guardian'],
  },
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기',
    author: '글 작가 / 그림 작가',
    ageRange: '5 ~ 7세 과정',
    allowedModes: ['kids', 'guardian'],
  },
  {
    id: 'book-103',
    title: '만화 삼국지 도원결의',
    author: '보고팡 출판',
    ageRange: '6 ~ 8세 과정',
    allowedModes: ['kids', 'guardian'],
  },
  {
    id: 'book-104',
    title: '학부모 가이드: 독서 습관 만들기',
    author: '보고팡 교육연구소',
    ageRange: '보호자 참고 자료',
    allowedModes: ['guardian'],
  },
  {
    id: 'book-105',
    title: '학습 리포트 해설집',
    author: '보고팡 교육연구소',
    ageRange: '보호자 참고 자료',
    allowedModes: ['guardian'],
  },
];

type SearchBooksOptions = {
  mode: AppMode;
};

export async function searchBooks(query: string, options: SearchBooksOptions): Promise<SearchBook[]> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return MOCK_BOOKS.filter((book) => {
    if (!book.allowedModes.includes(options.mode)) {
      return false;
    }

    const target = `${book.title} ${book.author} ${book.ageRange}`.toLowerCase();
    return target.includes(normalizedQuery);
  });
}
