import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContextType";

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localCheck();

    if (errors.username == "" && errors.email == "" && errors.password == "") {
      console.log("OK");
    } else {
      console.log(errors);
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const serverErrors = err.response?.data?.errors;

        if (status === 409 && serverErrors) {
          setErrors(serverErrors);
        } else if (status === 500) {
          alert("Server doesn't respond");
        } else {
          console.error("Server error:", err.message);
        }
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  const localCheck = () => {
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xs w-full space-y-8">
        <h2 className="text-center font-bold">Create new account</h2>
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <label htmlFor="inputUsername">Username</label>
            <input
              type="text"
              name="inputUsername"
              id="inputUsername"
              required
              className={`mt-1 block w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm`}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  username: e.target.value,
                })
              }
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username}</p>
            )}

            <label htmlFor="inputEmail">Email address</label>
            <input
              type="email"
              name="inputEmail"
              id="inputEmail"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}

            <label htmlFor="inputPassword">Password</label>
            <input
              type="password"
              name="inputPassword"
              id="inputPassword"
              required
              className={`mt-1 block w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm`}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-200"
          >
            Register
          </button>
        </form>
        <p className="text-center">
          Already have account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Log in
          </Link>{" "}
          instead
        </p>
      </div>
    </div>
  );
};
