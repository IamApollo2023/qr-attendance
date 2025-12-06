"use client";

import { LoginForm } from "@/components/LoginForm";

export default function ScannerLogin() {
  return (
    <LoginForm
      requiredRole="scanner"
      redirectPath="/scanner"
      title="Scanner Login"
      description="Sign in to access the scanner"
    />
  );
}
