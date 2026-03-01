import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "@/lib/utils";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      navigate("/courses", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <div className="min-h-screen bg-[#050505]" />;
}
