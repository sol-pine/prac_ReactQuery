import InfiniteScroll from "react-infinite-scroller";
import { Person } from "./Person";
import { useInfiniteQuery } from "react-query";

const initialUrl = "https://swapi.dev/api/people/";
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfinitePeople() {
  // TODO: get data for InfiniteScroll via React Query
  // data : 페이지를 로드할 때 마다 페이지 데이터 포함
  // fetchNextPage : 데이터가 더 필요할 때 어떤 함수를 실행할 지 infiniteScroll에 지시
  // hasNextPage : 불러올 다음 페이지가 있는 지? (boolean)
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
    // useInfiniteQuery (쿼리 키, 쿼리 함수, [옵션] getNextPageParam)
    "sw-people",
    ({ pageParam = initialUrl }) => fetchUrl(pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.next || undefined,
    }
  );

  return <InfiniteScroll />;
}
