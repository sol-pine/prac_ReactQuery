import { useState } from "react";
// useQuery : 서버에서 데이터를 fetch할 때 사용
import { useQuery } from "react-query";

import { PostDetail } from "./PostDetail";
const maxPostPage = 10;

async function fetchPosts() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=10&_page=0"
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);

  // replace with useQuery
  // const data = [];
  // useQuery
  // (쿼리키(쿼리이름),
  // 쿼리함수(쿼리 데이터 가져오는 방법, 데이터를 가져오는 비동기 함수)
  // {데이터 만료 시간 (옵션, 밀리초 단위)})
  const { data, isError, error, isLoading } = useQuery("posts", fetchPosts, {
    staleTime: 2000,
  });

  // isLoading 로딩 상태 처리
  // isFetching : 비동기 쿼리가 해결되지 않았음, 데이터를 가져오는 중
  // isLoading : 캐시된 데이터가 없고 + isFetching
  if (isLoading) return <h3>Loading...</h3>;
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
        <button disabled onClick={() => {}}>
          Previous page
        </button>
        <span>Page {currentPage + 1}</span>
        <button disabled onClick={() => {}}>
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
