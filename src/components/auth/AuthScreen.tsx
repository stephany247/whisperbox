import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Info } from "lucide-react";

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
    <div className="auth-screen">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_var(--accent-glow)]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
                fill="var(--accent)"
                opacity="0.15"
              />
              <path
                d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
              <circle cx="20" cy="18" r="4" fill="var(--accent)" />
              <path
                d="M14 26c0-3.3 2.7-6 6-6s6 2.7 6 6"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-[-0.5px]">
            WhisperBox
          </h1>

          <p className="text-gray-400 text-xs font-mono mt-1 tracking-wider">
            End-to-end encrypted. Zero knowledge.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-zinc-800 rounded-3xl overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-zinc-800">
            <button
              onClick={() => setMode("login")}
              className={`p-3 text-sm font-medium ${
                mode === "login" ? "bg-accent-dim text-accent" : "text-gray-500"
              }`}
            >
              Sign In
            </button>

            <button
              onClick={() => setMode("register")}
              className={`p-3 text-sm font-medium ${
                mode === "register"
                  ? "bg-accent-dim text-accent"
                  : "text-gray-500"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Username
              </label>

              <input
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input w-full"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input w-full"
              />
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button
              disabled={loading}
              className="w-full bg-accent text-black font-bold text-sm p-3 rounded-lg hover:opacity-90 transition"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="inline-flex gap-2 border-t border-zinc-800 px-6 py-4 text-xs font-mono leading-normal text-gray-600">
            <Info className="size-4 shrink-0 text-accent mt-0.5" />

            <span>
              {mode === "login"
                ? "Decryption requires your private key, stored only on your registered device."
                : "Your private key is generated locally and stored only on this device. We never see it."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
