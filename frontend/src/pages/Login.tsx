import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Cpu, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const { login, signup, error, setError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset errors when switching views
  useEffect(() => {
    setError(null);
  }, [isSignUp, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      // Errors are set in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual background glowing accents */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/20 mb-4 animate-pulse">
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">
            {isSignUp ? "Create Account" : "Access Platform"}
          </h1>
          <p className="text-sm text-slate-400 mt-2 text-center">
            {isSignUp
              ? "Register to begin validating ADAS platforms"
              : "Sign in to enter the AI-powered validation suite"}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-rose-300 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-slate-950/60 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-purple-500/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300 focus:ring-4 focus:ring-purple-500/10"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-slate-950/60 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-purple-500/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300 focus:ring-4 focus:ring-purple-500/10"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950/60 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-purple-500/50 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all duration-300 focus:ring-4 focus:ring-purple-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-800 disabled:to-indigo-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98] transition-all duration-300 relative overflow-hidden group mt-4 shrink-0"
          >
            {/* Sliding highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
            
            <span>
              {submitting
                ? "Processing..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </span>
          </button>
        </form>

        {/* Switch Auth mode */}
        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-xs text-slate-400">
            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1.5 font-bold text-purple-400 hover:text-purple-300 transition-colors focus:underline outline-none"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
