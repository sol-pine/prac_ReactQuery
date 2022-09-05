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

async function getUser(user: User | null): Promise<User | null> {
  if (!user) return null;
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      headers: getJWTHeader(user),
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
  const { data: user } = useQuery(queryKeys.user, () => getUser(user));

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
  }

  return { user, updateUser, clearUser };
}
