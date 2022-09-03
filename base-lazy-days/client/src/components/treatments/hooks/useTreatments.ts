import { useQuery, useQueryClient } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

export function useTreatments(): Treatment[] {
  const fallback = [];
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments);
  return data;
}

// pre-fetching
export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  // prefetchQuery(쿼리키, 쿼리합수)
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments);
}
