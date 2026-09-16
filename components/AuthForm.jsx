"use client";

import { useState } from "react";
import styles from "../styles/AuthForm.module.css";
import { getSupabase } from "../lib/supabase";

const AuthForm = ({ onDone }) => {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.includes("@") || password.length < 6) {
      setError("Enter a valid email and a 6+ character password.");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setError("Cloud is not configured. Add Supabase keys (see supabase/README.md).");
      return;
    }
    setBusy(true);
    const { error } =
      mode === "signin"
        ? await sb.auth.signInWithPassword({ email, password })
        : await sb.auth.signUp({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    onDone?.();
  };

  return (
    <div className={styles.form}>
      <h2>{mode === "signin" ? "Sign in" : "Create account"}</h2>
      <p className={styles.sub}>Sync likes, subscriptions and comments across devices.</p>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <input
        type="password"
        placeholder="Password (6+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.primary} onClick={submit} disabled={busy}>
        {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
      </button>
      <button
        className={styles.switch}
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
      >
        {mode === "signin" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </div>
  );
};

export default AuthForm;
