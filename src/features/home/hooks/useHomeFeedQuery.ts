import { useQuery } from '@tanstack/react-query';

import { getHomeFeed } from '../api/getHomeFeed';

export function useHomeFeedQuery() {
  return useQuery({
    queryKey: ['home-feed'],
    queryFn: getHomeFeed,
  });
}
