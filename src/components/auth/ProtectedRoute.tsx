import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}