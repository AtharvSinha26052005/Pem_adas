import type { User, Project } from "../types";

const API_BASE = "http://localhost:8000";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If response is not JSON
    }
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return {} as T;
  }
  return response.json();
}

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<{ access_token: string }>(response);
    return data.access_token;
  },

  async signup(name: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<User>(response);
  },

  async getMe(): Promise<User> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<User>(response);
  },

  // Users Management (Admin only)
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/users`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<User[]>(response);
  },

  async updateUserRole(userId: number, roleName: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${userId}/role`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ role_name: roleName }),
    });
    return handleResponse<User>(response);
  },

  // Projects Management
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE}/projects`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<Project[]>(response);
  },

  async createProject(name: string, vehiclePlatform: string, oddType: string): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, vehicle_platform: vehiclePlatform, odd_type: oddType }),
    });
    return handleResponse<Project>(response);
  },

  async updateProject(
    projectId: number,
    updates: Partial<Pick<Project, "name" | "vehicle_platform" | "odd_type" | "status">>
  ): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<Project>(response);
  },

  async getAiAssessment(projectId: number): Promise<{ assessment: string; provider: string }> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/ai-assess`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse<{ assessment: string; provider: string }>(response);
  },
};
