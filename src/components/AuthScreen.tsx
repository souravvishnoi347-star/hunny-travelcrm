"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  PhoneCall
} from "lucide-react";

export function AuthScreen() {
  const { login, resetPassword } = useAuth();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  
  // Login Form States
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveryPin, setRecoveryPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    setTimeout(() => {
      const res = login(loginId, loginPassword);
      if (!res.success) {
        setLoginError(res.error || "Invalid credentials.");
      }
      setLoginLoading(false);
    }, 400);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (newPassword !== confirmPassword) {
      setForgotError("New Password and Confirm Password do not match.");
      return;
    }

    setForgotLoading(true);

    setTimeout(() => {
      const res = resetPassword(forgotEmail, recoveryPin, newPassword);
      if (res.success) {
        setForgotSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          setLoginId(forgotEmail);
          setLoginPassword(newPassword);
          setMode("login");
          setForgotSuccess(null);
          setRecoveryPin("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1200);
      } else {
        setForgotError(res.error || "Password reset failed.");
      }
      setForgotLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-4 sm:p-6 overflow-y-auto">
      
      {/* Background Decorative Lighting */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md my-auto">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/90 overflow-hidden backdrop-blur-md">
          
          {/* Top Brand Header */}
          <div className="bg-gradient-to-r from-[#002f6c] via-[#0a3871] to-[#ea580c] px-6 py-8 text-center text-white relative">
            <div className="inline-flex items-center justify-center p-2.5 bg-white rounded-2xl shadow-md mb-3 border border-amber-200">
              <img 
                src="/logo.png" 
                alt="Traymbhkam Tour and Travels" 
                className="h-12 w-auto object-contain" 
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-serif">
              Traymbhkam Tour and Travels
            </h1>
            <p className="text-xs text-amber-200 uppercase tracking-widest font-bold mt-1">
              CRM & Operations Portal
            </p>
            <p className="text-[11px] text-amber-300 font-serif font-semibold mt-1 tracking-wider">
              ॐ नमः शिवाय · Traymbhkam Tour and Travels
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* LOGIN MODE */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-900">Admin & Staff Sign In</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enter your authorized credentials to access the CRM
                  </p>
                </div>

                {loginError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Login ID Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    Login ID / Registered Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="admin@traymbhkam.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setForgotError(null);
                        setForgotSuccess(null);
                        setForgotEmail(loginId || "admin@traymbhkam.com");
                      }}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Quick Help */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-sky-600 border-gray-300 focus:ring-sky-500"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 bg-[#0369a1] hover:bg-[#0284c7] active:bg-[#075985] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Session...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sign In to CRM</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD MODE */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setForgotError(null);
                    setForgotSuccess(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-sky-600 transition cursor-pointer mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>

                <div className="text-left">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-500" />
                    Reset Password
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verify with your registered email and Master Security PIN.
                  </p>
                </div>

                {forgotError && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Registered Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@traymbhkam.com"
                    className="w-full px-3.5 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                {/* Master Security PIN */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Master Recovery PIN / Security Code
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={recoveryPin}
                    onChange={(e) => setRecoveryPin(e.target.value)}
                    placeholder="Enter 6-digit Security PIN"
                    className="w-full px-3.5 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  <p className="text-[10px] text-gray-500">
                    Enter your authorized 6-digit administrative security code.
                  </p>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Set New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3.5 pr-9 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2 bg-gray-50/80 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Set New Password</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Footer Info */}
          <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-[#0369a1]" />
              Support: +91 82660 16066
            </span>
            <span className="text-gray-400">Mr. Gagandeep</span>
          </div>

        </div>

      </div>

    </div>
  );
}
