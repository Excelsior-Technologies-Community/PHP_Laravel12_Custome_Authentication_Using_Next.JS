"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getDashboard,
    getSecurityDashboard,
    logout,
} from "../../services/api";
import { logoutUser } from "../../services/auth";

export default function DashboardPage() {

    const router = useRouter();

    const [statistics, setStatistics] = useState({});
    const [security, setSecurity] = useState({});
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

            const dashboard = await getDashboard();
            const securityInfo = await getSecurityDashboard();

            setStatistics(dashboard.data.statistics);
            setSecurity(securityInfo.data.security);

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
                    fontSize: "22px",
                }}
            >
                Loading Dashboard...
            </div>
        );

    }

    return (

        <div
            style={{
                background: "#f5f7fa",
                minHeight: "100vh",
                padding: "40px",
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "30px",
                }}
            >

                <h1>Customer Dashboard</h1>

                <button
                    onClick={handleLogout}
                    style={{
                        background: "red",
                        color: "#fff",
                        border: "none",
                        padding: "10px 20px",
                        cursor: "pointer",
                        borderRadius: "5px",
                    }}
                >
                    Logout
                </button>

            </div>

            {/* Statistics */}

            <h2>Dashboard Statistics</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "20px",
                    marginBottom: "40px",
                }}
            >

                <Card
                    title="Total Customers"
                    value={statistics.total_customers}
                />

                <Card
                    title="Today's Customers"
                    value={statistics.today_registered}
                />

                <Card
                    title="Total Logins"
                    value={statistics.total_logins}
                />

                <Card
                    title="My Logins"
                    value={statistics.my_logins}
                />

                <Card
                    title="Last Login"
                    value={statistics.last_login}
                />

                <Card
                    title="Last Logout"
                    value={statistics.last_logout}
                />

            </div>

            {/* Security */}

            <h2>Security Dashboard</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "20px",
                }}
            >

                <Card
                    title="Failed Attempts"
                    value={security.failed_attempts}
                />

                <Card
                    title="Account Locked"
                    value={
                        security.account_locked
                            ? "Yes"
                            : "No"
                    }
                />

                <Card
                    title="Locked Until"
                    value={security.locked_until ?? "-"}
                />

                <Card
                    title="Password Changed"
                    value={security.password_changed_at}
                />

                <Card
                    title="Account Created"
                    value={security.account_created}
                />

                <Card
                    title="Total Login History"
                    value={security.total_logins}
                />

            </div>

        </div>

    );

}

function Card({ title, value }) {

    return (

        <div
            style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,.1)",
            }}
        >

            <h3>{title}</h3>

            <h2
                style={{
                    color: "#0d6efd",
                }}
            >
                {value ?? "-"}
            </h2>

        </div>

    );

}