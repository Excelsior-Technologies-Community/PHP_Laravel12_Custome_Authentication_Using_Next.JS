"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getProfile,
    updateProfile,
    changePassword,
    logout,
} from "../../services/api";

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

    useEffect(() => {

        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        loadProfile();

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
            <h2 style={{ textAlign: "center", marginTop: "80px" }}>
                Loading Profile...
            </h2>
        );

    }

    return (

        <div
            style={{
                maxWidth: "600px",
                margin: "40px auto",
                background: "#fff",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,.1)",
            }}
        >

            <h2>My Profile</h2>

            {message && (

                <div
                    style={{
                        background: "#d1e7dd",
                        color: "#0f5132",
                        padding: "10px",
                        marginBottom: "20px",
                        borderRadius: "5px",
                    }}
                >
                    {message}
                </div>

            )}

            <form onSubmit={handleSubmit}>

                <div style={{ marginBottom: "20px" }}>

                    <label>Name</label>

                    <input
                        type="text"
                        name="name"
                        value={customer.name}
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

                <div style={{ marginBottom: "20px" }}>

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={customer.email}
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

                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "#0d6efd",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    {saving ? "Updating..." : "Update Profile"}
                </button>

            </form>

            <hr style={{ margin: "40px 0" }} />

            <h2>Change Password</h2>

            {passwordMessage && (
                <div
                    style={{
                        background: "#d1e7dd",
                        color: "#0f5132",
                        padding: "10px",
                        marginBottom: "20px",
                        borderRadius: "5px",
                    }}
                >
                    {passwordMessage}
                </div>
            )}

            <form onSubmit={handlePasswordSubmit}>

                <div style={{ marginBottom: "20px" }}>
                    <label>Current Password</label>

                    <input
                        type="password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                        }}
                    />

                    {passwordErrors.current_password && (
                        <small style={{ color: "red" }}>
                            {passwordErrors.current_password[0]}
                        </small>
                    )}
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label>New Password</label>

                    <input
                        type="password"
                        name="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                        }}
                    />

                    {passwordErrors.password && (
                        <small style={{ color: "red" }}>
                            {passwordErrors.password[0]}
                        </small>
                    )}
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label>Confirm Password</label>

                    <input
                        type="password"
                        name="password_confirmation"
                        value={passwordData.password_confirmation}
                        onChange={handlePasswordChange}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={changingPassword}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "#198754",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    {changingPassword
                        ? "Changing Password..."
                        : "Change Password"}
                </button>

            </form>

            <div style={{ marginTop: "30px" }}>

                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Logout
                </button>

            </div>

        </div>

    );

}