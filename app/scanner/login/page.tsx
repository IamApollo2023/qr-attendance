"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getCurrentUserProfile } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default function ScannerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in
      await signIn(email, password);

      // Check user role
      const profile = await getCurrentUserProfile();

      if (!profile) {
        throw new Error("User profile not found");
      }

      if (profile.role !== "scanner") {
        // Sign out if not scanner role
        const { signOut } = await import("@/lib/auth");
        await signOut();
        throw new Error("Access denied. Scanner role required.");
      }

      // Redirect to scanner
      router.push("/scanner");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="rounded-full"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Scanner Login
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to access the scanner
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
