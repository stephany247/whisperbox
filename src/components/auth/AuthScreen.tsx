import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Eye, EyeOff, Info } from "lucide-react";
import {
  exportPrivateKey,
  exportPublicKey,
  generateKeyPair,
} from "@/lib/crypto";
import { encryptPrivateKey, savePrivateKey } from "@/lib/keyStorage";
import { setSessionPassword } from "@/lib/sessionKeyStore";
import Logo from "../ui/Logo";

export default function AuthScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
  const { isSignedIn, isLoaded } = useAuth();

  const createUser = useMutation(api.users.createUser);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/chat");
    }
  }, [isLoaded, isSignedIn, navigate]);

  const handleLogin = async () => {
    try {
      if (!signInLoaded || !signIn) {
        return;
      }
      const result = await signIn?.create({
        identifier: username,
        password,
      });
      setSessionPassword(password);

      if (isSignedIn) {
        navigate("/chat");
        return;
      }

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
        const keyPair = await generateKeyPair();
        const publicKey = await exportPublicKey(keyPair.publicKey);
        const privateKey = await exportPrivateKey(keyPair.privateKey);

        await setActiveSignUp({
          session: result.createdSessionId,
        });

        const encryptedKeyData = await encryptPrivateKey(privateKey, password);

        await savePrivateKey(result.createdUserId!, encryptedKeyData);
        setSessionPassword(password);
        await createUser({
          clerkId: result.createdUserId!,
          username,
          publicKey,
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
   <Logo />

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
                name="username"
                id="username"
                autoComplete="username"
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

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input w-full"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            {/* Clerk's CAPTCHA widget */}
            <div
              id="clerk-captcha"
              data-cl-theme="auto"
              data-cl-size="flexible"
              data-cl-language="en-us"
            />

            <button
              disabled={loading || !signInLoaded || !signUpLoaded}
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
