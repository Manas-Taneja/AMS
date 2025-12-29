import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "sonner";
// import AuthDebugPanel from "../components/AuthDebugPanel";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster 
        position="top-center"
        richColors
        closeButton
        duration={4000}
      />
      {/* <AuthDebugPanel /> */}
    </AuthProvider>
  );
}
