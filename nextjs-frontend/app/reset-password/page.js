"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "../../services/api";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        password: "",
        password_confirmation: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const emailFromQuery = searchParams.get("email");
        if (emailFromQuery) {
            setFormData((prev) => ({ ...prev, email: emailFromQuery }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");
        setErrors({});

        try {
            const response = await resetPassword(formData);
            setMessage(response.data.message || "Password reset successfully!");

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Unable to reset password. Please verify your OTP.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                width: 440,
                maxWidth: "100%",
                background: "#fff",
                padding: 30,
                borderRadius: 10,
                boxShadow: "0 5px 15px rgba(0,0,0,.1)",
            }}
        >
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔒</div>
                <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
                    Reset Password
                </h2>
                <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
                    Enter your 6-digit OTP code and choose a new secure password.
                </p>
            </div>

            {message && (
                <div
                    style={{
                        background: "#ecfdf5",
                        color: "#065f46",
                        border: "1px solid #a7f3d0",
                        borderRadius: 6,
                        padding: "12px",
                        marginBottom: 15,
                        fontSize: "14px",
                    }}
                >
                    {message}
                    <div style={{ fontSize: "12px", marginTop: 4 }}>Redirecting to login...</div>
                </div>
            )}

            {error && (
                <div
                    style={{
                        background: "#fef2f2",
                        color: "#991b1b",
                        border: "1px solid #fecaca",
                        borderRadius: 6,
                        padding: "12px",
                        marginBottom: 15,
                        fontSize: "14px",
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            fontSize: "14px",
                            boxSizing: "border-box",
                        }}
                    />
                    {errors.email && (
                        <small style={{ color: "red", display: "block", marginTop: 4 }}>
                            {errors.email[0]}
                        </small>
                    )}
                </div>

                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                        6-Digit OTP Code
                    </label>
                    <input
                        type="text"
                        name="otp"
                        required
                        maxLength={6}
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="123456"
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            fontSize: "18px",
                            letterSpacing: "4px",
                            textAlign: "center",
                            boxSizing: "border-box",
                        }}
                    />
                    {errors.otp && (
                        <small style={{ color: "red", display: "block", marginTop: 4 }}>
                            {errors.otp[0]}
                        </small>
                    )}
                </div>

                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                        New Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            fontSize: "14px",
                            boxSizing: "border-box",
                        }}
                    />
                    {errors.password && (
                        <small style={{ color: "red", display: "block", marginTop: 4 }}>
                            {errors.password[0]}
                        </small>
                    )}

                    {/* Live Password Strength Meter */}
                    <PasswordStrengthMeter password={formData.password} />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        name="password_confirmation"
                        required
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            fontSize: "14px",
                            boxSizing: "border-box",
                        }}
                    />
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
                        borderRadius: 6,
                        fontWeight: 600,
                        fontSize: "15px",
                    }}
                >
                    {loading ? "Resetting Password..." : "Update & Reset Password"}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 25, fontSize: "14px" }}>
                <span style={{ color: "#64748b" }}>Didn't receive code? </span>
                <Link href="/forgot-password" style={{ color: "#0d6efd", textDecoration: "none", fontWeight: 500 }}>
                    Resend OTP
                </Link>
                <span style={{ margin: "0 8px", color: "#cbd5e1" }}>•</span>
                <Link href="/login" style={{ color: "#64748b", textDecoration: "none" }}>
                    Cancel
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f4f6f9",
                padding: "20px",
            }}
        >
            <Suspense fallback={<div>Loading form...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
