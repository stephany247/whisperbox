import { Routes, Route } from "react-router-dom";

import AuthScreen from "@/components/auth/AuthScreen";
import Chat from "@/components/chat/ChatWindow";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "./components/chat/SideBar";

function App() {
  return (
    <Routes>
      {/* <Route path="/login" element={<AuthScreen />} /> */}
      <Route path="/" element={<AuthScreen />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <Chat />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
