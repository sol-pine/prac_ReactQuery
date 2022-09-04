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
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
    // re-fetching option
    // 주의, 리페칭 제한은 자주 업데이트 되지 않는 데이터에만 적용하기
    staleTime: 600000, // 10 mins
    cacheTime: 900000, // 15 mins (기본 값은 5분, staleTime 보다 cacheTime을 더 늘려 리페칭 되기 전엔 캐시 데이터 보여주기)
    refetchOnMount: false, // useQuery를 콜하는 컴포넌트 마운트 시, 리페칭 여부
    refetchOnWindowFocus: false, // 윈도우 재 포커스 시, 리페칭 여부
    refetchOnReconnect: false, // 네트워크 재 연결 시, 리페칭 여부
  });
  return data;
}

// pre-fetching
export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  // prefetchQuery(쿼리키, 쿼리합수)
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments, {
    // 프리페칭이 staleTime과 cacheTime 참조하여 데이터 새로고침 여부 결정
    staleTime: 600000,
    cacheTime: 900000,
  });
}
