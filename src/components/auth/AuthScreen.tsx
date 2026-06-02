import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AuthScreen() {
  const navigate = useNavigate();

  const {
    isLoaded: signInLoaded,
    signIn,
    setActive: setActiveSignIn,
  } = useSignIn();
  const {
    isLoaded: signUpLoaded,
    signUp,
    setActive: setActiveSignUp,
  } = useSignUp();

  const createUser = useMutation(api.users.createUser);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      if (!signInLoaded || !signIn) {
        return;
      }
      const result = await signIn?.create({
        identifier: username,
        password,
      });

      if (result?.status === "complete") {
        await setActiveSignIn({
          session: result.createdSessionId,
        });

        navigate("/chat");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Login failed");
    }
  };

  const handleRegister = async () => {
    try {
      if (!signUpLoaded || !signUp) {
        return;
      }
      const result = await signUp?.create({
        username,
        password,
      });

      if (result?.status === "complete") {
        await setActiveSignUp({
          session: result.createdSessionId,
        });

        await createUser({
          clerkId: result.createdUserId!,
          username,
          publicKey: "",
        });

        navigate("/chat");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Registration failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-white">WhisperBox</h1>

          <p className="text-gray-400 mt-3">
            End-to-end encrypted. Zero knowledge.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2">
            <button
              onClick={() => setMode("login")}
              className={`py-5 text-lg font-medium ${
                mode === "login"
                  ? "bg-green-500/10 text-green-400"
                  : "text-gray-500"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => setMode("register")}
              className={`py-5 text-lg font-medium ${
                mode === "register"
                  ? "bg-green-500/10 text-green-400"
                  : "text-gray-500"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block mb-2 text-sm uppercase tracking-wider text-gray-400">
                Username
              </label>

              <input
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm uppercase tracking-wider text-gray-400">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-white outline-none"
              />
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button
              disabled={loading}
              className="w-full bg-green-400 text-black font-semibold py-4 rounded-xl hover:opacity-90 transition"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="border-t border-zinc-800 p-6 text-sm text-gray-500">
            Decryption requires your private key, stored only on your registered
            device.
          </div>
        </div>
      </div>
    </div>
  );
}
