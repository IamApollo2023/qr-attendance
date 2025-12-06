"use client";

import { LoginForm } from "@/components/LoginForm";

export default function AdminLogin() {
  return (
    <LoginForm
      requiredRole="admin"
      redirectPath="/admin"
      title="Admin Login"
      description="Sign in to access the dashboard"
    />
  );
}
