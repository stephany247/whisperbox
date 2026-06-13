import { Routes, Route } from "react-router-dom";

import AuthScreen from "@/components/auth/AuthScreen";
import Chat from "@/components/chat/ChatWindow";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "./components/chat/SideBar";
import { useChatStore } from "./store/chatStore";

function App() {
  const { activeContact } = useChatStore();

  return (
    <Routes>
      <Route path="/" element={<AuthScreen />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <div className="h-screen overflow-hidden">
              <div className="hidden sm:flex h-full">
                <Sidebar />
                <Chat />
              </div>
              <div className="md:hidden h-full">
                {!activeContact ? <Sidebar /> : <Chat />}
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
