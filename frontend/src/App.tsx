import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Register } from "./pages/auth/Register";
import { Login } from "./pages/auth/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFound } from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import { TaskDetail } from "./pages/task/TaskDetail";
import { Archive } from "./pages/history/Archive";
import { FriendsPage } from "./pages/FriendsPage";
import { HeroUIProvider } from "@heroui/react";
import { MyDay } from "./pages/my-day/MyDay";
import { BoardPage } from "./pages/board/BoardPage";

function App() {
  return (
    <AuthProvider>
      <HeroUIProvider className="h-full">
        <BrowserRouter>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/task/:id" element={<TaskDetail />} />
              <Route path="/history" element={<Archive />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/my-day" element={<MyDay />} />
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/:boardId" element={<BoardPage />} />

              <Route path="/*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HeroUIProvider>
    </AuthProvider>
  );
}

export default App;
