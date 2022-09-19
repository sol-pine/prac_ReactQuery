import { useMutation, UseMutateFunction, useQueryClient } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from '../../user/hooks/useUser';

// for when we need functions for useMutation
async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined,
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? 'replace' : 'add';
  const patchData = [{ op: patchOp, path: '/userId', value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

// useMutateFunction hook type
// <TData (mutate 함수에서 반환된 데이터 타입(리턴 데이터가 없으면 void)) = unknown,
// TError (에러 타입) = unknown,
// TVariables (함수로 전달될 변수 타입) = void,
// TContext (optimistic update rollback 서버 업데이트 전 미리 UI를 변경한 후, 롤백) = unknown>
export function useReserveAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const { user } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  // useMutation() 캐시와 관련이 없어 쿼리키가 필요 없음
  const { mutate } = useMutation(
    (appointment: Appointment) => setAppointmentUser(appointment, user?.id),
    {
      // queryClient.invalidateQueries : 유효하지 않은(stale) 쿼리 처리
      // 유효하지 않은 캐시 데이터 무효화
      // 데이터 업데이트 시, 새로고침 필요 없음
      // mutate 호출 => mutate의 onSuccess 핸들러가 쿼리 무효화 => 쿼리가 렌더중이면 Refetch 트리거
      onSuccess: () => {
        // queryClient.invalidateQueries(무효화할쿼리키 => Query Key Prefix)
        // Query Key Prefix : 변이 실행 시, 모든 관련 쿼리 무효화
        queryClient.invalidateQueries([queryKeys.appointments]);
        toast({
          title: '예약이 완료되었습니다!',
          status: 'success',
        });
      },
    },
  );
  return mutate;
}
