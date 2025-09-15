import { GetServerSideProps } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";



export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading, isPending } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (isPending()) {
          router.push('/pending');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, isPending, router]);

  // Show loading while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}
