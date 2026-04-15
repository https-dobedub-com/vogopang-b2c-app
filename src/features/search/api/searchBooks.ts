import type { SearchBook } from '../types/searchBook';

const MOCK_BOOKS: SearchBook[] = [
  { id: 'book-101', title: '일리어드', author: '글 작가 / 그림 작가', ageRange: '4 ~ 5세 과정' },
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기',
    author: '글 작가 / 그림 작가',
    ageRange: '5 ~ 7세 과정',
  },
  { id: 'book-103', title: '만화 삼국지 도원결의', author: '보고팡 출판', ageRange: '6 ~ 8세 과정' },
  { id: 'book-104', title: '그리스 로마 신화', author: '보고팡 출판', ageRange: '5 ~ 7세 과정' },
  { id: 'book-105', title: '100 시리즈', author: '보고팡 출판', ageRange: '5 ~ 7세 과정' },
];

export async function searchBooks(query: string): Promise<SearchBook[]> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return MOCK_BOOKS.filter((book) => {
    const target = `${book.title} ${book.author} ${book.ageRange}`.toLowerCase();
    return target.includes(normalizedQuery);
  });
}
