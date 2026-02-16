// calmana-frontend/app/settings/page.js
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const router = useRouter();

    const [username, setUsername] = useState(null);

    // Messages
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Change password fields
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [passMsg, setPassMsg] = useState("");

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Load username from localStorage
    useEffect(() => {
        const u = localStorage.getItem("username");
        if (u) setUsername(u);
    }, []);

    // Broadcast auth changes so Navbar updates instantly
    const broadcastAuthChange = () => {
        localStorage.setItem("authEvent", Date.now());
        window.dispatchEvent(new Event("authEvent"));
    };

    // ⭐ DELETE ACCOUNT
    const handleDelete = async () => {
        const confirmDelete = confirm(
            "Are you sure you want to permanently delete your account? This action cannot be undone."
        );
        if (!confirmDelete) return;

        setLoading(true);
        setMsg("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setMsg("Not logged in.");
                return;
            }

            const res = await fetch(`${API}/api/account/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                // localStorage.removeItem("token");
                // localStorage.removeItem("username");
                // localStorage.removeItem("userId");

                localStorage.clear();

                broadcastAuthChange();

                setMsg("Account deleted. Redirecting...");
                setTimeout(() => router.push("/register"), 900);
            } else {
                setMsg(data.error || "Failed to delete account.");
            }
        } catch (err) {
            console.error(err);
            setMsg("Server error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    // ⭐ LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");

        broadcastAuthChange();
        router.push("/login");
    };

    // ⭐ CHANGE PASSWORD
    const handleChangePassword = async () => {
        setPassMsg("");

        if (!oldPass || !newPass || !confirmPass) {
            setPassMsg("Please fill all fields.");
            return;
        }

        if (newPass !== confirmPass) {
            setPassMsg("New passwords do not match.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setPassMsg("Not logged in.");
                return;
            }

            const res = await fetch(`${API}/api/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword: oldPass,
                    newPassword: newPass,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setPassMsg("Password updated successfully!");
                setOldPass("");
                setNewPass("");
                setConfirmPass("");
            } else {
                setPassMsg(data.error || "Failed to update password.");
            }
        } catch (err) {
            console.error(err);
            setPassMsg("Server error.");
        }
    };

    return (
        <div className="min-h-screen bg-green-50 p-6 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-2xl">

                <h1 className="text-2xl font-bold text-green-800 mb-4">Account Settings</h1>

                {username && (
                    <p className="mb-6 text-gray-700">
                        Logged in as <span className="font-semibold">{username}</span>
                    </p>
                )}

                {/* CHANGE PASSWORD */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold mb-2">Change Password</h2>

                    <div className="space-y-3 max-w-sm">
                        <input
                            type="password"
                            placeholder="Old Password"
                            className="w-full p-2 border rounded"
                            value={oldPass}
                            onChange={(e) => setOldPass(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full p-2 border rounded"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full p-2 border rounded"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />

                        <button
                            onClick={handleChangePassword}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Update Password
                        </button>

                        {passMsg && (
                            <p className="text-sm text-gray-700 mt-1">{passMsg}</p>
                        )}
                    </div>
                </section>

                {/* DELETE ACCOUNT + LOGOUT */}
                <section>
                    <h2 className="text-lg font-semibold mb-2">Danger Zone</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Deleting your account will permanently remove all your data.
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow"
                        >
                            {loading ? "Deleting..." : "Delete My Account"}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                        >
                            Logout
                        </button>
                    </div>

                    {msg && <p className="mt-4 text-sm text-gray-800">{msg}</p>}
                </section>

            </div>
        </div>
    );
}
