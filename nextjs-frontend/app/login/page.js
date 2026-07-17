"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../services/api";

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setErrors({});

        try {
            const response = await login({
                email: formData.email,
                password: formData.password,
            });

            const data = response.data;

            if (formData.remember) {
                localStorage.setItem("token", data.token);
            } else {
                sessionStorage.setItem("token", data.token);
            }

            router.push("/dashboard");
        } catch (error) {

            if (error.response) {

                if (error.response.status === 422) {
                    setErrors(error.response.data.errors);
                } else {
                    setMessage(error.response.data.message);
                }

            } else {
                setMessage("Unable to connect to server.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f4f6f9",
            }}
        >
            <div
                style={{
                    width: 400,
                    background: "#fff",
                    padding: 30,
                    borderRadius: 10,
                    boxShadow: "0 5px 15px rgba(0,0,0,.1)",
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: 20 }}>
                    Customer Login
                </h2>

                {message && (
                    <div
                        style={{
                            color: "red",
                            marginBottom: 15,
                        }}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div style={{ marginBottom: 15 }}>
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                            style={{
                                width: "100%",
                                padding: 10,
                            }}
                        />

                        {errors.email && (
                            <small style={{ color: "red" }}>
                                {errors.email[0]}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            style={{
                                width: "100%",
                                padding: 10,
                            }}
                        />

                        {errors.password && (
                            <small style={{ color: "red" }}>
                                {errors.password[0]}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <input
                            type="checkbox"
                            name="remember"
                            checked={formData.remember}
                            onChange={handleChange}
                        />

                        <span style={{ marginLeft: 10 }}>
                            Remember Me
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: 12,
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: 5,
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: 20,
                    }}
                >
                    Don't have an account?

                    <a
                        href="/register"
                        style={{
                            marginLeft: 5,
                            color: "#0d6efd",
                        }}
                    >
                        Register
                    </a>
                </p>

            </div>
        </div>
    );
}