import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import SplashScreen from "../chat/SplashScreen";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <SplashScreen />;
  }

  if (!isSignedIn) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}