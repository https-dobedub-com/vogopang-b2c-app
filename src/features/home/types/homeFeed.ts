export type HomeSectionType = 'main-banner' | 'new-books' | 'recommended-books' | 'events';

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  title: string;
  description: string;
};

export type HomeFeed = {
  updatedAt: string;
  sections: HomeSection[];
};
