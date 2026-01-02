import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosInstance";

export const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [passError, setPassError] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        localCheck();

        if (errors.username === "" && errors.email === "" && passError === "") {
            try {
                await api.post("/register", formData);
                navigate("/login");
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setErrors(err.response?.data.errors);
                    if (err.response?.status === 409) {
                        setErrors(err.response.data.errors);
                    } else {
                        console.error(
                            "API error: ",
                            err.response?.data?.message
                        );
                    }
                } else {
                    console.error("Unexpected error: ", err);
                }
            }
        } else {
            console.log(passError);
        }
    };

    const localCheck = () => {
        setErrors({});
        setPassError("");
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
                            className={`mt-1 block w-full px-3 py-2 border ${
                                errors.username
                                    ? "border-red-500"
                                    : "border-gray-300"
                            } rounded-md shadow-sm`}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                        />
                        {errors.username && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.username}
                            </p>
                        )}

                        <label htmlFor="inputEmail">Email address</label>
                        <input
                            type="text"
                            name="inputEmail"
                            id="inputEmail"
                            required
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                                errors.email
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.email}
                            </p>
                        )}

                        <label htmlFor="inputPassword">Password</label>
                        <input
                            type="text"
                            name="inputPassword"
                            id="input"
                            required
                            className={`mt-1 block w-full px-3 py-2 border ${
                                passError !== ""
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {passError !== "" && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.email}
                            </p>
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
