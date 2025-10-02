export interface AdminDashboardUser {
  userId: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  isCSVSync: boolean;
}

export interface CreateAdminDashboardUser {
  email: string;
  isAdmin: boolean;
  isCSVSync: boolean;
}

export interface AdminDashboardUpdateUserRequest {
  email?: string;
  isAdmin?: boolean;
  isCSVSync?: boolean;
  isActive?: boolean;
}
