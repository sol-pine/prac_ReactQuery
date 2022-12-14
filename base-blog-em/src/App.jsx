import { Posts } from "./Posts";
import "./App.css";

import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

// Clent 추가 후, Provider 추가
// Client가 가지고 있는 캐시와 기본 옵션(React Query Hooks)을 자식 컴포넌트가 사용할 수 있도록 전달
const queryClient = new QueryClient();

function App() {
  return (
    // provide React Query client to App
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Blog Posts</h1>
        <Posts />
      </div>
      {/* Devtools : 개발 중인 모든 쿼리 상태 표시 */}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
