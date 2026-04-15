export type HomeSectionType = 'main-banner' | 'new-books' | 'recommended-books' | 'events';

export type HomeBanner = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
};

export type HomeBook = {
  id: string;
  title: string;
  author: string;
  ageRange: string;
};

export type HomeEvent = {
  id: string;
  title: string;
  summary: string;
};

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  title: string;
  description?: string;
  banners?: HomeBanner[];
  books?: HomeBook[];
  events?: HomeEvent[];
};

export type HomeFeed = {
  updatedAt: string;
  sections: HomeSection[];
};
