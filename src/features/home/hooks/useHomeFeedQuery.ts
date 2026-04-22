import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../lib/queryKeys';
import { getHomeFeed } from '../api/getHomeFeed';

export function useHomeFeedQuery() {
  return useQuery({
    queryKey: queryKeys.homeFeed,
    queryFn: getHomeFeed,
  });
}
