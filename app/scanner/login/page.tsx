"use client";

import { useState, useEffect } from "react";
import { handleLogin } from "@/lib/login-utils";
import Link from "next/link";
import Image from "next/image";

export default function ScannerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear form on mount to prevent stale autofill data
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // Handle login with role validation
    const result = await handleLogin(email, password, "scanner");

    if (result.success) {
      // Redirect to scanner
      window.location.href = "/scanner";
    } else {
      setError(result.error || "Failed to sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg border border-gray-200">
          <div className="text-center mb-6 md:mb-8">
            <div className="mb-3 md:mb-4 flex justify-center">
              <Link
                href="/"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="rounded-full w-16 h-16 md:w-20 md:h-20"
                  priority
                />
              </Link>
            </div>
            <h1 className="text-lg md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
              Scanner Login
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              Sign in to access the scanner
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-xs md:text-sm font-medium mb-1 md:mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-lg text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-xs md:text-sm font-medium mb-1 md:mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-lg text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm md:text-base font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 md:mt-6 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 text-xs md:text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
