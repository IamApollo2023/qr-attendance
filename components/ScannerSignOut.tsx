"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib";

export default function ScannerSignOut() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="absolute top-3 md:top-4 left-3 md:left-4 z-50 px-3 md:px-4 py-1.5 md:py-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg text-xs md:text-sm font-medium transition-colors shadow-lg border border-gray-200"
    >
      Sign Out
    </button>
  );
}
