"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  Briefcase,
} from "lucide-react";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: "corporate",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.businessName.trim()) {
      setError("Business name is required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessType: formData.businessType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Registration successful
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-800/50 shadow-2xl shadow-pink-500/5 relative z-10">
        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-pink-500/20 mb-4 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <Building2 className="w-8 h-8 text-pink-400 relative z-10" />
              <Sparkles className="w-4 h-4 text-cyan-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-slate-400 text-sm">Join Display Manager today</p>
          </div>

          {success ? (
            <div className="text-center space-y-6 py-8 animate-in fade-in duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                <CheckCircle className="w-10 h-10 text-green-400 relative z-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-50">Success!</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Your account has been created successfully.
                </p>
                <p className="text-slate-400 text-sm">
                  Your account is pending admin approval. You will be notified
                  once approved.
                </p>
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-6">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
                  <span>Redirecting to login...</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-in slide-in-from-top duration-300">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Business Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-pink-400" />
                  Business Name
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    name="businessName"
                    placeholder="Your Business Name"
                    value={formData.businessName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-12 bg-slate-800/50 border-slate-700/50 text-slate-50 placeholder:text-slate-500 focus:border-pink-500/50 focus:ring-pink-500/20 transition-all duration-300 group-hover:border-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Business Type Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  Business Type
                </label>
                <div className="relative group">
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full h-12 px-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-50 text-sm focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 group-hover:border-slate-600 focus:outline-none"
                    required
                  >
                    <option value="corporate">Corporate</option>
                    <option value="masjid">Masjid</option>
                    <option value="hospital">Hospital</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  Email Address
                </label>
                <div className="relative group">
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-12 bg-slate-800/50 border-slate-700/50 text-slate-50 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300 group-hover:border-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-pink-400" />
                  Password
                </label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-12 pr-12 bg-slate-800/50 border-slate-700/50 text-slate-50 placeholder:text-slate-500 focus:border-pink-500/50 focus:ring-pink-500/20 transition-all duration-300 group-hover:border-slate-600"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">At least 8 characters</p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Confirm Password
                </label>
                <div className="relative group">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-12 pr-12 bg-slate-800/50 border-slate-700/50 text-slate-50 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all duration-300 group-hover:border-slate-600"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative group"
              >
                <span className="relative z-10">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              </Button>

              {/* Terms Notice */}
              <p className="text-xs text-slate-500 text-center">
                By creating an account, you agree to our{" "}
                <a href="/terms" className="text-pink-400 hover:text-pink-300">
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Privacy Policy
                </a>
              </p>
            </form>
          )}

          {/* Divider */}
          {!success && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 text-slate-500 bg-slate-900/80">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Ready to sign in?{" "}
                  <a
                    href="/login"
                    className="text-transparent bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text font-semibold hover:from-pink-300 hover:to-cyan-300 transition-all"
                  >
                    Log in now
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}
