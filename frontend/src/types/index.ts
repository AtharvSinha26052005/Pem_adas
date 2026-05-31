export interface User {
  id: number;
  name: string;
  email: string;
  role_name: string;
}

export interface Project {
  id: number;
  name: string;
  vehicle_platform: string;
  odd_type: string;
  status: string; // 'Draft', 'In Review', 'Approved', 'Rejected'
  created_by: number;
  creator_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
