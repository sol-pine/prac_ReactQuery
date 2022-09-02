import { useQuery } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

export function useTreatments(): Treatment[] {
  // onError 콜백 시, toast 함수 사용
  const toast = useCustomToast();

  const fallback = [];
  // TODO: get data from server via useQuery
  // data destructuring
  // useQuery(쿼리키, 쿼리함수)
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments, {
    onError: (error) => {
      const title =
        error instanceof Error
          ? error.message
          : 'error connecting to the server';
      toast({ title, status: 'error' });
    },
  });

  return data;
}
