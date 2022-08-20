import { useEffect, useState } from "react";
// useQuery : 서버에서 데이터를 fetch할 때 사용
// useQueryClient : QueryClient 사용 훅
import { useQuery, useQueryClient } from "react-query";

import { PostDetail } from "./PostDetail";
const maxPostPage = 10;

async function fetchPosts(pageNum) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${pageNum}`
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  // prefetching
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentPage < maxPostPage) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery(["posts", nextPage], () =>
        fetchPosts(nextPage)
      );
    }
  }, [currentPage, queryClient]);

  // replace with useQuery
  // const data = [];
  // useQuery
  // (쿼리키(쿼리이름),
  // 쿼리함수(쿼리 데이터 가져오는 방법, 데이터를 가져오는 비동기 함수)
  // {데이터 만료 시간 (옵션, 밀리초 단위)})
  const { data, isError, error, isLoading } = useQuery(
    ["posts", currentPage],
    () => fetchPosts(currentPage),
    {
      staleTime: 2000,
      // 이전 페이지로 돌아갔을 때 캐시에 데이터가 남아있도록
      keepPreviousData: true,
    }
  );

  // isLoading 로딩 상태 처리
  // isLoading : 캐시된 데이터가 없고 + isFetching
  if (isLoading) return <h3>Loading...</h3>;

  // isFetching : 비동기 쿼리가 해결되지 않았음, 데이터를 가져오는 중
  // 데이터가 있든 없든(캐시데이터가 있어도) 로딩 인디케이터 나타냄
  // if (isFetching) return <h3>Fetching in progress...</h3>;

  // isError 에러 상태 처리
  // 에러가 나면 쿼리에서 기본 3번 재시도 후 에러 결정
  if (isError)
    return (
      <>
        <h3>Oops, something went wrong</h3>
        {/* 에러 메시지 확인 가능 */}
        <p>{error.toString()}</p>
      </>
    );
  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button
          disabled={currentPage <= 1}
          onClick={() => {
            setCurrentPage((previousValue) => previousValue - 1);
          }}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => {
            setCurrentPage((previousValue) => previousValue + 1);
          }}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
