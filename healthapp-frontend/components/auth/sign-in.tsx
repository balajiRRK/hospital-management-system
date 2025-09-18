"use client";

import * as React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import {useState} from "react";

const ROLE_ENDPOINTS: Record<string, string> = {
    patient: "/api/auth/login/patient",
    doctor: "/api/auth/login/doctor",
    nurse: "/api/auth/login/nurse",
    admin: "/api/auth/login/admin",
};

const ROLE_DASHBOARD: Record<string, string> = {
    patient: "/dashboard/patient",
    doctor: "/dashboard/doctor",
    nurse: "/dashboard/nurse",
    admin: "/dashboard/admin",
};

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [role, setRole] = useState<string>("patient");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const url = ROLE_ENDPOINTS[role];
            if (!url) throw new Error("Unknown role, shouldnt tho because of default");

            await axios.post(
                url,
                { email, password },
                { withCredentials: true, headers: { "Content-Type": "application/json" } }
            );

            // Redirect based on role
            const redirect = ROLE_DASHBOARD[role] || "/";
            router.push(redirect);
            // gbt wrote this error handling part because for the life of me i couldnt solve the issue
        } catch (err: unknown) {
            if (err && typeof err === "object" && "response" in err) {
                const axiosErr = err as { response?: { data?: { message?: string } } };
                setError(axiosErr.response?.data?.message || "Login failed");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Login failed");
            }
        } finally {
            setLoading(false);
        }
    }

    const canSubmit = email.length > 3 && password.length >= 6 && !!role;

    return (
        <div className="flex items-center justify-center bg-background">
            <div className="w-full px-6">
                <h1 className="text-3xl font-semibold text-center mb-8">Sign in</h1>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Role  select field */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Sign in as</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="role" className="h-12 w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="nurse">Nurse</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Email  field*/}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            required
                            className="h-12 w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password part  */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="h-12 w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 text-center" role="alert">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 text-base"
                        disabled={loading || !canSubmit}
                    >
                        {loading ? "Signing in…" : "Log in"}
                    </Button>
                </form>

                <div className="text-center text-sm mt-6 text-muted-foreground">
                    No account? {" "}
                    <a
                        href="/sign-up"
                        className="underline  hover:no-underline text-black"
                    >
                        Create one
                    </a>
                </div>
            </div>
        </div>
    );
}
