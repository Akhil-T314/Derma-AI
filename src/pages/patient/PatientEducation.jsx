import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Shield, Sun, CheckCircle, ChevronRight, Play } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function PatientEducation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Education</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Empowering patients through dermatological science and sun safety protocols.</p>
      </div>

      {/* FEATURED: THE ABCDs */}
      <Card className="p-8 border-none shadow-xl rounded-3xl bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
         <div className="relative z-10">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
               <Shield className="w-8 h-8 text-blue-400" /> The ABCDEs of Melanoma Detection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
               {[
                 { letter: "A", name: "Asymmetry", desc: "One half is unlike the other half." },
                 { letter: "B", name: "Border", desc: "Irregular, scalloped or poorly defined." },
                 { letter: "C", name: "Color", desc: "Varied from one area to another." },
                 { letter: "D", name: "Diameter", desc: "Usually greater than 6mm." },
                 { letter: "E", name: "Evolving", desc: "Changing size, shape or color." }
               ].map((item, i) => (
                 <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <span className="text-3xl font-black text-blue-400 block mb-2">{item.letter}</span>
                    <p className="text-xs font-black uppercase tracking-widest mb-1">{item.name}</p>
                    <p className="text-[10px] opacity-70 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recommended Reading</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { title: "Skin Health 101", time: "5 min read", category: "Prevention" },
                 { title: "Sunscreen: Facts vs Myths", time: "8 min read", category: "Safety" },
                 { title: "Managing Atypical Nevi", time: "12 min read", category: "Clinical" },
                 { title: "Early Detection Statistics", time: "4 min read", category: "Research" }
               ].map((article, i) => (
                 <Card key={i} className="p-6 border-none shadow-sm rounded-2xl bg-white ring-1 ring-slate-900/5 hover:ring-blue-600/30 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          {article.category}
                       </span>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{article.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-2">
                       <BookOpen className="w-3 h-3" /> {article.time}
                    </p>
                 </Card>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <Card className="p-6 border-none shadow-sm rounded-2xl bg-amber-50 text-amber-900 border border-amber-100">
               <Sun className="w-10 h-10 mb-4" />
               <h3 className="text-lg font-black mb-2">UV Index Protocol</h3>
               <p className="text-xs font-medium leading-relaxed opacity-80 mb-4">
                  Always wear SPF 30+ when the UV Index is above 3. Reapply every 2 hours during direct exposure.
               </p>
               <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-5 rounded-xl text-xs">View Daily UV Forecast</Button>
            </Card>

            <Card className="p-6 border-none shadow-sm rounded-2xl bg-white ring-1 ring-slate-900/5">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Patient Webinars</h3>
               <div className="p-4 rounded-xl bg-slate-100 relative group cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
                     <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                  <div className="h-24 bg-slate-200 rounded-lg mb-3"></div>
                  <p className="text-[11px] font-bold text-slate-900">Lesion Monitoring at Home</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Presented by AAD Specialists</p>
               </div>
            </Card>
         </div>
      </div>
    </motion.div>
  );
}
