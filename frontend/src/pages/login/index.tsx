import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// Auth disabled: comment out login UI and redirect to dashboard
const Login: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center text-gray-700">
        Authentication is disabled. Redirecting to dashboard...
      </div>
    </div>
  );
};

export default Login;