import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Activity, Mail, Lock, ArrowRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success) {
      navigate(`/${result.role}`);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 font-sans">
      {/* Small top-left back button to match Landing page feel */}
      <div className="absolute top-6 left-6 md:left-12">
        <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Derm<span className="text-blue-600">AI</span> Login
            </h1>
            <p className="mt-2 text-gray-500 text-sm">Sign in to your clinical workspace</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    placeholder="name@example.com"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    placeholder="••••••••"
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-100 transition-all">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-50 text-center">
              <p className="text-sm text-gray-500">
                New to the platform?{" "}
                <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400 font-medium tracking-wide uppercase">
            © {new Date().getFullYear()} DermAI Platform • AI Diagnostics
          </p>
        </motion.div>
      </div>
    </div>
  );
}
