import { Spinner, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useIsFetching, useIsMutating } from 'react-query';

export function Loading(): ReactElement {
  // will use React Query `useIsFetching` to determine whether or not to display
  // const isFetching = false; // for now, just don't display

  // useIsFetching 훅을 사용해 전역으로 로딩 상태 관리
  // 쿼리 콜의 상태를 나타내는 정수 값 반환
  // 반환되는 정수가 0보다 크면 true
  const isFetching = useIsFetching();
  // 해결되지 않은 변이 함수의 개수가 정수로 반환
  const isMutating = useIsMutating();

  const display = isFetching || isMutating ? 'inherit' : 'none';

  return (
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="olive.200"
      color="olive.800"
      role="status"
      position="fixed"
      zIndex="9999"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      display={display}
    >
      <Text display="none">Loading...</Text>
    </Spinner>
  );
}
