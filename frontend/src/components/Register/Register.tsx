import { useState } from "react";
import styles from "./Register.module.scss";

interface RegisterProps {
  onRegister: (
    username: string,
    password: string,
  ) => Promise<void>;
  onLogin: () => void;
}

function Register({ onRegister, onLogin }: RegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await onRegister(username, password);

      setSuccess("Account created successfully! Please login.");

      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.registerCard}>
        <div className={styles.logo}>
          <span>₹</span>
          <h2>ExpenseFlow</h2>
        </div>

        <h1>Create Account</h1>
        <p>Start managing your money today.</p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            maxLength={50}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div className={styles.error}>{error}</div>}

          {success && <div className={styles.success}>{success}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.loginText}>
          Already have an account? <span onClick={onLogin}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
