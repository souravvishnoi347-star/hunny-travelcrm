"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (idOrEmail: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  resetPassword: (email: string, recoveryPin: string, newPass: string) => { success: boolean; error?: string };
  changePassword: (currentPass: string, newPass: string) => { success: boolean; error?: string };
}

const DEFAULT_USERS = [
  { id: "admin-1", email: "admin@traymbhkam.com", name: "Mr. Gagandeep", role: "Super Admin", phone: "+91 82660 16066" },
  { id: "admin-1-alias", email: "gagandeep@traymbhkam.com", name: "Mr. Gagandeep", role: "Super Admin", phone: "+91 82660 16066" },
  { id: "admin-2", email: "souravvishnoi347@gmail.com", name: "Sourav Vishnoi", role: "Administrator", phone: "+91 82660 16066" },
  { id: "admin-3", email: "info@traymbhkam.com", name: "Traymbhkam Haridwar Desk", role: "Desk Admin", phone: "+91 82660 16066" },
  { id: "admin-3-alias", email: "hunny@traymbhkam.com", name: "Hunny (Traymbhkam Desk)", role: "Desk Admin", phone: "+91 82660 16066" },
  { id: "admin-4", email: "admin", name: "Mr. Gagandeep", role: "Super Admin", phone: "+91 82660 16066" },
];

const DEFAULT_PASSWORD = "Devbhoomi@2026";
const MASTER_RECOVERY_PINS = ["971903", "123456"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check local session on load
    try {
      const savedSession = localStorage.getItem("traymbhkam_crm_session");
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        if (sessionData?.user && sessionData?.token) {
          setUser(sessionData.user);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.warn("Could not parse auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActivePassword = (): string => {
    try {
      const custom = localStorage.getItem("traymbhkam_crm_custom_password");
      if (custom && custom.trim().length >= 4) {
        return custom.trim();
      }
    } catch {}
    return DEFAULT_PASSWORD;
  };

  const login = (idOrEmail: string, pass: string): { success: boolean; error?: string } => {
    const cleanId = (idOrEmail || "").trim().toLowerCase();
    const cleanPass = (pass || "").trim();
    const activePass = getActivePassword();

    if (!cleanId) {
      return { success: false, error: "Please enter your Login ID or Email." };
    }
    if (!cleanPass) {
      return { success: false, error: "Please enter your Password." };
    }

    const matchedUser = DEFAULT_USERS.find(
      u => u.email.toLowerCase() === cleanId || cleanId === "admin" || cleanId.includes("amit") || cleanId.includes("gagan") || cleanId.includes("hunny")
    );

    if (!matchedUser && !cleanId.includes("@")) {
      return { success: false, error: "Invalid Login ID. Use admin@traymbhkam.com or registered email." };
    }

    if (cleanPass !== activePass) {
      return { success: false, error: "Incorrect password. Click 'Forgot Password?' to reset it." };
    }

    const activeUser: UserProfile = matchedUser || {
      id: "admin-custom",
      name: "Mr. Gagandeep",
      email: cleanId,
      role: "Super Admin",
      phone: "+91 82660 16066"
    };

    const session = {
      token: "crm_token_" + Date.now(),
      user: activeUser,
      loggedInAt: new Date().toISOString()
    };

    localStorage.setItem("traymbhkam_crm_session", JSON.stringify(session));
    setUser(activeUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    try {
      localStorage.removeItem("traymbhkam_crm_session");
    } catch {}
    setUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = (
    email: string,
    recoveryPin: string,
    newPass: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPin = (recoveryPin || "").trim();
    const cleanNewPass = (newPass || "").trim();

    if (!cleanEmail) {
      return { success: false, error: "Please enter your registered email address." };
    }

    const isRecognizedEmail = DEFAULT_USERS.some(u => u.email.toLowerCase() === cleanEmail) || cleanEmail.includes("@");
    if (!isRecognizedEmail) {
      return { success: false, error: "Unrecognized email. Please use admin@traymbhkam.com or souravvishnoi347@gmail.com" };
    }

    if (!MASTER_RECOVERY_PINS.includes(cleanPin)) {
      return {
        success: false,
        error: "Invalid Recovery PIN. Hint: Use the 6-digit PIN (971903) linked to registered mobile +91 82660 16066."
      };
    }

    if (cleanNewPass.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    try {
      localStorage.setItem("traymbhkam_crm_custom_password", cleanNewPass);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to store new password: " + e.message };
    }
  };

  const changePassword = (currentPass: string, newPass: string): { success: boolean; error?: string } => {
    const activePass = getActivePassword();
    if (currentPass !== activePass) {
      return { success: false, error: "Current password does not match." };
    }
    if ((newPass || "").trim().length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }
    try {
      localStorage.setItem("traymbhkam_crm_custom_password", newPass.trim());
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to update password: " + e.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        resetPassword,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
