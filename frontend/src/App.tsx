import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from './assets/AuthContext';
import Home from "./pages/Home";
import { Register } from "./pages/auth/Register";
import { Login } from "./pages/auth/Login";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
