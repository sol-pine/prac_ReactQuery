import { useMutation, UseMutateFunction } from 'react-query';
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';
import { useCustomToast } from '../../app/hooks/useCustomToast';

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

  const { mutate: patchUser } = useMutation(
    (newUserData: User) =>
      // (newData) => patch함수(newData, originalData)
      patchUserOnServer(newUserData, user),
    {
      // 서버에서 받은 응답(변이함수에서 얻은 응답)으로 쿼리 캐시 업데이트
      onSuccess: (userData: User | null) => {
        if (user) {
          updateUser(userData);
          toast({
            title: '사용자 정보가 업데이트 되었습니다!',
            status: 'success',
          });
        }
      },
    },
  );

  return patchUser;
}
