"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    getDashboard,
    getSecurityDashboard,
    getAnalytics,
    logout,
} from "../../services/api";
import { logoutUser } from "../../services/auth";

export default function DashboardPage() {
    const router = useRouter();

    const [statistics, setStatistics] = useState({});
    const [security, setSecurity] = useState({});
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [dashboardRes, securityRes, analyticsRes] = await Promise.all([
                getDashboard(),
                getSecurityDashboard(),
                getAnalytics(),
            ]);

            setStatistics(dashboardRes.data.statistics || {});
            setSecurity(securityRes.data.security || {});
            setAnalytics(analyticsRes.data.analytics || null);
        } catch (error) {
            console.log(error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                router.push("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.log(error);
        }

        logoutUser(router);
    };

    if (loading) {
        return (
            <div
                style={{
                    textAlign: "center",
                    marginTop: "100px",
                    fontSize: "20px",
                    color: "#64748b",
                }}
            >
                Loading Dashboard & Analytics...
            </div>
        );
    }

    const scoreData = analytics?.security_score || { score: 70, grade: "Good", tips: [] };
    const deviceData = analytics?.device_breakdown || { desktop_percent: 100, mobile_percent: 0, tablet_percent: 0 };
    const activityDays = analytics?.seven_days_activity || [];

    // Max count for scaling chart bars
    const maxBarValue = Math.max(
        ...activityDays.map((d) => Math.max(d.successful, d.failed)),
        4
    );

    return (
        <div
            style={{
                background: "#f4f6f9",
                minHeight: "100vh",
                padding: "30px 40px",
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            {/* Top Navigation */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                    background: "#fff",
                    padding: "16px 24px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
            >
                <div>
                    <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0, color: "#1e293b" }}>
                        Customer Dashboard
                    </h1>
                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                        Welcome back, {security.customer_name || "Customer"}!
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <Link
                        href="/profile"
                        style={{
                            padding: "9px 18px",
                            background: "#0d6efd",
                            color: "#fff",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}
                    >
                        👤 Profile & Active Devices
                    </Link>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            padding: "9px 18px",
                            cursor: "pointer",
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "14px",
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Feature 8: Analytics & Security Studio */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.8fr",
                    gap: "24px",
                    marginBottom: "35px",
                }}
            >
                {/* 1. Security Score Card */}
                <div
                    style={{
                        background: "#fff",
                        padding: "24px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
                                🛡️ Security Health Score
                            </h3>
                            <span
                                style={{
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    background: scoreData.score >= 85 ? "#dcfce7" : scoreData.score >= 60 ? "#dbeafe" : "#fef3c7",
                                    color: scoreData.score >= 85 ? "#166534" : scoreData.score >= 60 ? "#1e40af" : "#92400e",
                                }}
                            >
                                {scoreData.grade}
                            </span>
                        </div>

                        {/* Circular Progress Gauge */}
                        <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "20px 0" }}>
                            <div
                                style={{
                                    position: "relative",
                                    width: 100,
                                    height: 100,
                                    borderRadius: "50%",
                                    background: `conic-gradient(#10b981 ${scoreData.score * 3.6}deg, #e2e8f0 0deg)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>
                                        {scoreData.score}%
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                                    Your Security Score
                                </div>
                                <div style={{ fontSize: "13px", color: "#64748b", marginTop: 4 }}>
                                    Active Sessions: <strong>{analytics?.active_sessions_count || 1}</strong>
                                </div>
                                <div style={{ fontSize: "13px", color: "#64748b" }}>
                                    Account Status: <strong style={{ color: "#10b981" }}>Protected</strong>
                                </div>
                            </div>
                        </div>

                        {/* Actionable Tips */}
                        <div style={{ marginTop: 15, background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
                                Security Recommendations:
                            </div>
                            {scoreData.tips.map((tip, idx) => (
                                <div key={idx} style={{ fontSize: "12px", color: "#64748b", margin: "4px 0", display: "flex", gap: 6 }}>
                                    <span>💡</span>
                                    <span>{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link
                        href="/profile"
                        style={{
                            marginTop: 15,
                            display: "block",
                            textAlign: "center",
                            padding: "8px",
                            background: "#f1f5f9",
                            color: "#0f172a",
                            borderRadius: 6,
                            fontSize: "13px",
                            fontWeight: 600,
                            textDecoration: "none",
                        }}
                    >
                        Manage Security & Devices ➔
                    </Link>
                </div>

                {/* 2. 7-Day Activity Chart & Device Distribution */}
                <div
                    style={{
                        background: "#fff",
                        padding: "24px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
                                📊 7-Day Login Activity
                            </h3>
                            <div style={{ display: "flex", gap: 12, fontSize: "12px" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#10b981" }}>
                                    <span style={{ width: 10, height: 10, background: "#10b981", borderRadius: 2 }} />
                                    Successful
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#ef4444" }}>
                                    <span style={{ width: 10, height: 10, background: "#ef4444", borderRadius: 2 }} />
                                    Failed
                                </span>
                            </div>
                        </div>

                        {/* Interactive Bar Chart */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "space-between",
                                height: 140,
                                borderBottom: "1px solid #e2e8f0",
                                paddingBottom: 10,
                                gap: 12,
                            }}
                        >
                            {activityDays.map((item, index) => {
                                const successHeight = (item.successful / maxBarValue) * 110;
                                const failedHeight = (item.failed / maxBarValue) * 110;

                                return (
                                    <div
                                        key={index}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            flex: 1,
                                            height: "100%",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
                                            {/* Successful Bar */}
                                            <div
                                                title={`${item.label}: ${item.successful} Successful`}
                                                style={{
                                                    width: 16,
                                                    height: Math.max(successHeight, item.successful > 0 ? 8 : 2),
                                                    background: item.successful > 0 ? "#10b981" : "#e2e8f0",
                                                    borderRadius: "4px 4px 0 0",
                                                    transition: "height 0.3s ease",
                                                }}
                                            />
                                            {/* Failed Bar */}
                                            <div
                                                title={`${item.label}: ${item.failed} Failed`}
                                                style={{
                                                    width: 16,
                                                    height: Math.max(failedHeight, item.failed > 0 ? 8 : 2),
                                                    background: item.failed > 0 ? "#ef4444" : "#f1f5f9",
                                                    borderRadius: "4px 4px 0 0",
                                                    transition: "height 0.3s ease",
                                                }}
                                            />
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: 8 }}>
                                            {item.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Device Distribution Progress */}
                    <div style={{ marginTop: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                            <span>Device Breakdown (Logged-in Devices):</span>
                            <span>{deviceData.total} Total Logins</span>
                        </div>

                        <div style={{ height: 8, display: "flex", borderRadius: 4, overflow: "hidden", background: "#e2e8f0" }}>
                            <div style={{ width: `${deviceData.desktop_percent}%`, background: "#0d6efd" }} title={`Desktop: ${deviceData.desktop_percent}%`} />
                            <div style={{ width: `${deviceData.mobile_percent}%`, background: "#10b981" }} title={`Mobile: ${deviceData.mobile_percent}%`} />
                            <div style={{ width: `${deviceData.tablet_percent}%`, background: "#f59e0b" }} title={`Tablet: ${deviceData.tablet_percent}%`} />
                        </div>

                        <div style={{ display: "flex", gap: 18, marginTop: 8, fontSize: "12px", color: "#64748b" }}>
                            <span>💻 Desktop: <strong>{deviceData.desktop_percent}%</strong> ({deviceData.desktop})</span>
                            <span>📱 Mobile: <strong>{deviceData.mobile_percent}%</strong> ({deviceData.mobile})</span>
                            {deviceData.tablet > 0 && (
                                <span>📟 Tablet: <strong>{deviceData.tablet_percent}%</strong> ({deviceData.tablet})</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* General Dashboard Statistics */}
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: 15 }}>
                General Statistics
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginBottom: "35px",
                }}
            >
                <Card title="Total Customers" value={statistics.total_customers} icon="👥" color="#0d6efd" />
                <Card title="Today's Customers" value={statistics.today_registered} icon="✨" color="#10b981" />
                <Card title="Total System Logins" value={statistics.total_logins} icon="📈" color="#8b5cf6" />
                <Card title="My Total Logins" value={statistics.my_logins} icon="🔑" color="#f59e0b" />
                <Card title="Last Login" value={statistics.last_login ? new Date(statistics.last_login).toLocaleString() : "-"} icon="🕒" color="#0284c7" />
                <Card title="Last Logout" value={statistics.last_logout ? new Date(statistics.last_logout).toLocaleString() : "-"} icon="🚪" color="#64748b" />
            </div>

            {/* Security Dashboard Metrics */}
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", marginBottom: 15 }}>
                Security Metrics
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                }}
            >
                <Card title="Failed Attempts" value={security.failed_attempts} icon="⚠️" color={security.failed_attempts > 0 ? "#ef4444" : "#10b981"} />
                <Card title="Account Locked" value={security.account_locked ? "Yes" : "No"} icon="🔒" color={security.account_locked ? "#ef4444" : "#10b981"} />
                <Card title="Locked Until" value={security.locked_until ?? "None"} icon="⏳" color="#64748b" />
                <Card title="Password Changed" value={security.password_changed_at ? new Date(security.password_changed_at).toLocaleDateString() : "Never"} icon="🔄" color="#0284c7" />
                <Card title="Account Created" value={security.account_created ? new Date(security.account_created).toLocaleDateString() : "-"} icon="📅" color="#0d6efd" />
                <Card title="Total Login Logs" value={security.total_logins} icon="📋" color="#6366f1" />
            </div>
        </div>
    );
}

function Card({ title, value, icon, color = "#0d6efd" }) {
    return (
        <div
            style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                border: "1px solid #e2e8f0",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>{title}</span>
                {icon && <span style={{ fontSize: "18px" }}>{icon}</span>}
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: color }}>
                {value ?? "-"}
            </div>
        </div>
    );
}