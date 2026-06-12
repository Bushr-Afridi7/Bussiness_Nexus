import React, { createContext, useState, useContext, useEffect } from "react";
import { User, UserRole, AuthContextType } from "../types";
import toast from "react-hot-toast";
import api from "../api/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "business_nexus_user";
const TOKEN_STORAGE_KEY = "nexus_token";
const RESET_TOKEN_KEY = "business_nexus_reset_token";

type BackendUser = {
  id: number;
  fullName: string;
  email: string;
  role: "Investor" | "Entrepreneur";
  bio?: string | null;
  location?: string | null;
  createdAt?: string;
};

const convertRoleToBackend = (role: UserRole): "Investor" | "Entrepreneur" => {
  return role === "investor" ? "Investor" : "Entrepreneur";
};

const convertRoleToFrontend = (role: string): UserRole => {
  return role.toLowerCase() === "investor" ? "investor" : "entrepreneur";
};

const mapBackendUserToFrontendUser = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id.toString(),
    name: backendUser.fullName,
    email: backendUser.email,
    role: convertRoleToFrontend(backendUser.role),
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      backendUser.fullName
    )}&background=random`,
    bio: backendUser.bio || "",
    isOnline: true,
    createdAt: backendUser.createdAt || new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await api.post("/Auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      const backendUser: BackendUser = response.data.user;

      const loggedInUser = mapBackendUserToFrontendUser(backendUser);

      if (loggedInUser.role !== role) {
        throw new Error("Selected role does not match this account.");
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));

      setUser(loggedInUser);

      toast.success("Successfully logged in!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Login failed.";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await api.post("/Auth/register", {
        fullName: name,
        email,
        password,
        role: convertRoleToBackend(role),
      });

      const backendUser: BackendUser = response.data.user;
      const registeredUser = mapBackendUserToFrontendUser(backendUser);

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(registeredUser));

      setUser(registeredUser);

      toast.success("Account created successfully!");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed.";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      localStorage.setItem(RESET_TOKEN_KEY, "mock-reset-token");
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
      throw error;
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const storedToken = localStorage.getItem(RESET_TOKEN_KEY);

      if (token !== storedToken) {
        throw new Error("Invalid or expired reset token");
      }

      localStorage.removeItem(RESET_TOKEN_KEY);
      toast.success("Password reset successfully");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (
    userId: string,
    updates: Partial<User>
  ): Promise<void> => {
    try {
      const updatedUser = {
        ...user,
        ...updates,
      } as User;

      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Profile update failed.");
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};