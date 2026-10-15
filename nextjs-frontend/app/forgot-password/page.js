"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forgotPassword } from "../../services/api";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");
        setOtpCode("");

        try {
            const response = await forgotPassword({ email });
            setMessage(response.data.message || "A 6-digit OTP has been sent to your email.");
            if (response.data.otp) {
                setOtpCode(response.data.otp);
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors?.email) {
                setError(err.response.data.errors.email[0]);
            } else {
                setError("Unable to process request. Please try again.");
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
                padding: "20px",
            }}
        >
            <div
                style={{
                    width: 420,
                    maxWidth: "100%",
                    background: "#fff",
                    padding: 30,
                    borderRadius: 10,
                    boxShadow: "0 5px 15px rgba(0,0,0,.1)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔑</div>
                    <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
                        Forgot Password
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>
                        Enter your registered email address to receive a 6-digit reset OTP.
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
                    </div>
                )}

                {otpCode && (
                    <div
                        style={{
                            background: "#eff6ff",
                            color: "#1e40af",
                            border: "1px dashed #3b82f6",
                            borderRadius: 8,
                            padding: "15px",
                            marginBottom: 15,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Live Verification OTP
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "6px", margin: "8px 0", color: "#1d4ed8" }}>
                            {otpCode}
                        </div>
                        <div style={{ fontSize: "12px", color: "#60a5fa" }}>
                            Valid for 15 minutes. Use this code on the next screen.
                        </div>
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
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        {loading ? "Sending OTP..." : "Send Verification OTP"}
                    </button>
                </form>

                {otpCode && (
                    <div style={{ marginTop: 15 }}>
                        <button
                            type="button"
                            onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
                            style={{
                                width: "100%",
                                padding: 12,
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: "15px",
                            }}
                        >
                            Proceed to Reset Password ➔
                        </button>
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: 25, fontSize: "14px" }}>
                    <span style={{ color: "#64748b" }}>Remember your password? </span>
                    <Link href="/login" style={{ color: "#0d6efd", textDecoration: "none", fontWeight: 500 }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
