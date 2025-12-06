"use client";

import { LoginForm } from "@/components/LoginForm";

export default function FinanceLogin() {
  return (
    <LoginForm
      requiredRole="finance"
      redirectPath="/finance"
      title="Finance Login"
      description="Sign in to access financial management"
    />
  );
}
