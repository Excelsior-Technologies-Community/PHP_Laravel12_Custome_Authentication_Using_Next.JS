"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "../../services/api";

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setErrors({});
        setMessage("");

        try {
            const response = await register(formData);

            setMessage(response.data.message);

            setTimeout(() => {
                router.push("/login");
            }, 1500);

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
                background: "#f5f7fa",
            }}
        >
            <div
                style={{
                    width: "420px",
                    background: "#ffffff",
                    padding: "30px",
                    borderRadius: "10px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "25px",
                    }}
                >
                    Customer Registration
                </h2>

                {message && (
                    <div
                        style={{
                            marginBottom: "20px",
                            color: "green",
                            fontWeight: "bold",
                        }}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "5px",
                            }}
                        />

                        {errors.name && (
                            <small style={{ color: "red" }}>
                                {errors.name[0]}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "5px",
                            }}
                        />

                        {errors.email && (
                            <small style={{ color: "red" }}>
                                {errors.email[0]}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "5px",
                            }}
                        />

                        {errors.password && (
                            <small style={{ color: "red" }}>
                                {errors.password[0]}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "5px",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                </form>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "20px",
                    }}
                >
                    Already have an account?

                    <Link
                        href="/login"
                        style={{
                            marginLeft: "5px",
                            color: "#0d6efd",
                            textDecoration: "none",
                            fontWeight: "bold",
                        }}
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}