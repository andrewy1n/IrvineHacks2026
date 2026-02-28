"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      router.replace("/courses");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="animate-pulse text-[#C5AE79] text-lg font-medium tracking-wide">
        Loading Nebula...
      </div>
    </div>
  );
}
