import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  Eye,
  FileText,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  ChevronRight
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 py-4 px-6 md:px-12 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            DermAI
          </h1>
        </div>
        <nav className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Sign In
          </Link>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md">
            <Link to="/register">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center">
        
        {/* 1. Hero Section */}
        <section className="w-full max-w-6xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="w-4 h-4" />
              <span>Hybrid Deep Learning Framework</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl leading-tight">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Skin Disease</span> Detection
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl">
              An intelligent and automated system designed to improve the accuracy, efficiency, and interpretability 
              of dermatology diagnostics through advance explainable AI (XAI).
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 h-auto rounded-lg shadow-md hover:shadow-lg transition-all">
                <Link to="/register">
                  Test Platform Now <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto text-lg px-8 py-3 h-auto rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* 2. Features Section */}
        <section className="w-full bg-white py-20 px-6 border-y border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Comprehensive Healthcare Portals</h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                DermAI offers tailored dashboard experiences bringing patients and doctors closer together through secure data analysis.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { title: "AI Diagnostics", icon: BrainCircuit, color: "text-purple-600", bg: "bg-purple-50", desc: "CNN, BiLSTM, and ViT ensemble delivering interpretable skin lesion analysis." },
                { title: "Patient Dashboard", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", desc: "Track personal scan history, risk levels, and automated AI confidence reports easily." },
                { title: "Doctor Insights", icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Manage patient queues, verify XAI reports (Grad-CAM), and authorize treatment." },
                { title: "Admin Analytics", icon: Activity, color: "text-amber-600", bg: "bg-amber-50", desc: "Monitor system health, model accuracy across demographics, and active user stats." }
              ].map((feat, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="p-6 h-full flex flex-col items-start bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-lg ${feat.bg} ${feat.color} mb-4`}>
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feat.title}</h3>
                    <p className="text-sm text-gray-500 flex-1">{feat.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 3. How It Works Section */}
        <section className="w-full max-w-6xl mx-auto py-20 px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How DermAI Works</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              A simplified pipeline for advanced clinical care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10"></div>
            
            {[
              { step: "01", title: "Upload Image", icon: UploadCloud, desc: "Patients securely upload close-up images of dermatological concerns." },
              { step: "02", title: "AI Analysis", icon: BrainCircuit, desc: "Sakaguchi preprocessing & Hybrid AI models extract advanced spatial features." },
              { step: "03", title: "View Results", icon: Eye, desc: "Confidence scores and XGBoost predictions are instantly displayed." },
              { step: "04", title: "Clinical Consult", icon: ShieldCheck, desc: "Doctors review heatmaps (LRP/Grad-CAM) to confirm outcomes." }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center mb-6 relative">
                  <step.icon className="w-10 h-10 text-blue-600" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center border-2 border-white">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Trust / Info Section */}
        <section className="w-full bg-blue-600 py-16 px-6 mt-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Pioneering Transparent Diagnostics</h2>
            <p className="text-blue-100 md:text-lg mb-8">
              At DermAI, trust and transparency are paramount. By integrating Explainable AI (XAI) algorithms,
              our platform not only predicts future disease progression but demonstrates exactly <em>why</em> an accurate classification is generated.
            </p>
            <Button asChild className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium shadow-sm transition-colors">
              <Link to="/register">Join the Platform</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="w-full bg-gray-900 py-10 px-6 text-center text-sm text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-bold text-white tracking-wide">DermAI</span>
          </div>
          <div className="space-x-6">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6">
          <p>© {new Date().getFullYear()} DermAI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Sparkles helper icon for aesthetics
function SparklesIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
