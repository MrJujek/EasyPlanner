import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Register } from "./pages/auth/Register";
import { Login } from "./pages/auth/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFound } from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import { TaskDetail } from "./pages/task/TaskDetail";
import { Archive } from "./pages/history/Archive";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/task/:id" element={<TaskDetail />} />
            <Route path="/history" element={<Archive />}/>

            <Route path="/*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
