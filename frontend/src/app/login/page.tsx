"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * NOTE: This is a UI-only bonus feature. There is no real authentication
 * behind this screen — per the assignment spec, the app assumes a default
 * logged-in user everywhere else. Submitting this form just redirects to
 * the dashboard; no credentials are validated or stored.
 */
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FA] px-4">
      <div className="bg-white rounded-xl shadow-md border border-zoom-border w-full max-w-sm p-7">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-10 h-10 rounded-lg bg-zoom-blue flex items-center justify-center text-white font-black text-lg">
            Z
          </div>
          <span className="font-bold text-xl">Zoom Clone</span>
        </div>

        <h1 className="text-lg font-bold text-center mb-1">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-xs text-zoom-text-muted text-center mb-6">
          {mode === "login"
            ? "Enter your details to continue"
            : "Get started with your free account"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-zoom-border rounded-md focus:border-zoom-blue outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-zoom-border rounded-md focus:border-zoom-blue outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-zoom-border rounded-md focus:border-zoom-blue outline-none"
          />

          <button
            type="submit"
            className="w-full bg-zoom-blue hover:bg-zoom-blue-dark text-white font-semibold py-2.5 rounded-md transition-colors mt-2"
          >
            {mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-xs text-center text-zoom-text-muted mt-5">
          {mode === "login" ? "New to Zoom Clone?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-zoom-blue font-semibold hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
