import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { Activity, User, Mail, Lock, ArrowRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Send age and gender to the register method
    const result = await register(name, email, password, { age, gender });
    setLoading(false);
    if (result.success) {
      navigate("/login");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 font-sans">
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
              Join Derm<span className="text-blue-600">AI</span>
            </h1>
            <p className="mt-2 text-gray-500 text-sm">Create your clinical diagnostic account</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                    placeholder="John Doe"
                    required 
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Age</label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                    placeholder="Years"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Gender</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none appearance-none"
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
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

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-100 transition-all disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Sign Up"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-50 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Sign in
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


