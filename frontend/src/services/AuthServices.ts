const API_URL = `${import.meta.env.VITE_API_BASE_URL}/Auth`;

export interface User {
  id: number;
  username: string;
  createdAt?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const registerUser = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed.");
  }

  return data;
};

export const loginUser = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Invalid username or password.");
  }

  localStorage.setItem("token", data.token);

  return data;
};

export const getUserProfile = async (): Promise<User> => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch profile.");
  }

  return response.json();
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
