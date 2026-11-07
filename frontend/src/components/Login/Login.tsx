import { useState } from "react";
import styles from "./Login.module.scss";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: () => void;
}

function Login({ onLogin, onRegister }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      await onLogin(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.loginCard}>
        <div className={styles.logo}>
          <span>₹</span>
          <h2>ExpenseFlow</h2>
        </div>

        <h1>Welcome Back!</h1>
        <p className={styles.subtitle}>
          Login to manage your personal finances.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.registerText}>
          Don't have an account? <span onClick={onRegister}>Create now</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
