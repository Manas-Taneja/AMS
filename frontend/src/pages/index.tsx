// import { GetServerSideProps } from "next";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../context/AuthContext";



// export default function Home() {
//   const router = useRouter();
//   const { isAuthenticated, loading, isPending } = useAuth();

//   useEffect(() => {
//     if (!loading) {
//       if (isAuthenticated) {
//         if (isPending()) {
//           router.push('/pending');
//         } else {
//           router.push('/dashboard');
//         }
//       } else {
//         router.push('/login');
//       }
//     }
//   }, [isAuthenticated, loading, isPending, router]);

//   // Show loading while determining where to redirect
//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//     </div>
//   );
// }


// A temporary, simple homepage for debugging
function HomePage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Hello World!</h1>
      <p>If you can see this, the routing works.</p>
    </div>
  );
}

export default HomePage;