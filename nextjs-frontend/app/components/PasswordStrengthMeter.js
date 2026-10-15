"use client";

import React from "react";

export default function PasswordStrengthMeter({ password = "" }) {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@$!%*#?&]/.test(password);

    const checks = [
        { label: "At least 8 characters", passed: hasMinLength },
        { label: "At least 1 uppercase letter (A-Z)", passed: hasUpperCase },
        { label: "At least 1 lowercase letter (a-z)", passed: hasLowerCase },
        { label: "At least 1 number (0-9)", passed: hasNumber },
        { label: "At least 1 special character (@$!%*#?&)", passed: hasSpecialChar },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    const percentage = password ? Math.round((passedCount / checks.length) * 100) : 0;

    let strengthLabel = "Weak";
    let strengthColor = "#ef4444"; // Red

    if (percentage >= 100) {
        strengthLabel = "Strong";
        strengthColor = "#10b981"; // Green
    } else if (percentage >= 60) {
        strengthLabel = "Good";
        strengthColor = "#3b82f6"; // Blue
    } else if (percentage >= 40) {
        strengthLabel = "Medium";
        strengthColor = "#f59e0b"; // Amber
    } else if (percentage > 0) {
        strengthLabel = "Weak";
        strengthColor = "#ef4444"; // Red
    }

    if (!password) {
        return null;
    }

    return (
        <div
            style={{
                marginTop: 10,
                marginBottom: 15,
                padding: "12px",
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: "13px",
            }}
        >
            {/* Strength Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: "#475569" }}>Password Strength:</span>
                <span style={{ fontWeight: 700, color: strengthColor }}>{strengthLabel} ({percentage}%)</span>
            </div>

            <div
                style={{
                    height: 6,
                    width: "100%",
                    background: "#e2e8f0",
                    borderRadius: 3,
                    overflow: "hidden",
                    marginBottom: 10,
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${percentage}%`,
                        background: strengthColor,
                        transition: "all 0.3s ease-in-out",
                    }}
                />
            </div>

            {/* Checklist items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {checks.map((check, index) => (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: check.passed ? "#059669" : "#94a3b8",
                            transition: "color 0.2s",
                        }}
                    >
                        <span>{check.passed ? "✅" : "⚪"}</span>
                        <span>{check.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
