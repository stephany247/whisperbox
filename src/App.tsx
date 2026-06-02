import { Routes, Route } from "react-router-dom";

import AuthScreen from "@/components/auth/AuthScreen";
import Chat from "@/components/ChatWindow";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* <Route path="/login" element={<AuthScreen />} /> */}
      <Route path="/" element={<AuthScreen />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;