import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContextType";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Wrong email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xs w-full space-y-8">
        <h2 className="text-center font-bold">Log in</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="p-8">
            <label htmlFor="inputEmail">Email address</label>
            <input
              type="email"
              name="inputEmail"
              id="inputEmail"
              className={`mt-1 block w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="inputPassword">Password</label>
            <input
              type="password"
              name="inputPassword"
              id="inputPassword"
              className={`mt-1 block w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-200"
          >
            Login
          </button>
        </form>
        <p className="text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Register
          </Link>{" "}
          instead
        </p>
      </div>
    </div>
  );
};
