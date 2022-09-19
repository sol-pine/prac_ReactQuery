import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

async function getUser(
  user: User | null,
  signal: AbortSignal,
): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
      // Axios 인스턴스로 중단 신호 전달 => 수동으로 쿼리 취소
      signal,
    },
  );
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

export function useUser(): UseUser {
  // 훅을 이용해 queryClient 가져옴
  const queryClient = useQueryClient();
  // 기존 유저 데이터(캐시 데이터)를 이용해 서버에서 데이터 get
  const { data: user } = useQuery(
    queryKeys.user,
    // 수동으로 쿼리 취소 : 쿼리 함수의 인수로 중단 신호(AbortController signal)전달
    ({ signal }) => getUser(user, signal),
    {
      // 초기 데이터 값을 캐시에 추가하고 싶을 때 사용
      initialData: getStoredUser,
      // 데이터가 업데이트되면 onSuccess 콜백 실행
      // 쿼리함수(getUser)에서 리턴된 데이터를 가져오거나,
      // setQueryData에서 업데이트된 데이터를 가져옴
      onSuccess: (received: User | null) => {
        if (!received) {
          // 유저가 로그아웃하면(received가 null인 경우) 로컬스토리지 클리어
          clearStoredUser();
        } else {
          // 유저 데이터를 로컬스토리지에 저장
          setStoredUser(received);
        }
      },
    },
  );

  // meant to be called from useAuth
  function updateUser(newUser: User): void {
    // 유저가 성공적으로 로그인 했을 경우, 캐시에 유저 데이터 업데이트
    // setQueryData(쿼리키, 업데이트데이터)
    queryClient.setQueryData(queryKeys.user, newUser);
  }

  // meant to be called from useAuth
  function clearUser() {
    // 유저가 로그아웃하면 캐시에 있는 유저 데이터 null로 무효화
    queryClient.setQueryData(queryKeys.user, null);
    // 유저가 로그아웃했을 때 본인의 예약 쿼리 데이터가 보이지 않도록 함
    // queryClient.removeQueries([QueryKeyPrefix])
    queryClient.removeQueries([queryKeys.appointments, queryKeys.user]);
  }

  return { user, updateUser, clearUser };
}
