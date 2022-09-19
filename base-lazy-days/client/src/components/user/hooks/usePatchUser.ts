import jsonpatch from 'fast-json-patch';
import { useMutation, UseMutateFunction, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { queryKeys } from '../../../react-query/constants';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newUserData: User) =>
      // (newData) => patch함수(newData, originalData)
      patchUserOnServer(newUserData, user),
    {
      onMutate: async (newData: User | null) => {
        // 오래된 서버 데이터가 optimistic update를 덮어쓰지 않도록
        // 진행 중인 유저 데이터 쿼리 취소
        queryClient.cancelQueries(queryKeys.user);

        // 기존 캐시 데이터 저장
        const previousUserData: User = queryClient.getQueryData(queryKeys.user);

        // 새로운 유저 데이터로 캐시 업데이트 (optimistic update)
        updateUser(newData);

        // context(기존 캐시 데이터) 반환
        return { previousUserData };
      },

      // onError 핸들러가 context(복원할 이전 데이터) 값을 인수로 받음
      // 에러 발생 시, context 값으로 캐시 롤백
      onError: (error, newData, context) => {
        // 서버에서 받은 응답(변이함수에서 얻은 응답)으로 쿼리 캐시 업데이트
        if (context.previousUserData) {
          updateUser(context.previousUserData);
          toast({
            title: '업데이트 실패: 이전 데이터로 복원',
            status: 'warning',
          });
        }
      },

      onSuccess: (userData: User | null) => {
        if (user) {
          toast({
            title: '사용자 정보가 업데이트 되었습니다!',
            status: 'success',
          });
        }
      },

      // 변이 실행 시, 성공 여부와 상관없이 onSettled 콜백
      onSettled: () => {
        // 유저 데이터 무효화 => 서버가 최신 데이터를 보여줄 수 있도록
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );

  return patchUser;
}
