"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    getProfile,
    updateProfile,
    changePassword,
    logout,
    getActiveSessions,
    revokeSession,
    revokeAllOtherSessions,
} from "../../services/api";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

export default function ProfilePage() {
    const router = useRouter();

    const [customer, setCustomer] = useState({
        name: "",
        email: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);

    // Active Sessions State
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [sessionMessage, setSessionMessage] = useState("");
    const [revokingId, setRevokingId] = useState(null);

    useEffect(() => {
        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        loadProfile();
        loadSessions();
    }, [router]);

    const loadProfile = async () => {
        try {
            const response = await getProfile();
            setCustomer({
                name: response.data.customer.name,
                email: response.data.customer.email,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const loadSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await getActiveSessions();
            setSessions(res.data.sessions || []);
        } catch (err) {
            console.log(err);
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleChange = (e) => {
        setCustomer({
            ...customer,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setMessage("");
        setErrors({});

        try {
            const response = await updateProfile(customer);
            setMessage(response.data.message);
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setMessage(error.response?.data?.message || "Something went wrong.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        setChangingPassword(true);
        setPasswordErrors({});
        setPasswordMessage("");

        try {
            const response = await changePassword(passwordData);
            setPasswordMessage(response.data.message);
            setPasswordData({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
        } catch (error) {
            if (error.response?.status === 422) {
                setPasswordErrors(error.response.data.errors);
            } else {
                setPasswordMessage(
                    error.response?.data?.message || "Unable to change password."
                );
            }
        } finally {
            setChangingPassword(false);
        }
    };

    const handleRevokeSession = async (id) => {
        if (!confirm("Are you sure you want to log out from this device?")) return;

        setRevokingId(id);
        setSessionMessage("");

        try {
            const res = await revokeSession(id);
            setSessionMessage(res.data.message || "Device session revoked.");
            await loadSessions();
        } catch (err) {
            setSessionMessage("Failed to revoke session.");
        } finally {
            setRevokingId(null);
        }
    };

    const handleRevokeAllOther = async () => {
        if (!confirm("Are you sure you want to log out from all other devices?")) return;

        setSessionsLoading(true);
        setSessionMessage("");

        try {
            const res = await revokeAllOtherSessions();
            setSessionMessage(res.data.message || "Logged out from all other devices.");
            await loadSessions();
        } catch (err) {
            setSessionMessage("Failed to revoke other sessions.");
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.log(error);
        }

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        router.push("/login");
    };

    if (loading) {
        return (
            <h2 style={{ textAlign: "center", marginTop: "80px", color: "#475569" }}>
                Loading Profile...
            </h2>
        );
    }

    return (
        <div
            style={{
                maxWidth: "760px",
                margin: "40px auto",
                padding: "30px",
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                fontFamily: "inherit",
            }}
        >
            {/* Top Navigation */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "25px",
                    paddingBottom: "15px",
                    borderBottom: "1px solid #f1f5f9",
                }}
            >
                <Link
                    href="/dashboard"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#0d6efd",
                        textDecoration: "none",
                        fontWeight: 500,
                        fontSize: "14px",
                    }}
                >
                    ➔ Back to Dashboard
                </Link>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: "8px 16px",
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "14px",
                    }}
                >
                    Logout
                </button>
            </div>

            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#0f172a", marginBottom: 20 }}>
                Customer Profile & Security
            </h1>

            {/* Profile Information */}
            <div
                style={{
                    padding: "20px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "30px",
                }}
            >
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", color: "#1e293b" }}>
                    Personal Information
                </h2>

                {message && (
                    <div
                        style={{
                            background: "#d1e7dd",
                            color: "#0f5132",
                            padding: "10px",
                            marginBottom: "15px",
                            borderRadius: "6px",
                            fontSize: "14px",
                        }}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={customer.name}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                                fontSize: "14px",
                                boxSizing: "border-box",
                            }}
                        />
                        {errors.name && (
                            <small style={{ color: "red", display: "block", marginTop: 4 }}>
                                {errors.name[0]}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={customer.email}
                            onChange={handleChange}
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

                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: "10px 20px",
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "14px",
                        }}
                    >
                        {saving ? "Saving..." : "Update Profile"}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div
                style={{
                    padding: "20px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "30px",
                }}
            >
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", color: "#1e293b" }}>
                    Change Password
                </h2>

                {passwordMessage && (
                    <div
                        style={{
                            background: "#d1e7dd",
                            color: "#0f5132",
                            padding: "10px",
                            marginBottom: "15px",
                            borderRadius: "6px",
                            fontSize: "14px",
                        }}
                    >
                        {passwordMessage}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                            Current Password
                        </label>
                        <input
                            type="password"
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
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
                        {passwordErrors.current_password && (
                            <small style={{ color: "red", display: "block", marginTop: 4 }}>
                                {passwordErrors.current_password[0]}
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={passwordData.password}
                            onChange={handlePasswordChange}
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
                        {passwordErrors.password && (
                            <small style={{ color: "red", display: "block", marginTop: 4 }}>
                                {passwordErrors.password[0]}
                            </small>
                        )}

                        {/* Live Password Strength Meter */}
                        <PasswordStrengthMeter password={passwordData.password} />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "14px", color: "#334155" }}>
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={passwordData.password_confirmation}
                            onChange={handlePasswordChange}
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
                        disabled={changingPassword}
                        style={{
                            padding: "10px 20px",
                            background: "#198754",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "14px",
                        }}
                    >
                        {changingPassword ? "Updating Password..." : "Change Password"}
                    </button>
                </form>
            </div>

            {/* Feature 5: Multi-Device Session Management & Remote Logout */}
            <div
                style={{
                    padding: "20px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                        flexWrap: "wrap",
                        gap: 10,
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: 0 }}>
                            💻 Active Devices & Remote Logout
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
                            Manage logged-in devices and revoke sessions remotely anytime.
                        </p>
                    </div>

                    {sessions.length > 1 && (
                        <button
                            type="button"
                            onClick={handleRevokeAllOther}
                            disabled={sessionsLoading}
                            style={{
                                padding: "8px 14px",
                                background: "#fee2e2",
                                color: "#b91c1c",
                                border: "1px solid #fecaca",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Log Out All Other Devices
                        </button>
                    )}
                </div>

                {sessionMessage && (
                    <div
                        style={{
                            background: "#ecfdf5",
                            color: "#065f46",
                            padding: "10px",
                            marginBottom: "15px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            border: "1px solid #a7f3d0",
                        }}
                    >
                        {sessionMessage}
                    </div>
                )}

                {sessionsLoading && (
                    <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "14px" }}>
                        Loading active devices...
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sessions.map((sess) => {
                        const icon = sess.device_type === "Mobile" ? "📱" : sess.device_type === "Tablet" ? "📟" : "💻";
                        const isCurrent = sess.is_current;

                        return (
                            <div
                                key={sess.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "14px 16px",
                                    background: isCurrent ? "#eff6ff" : "#ffffff",
                                    border: isCurrent ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    flexWrap: "wrap",
                                    gap: 10,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div
                                        style={{
                                            fontSize: "24px",
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "8px",
                                            background: isCurrent ? "#dbeafe" : "#f1f5f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {icon}
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>
                                                {sess.browser_name || "Browser"} on {sess.platform || "Device"}
                                            </span>
                                            {isCurrent && (
                                                <span
                                                    style={{
                                                        background: "#22c55e",
                                                        color: "#ffffff",
                                                        padding: "2px 8px",
                                                        borderRadius: "12px",
                                                        fontSize: "11px",
                                                        fontWeight: 700,
                                                        letterSpacing: "0.5px",
                                                    }}
                                                >
                                                    CURRENT DEVICE
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ color: "#64748b", fontSize: "12px", marginTop: 2 }}>
                                            IP: {sess.ip_address || "Unknown"} • Logged in: {new Date(sess.login_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {!isCurrent && (
                                    <button
                                        type="button"
                                        onClick={() => handleRevokeSession(sess.id)}
                                        disabled={revokingId === sess.id}
                                        style={{
                                            padding: "6px 12px",
                                            background: "#fff",
                                            color: "#dc2626",
                                            border: "1px solid #fca5a5",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {revokingId === sess.id ? "Revoking..." : "Revoke Access"}
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {!sessionsLoading && sessions.length === 0 && (
                        <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "14px" }}>
                            No active sessions found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}