import dayjs from 'dayjs';
import { useQuery } from 'react-query';

import type { Appointment, User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from './useUser';

// for when we need a query function for useQuery
async function getUserAppointments(
  user: User | null,
): Promise<Appointment[] | null> {
  // 유저 데이터가 없을 시(미로그인 시), null 값을 반환해 데이터 요청을 안함
  if (!user) return null;
  const { data } = await axiosInstance.get(`/user/${user.id}/appointments`, {
    headers: getJWTHeader(user),
  });
  return data.appointments;
}

export function useUserAppointments(): Appointment[] {
  // 의존적 쿼리
  // 유저의 상태와 관련된 모든 쿼리가 user쿼리를 구독
  const { user } = useUser();

  const fallback: Appointment[] = [];
  const { data: userAppointments = fallback } = useQuery(
    'user-appointments',
    () => getUserAppointments(user),
    // user가 true일 때, enabled
    { enabled: !!user },
  );
  return userAppointments;
}
