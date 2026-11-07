import { useEffect, useState } from "react";

import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Profile from "./components/Profile/Profile";
import ExpenseDashboard from "./components/ExpenseDashBoard/ExpenseDashboard";

import {
  loginUser,
  registerUser,
  getUserProfile,
  logoutUser,
} from "./services/AuthServices";

import type { User } from "./services/AuthServices";

type Page = "login" | "register" | "dashboard" | "profile";

function App() {
  const [page, setPage] = useState<Page>("login");
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Restore login session when the application starts.
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const currentUser = await getUserProfile();

        setUser(currentUser);
        setPage("dashboard");
      } catch {
        logoutUser();
        setUser(null);
        setPage("login");
      } finally {
        setCheckingAuth(false);
      }
    };

    restoreSession();
  }, []);

  // Login
  const handleLogin = async (username: string, password: string) => {
    const response = await loginUser(username, password);

    setUser(response.user);
    setPage("dashboard");
  };

  // Register
  const handleRegister = async (username: string, password: string) => {
    await registerUser(username, password);
    setPage("login");
  };

  // Logout
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setPage("login");
  };

  if (checkingAuth) {
    return <div>Checking login session...</div>;
  }

  if (page === "login") {
    return (
      <Login onLogin={handleLogin} onRegister={() => setPage("register")} />
    );
  }

  if (page === "register") {
    return (
      <Register onRegister={handleRegister} onLogin={() => setPage("login")} />
    );
  }

  if (page === "profile" && user) {
    return <Profile user={user} onBack={() => setPage("dashboard")} />;
  }

  if (page === "dashboard" && user) {
    return (
      <ExpenseDashboard
        user={user}
        onLogout={handleLogout}
        onViewProfile={() => setPage("profile")}
      />
    );
  }

  return <Login onLogin={handleLogin} onRegister={() => setPage("register")} />;
}

export default App;
