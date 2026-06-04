import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, AlertTriangle, Activity, CheckCircle, Target, Image as ImageIcon, Loader2, Download, Calendar, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import axios from "axios";

export default function CaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const cleanUrl = url.replace(/\\/g, '/');
    return cleanUrl.startsWith('/') ? `http://localhost:3000${cleanUrl}` : `http://localhost:3000/${cleanUrl}`;
  };

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log("SCAN STATE:", scan);
  }, [scan]);

  useEffect(() => {
    const fetchScanData = async () => {
      try {
        const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("dermai_user") || "{}").id;
        const res = await axios.get(`http://localhost:3000/api/scans/` + id, {  
          headers: { Authorization: `Bearer ` + token }
        });

        console.log("API RESPONSE:", res.data);
        setScan(res.data);
        if (res.data) {
           setDoctorNotes(res.data.doctor_notes || "");
           setPrivateNotes(res.data.private_clinical_notes || "");
           setFinalDiagnosis(res.data.final_diagnosis || res.data.ai_prediction || "");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load scan details.");
      } finally {
        setLoading(false);
      }
    };

    fetchScanData();
  }, [id, user]);

  const handleReviewSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("dermai_user") || "{}").id;
      await axios.put(`http://localhost:3000/api/scans/` + id + `/review`,
      {
        doctorNotes,
        finalDiagnosis,
        actionPlan, privateNotes,
        status: "reviewed"
      },
      { headers: { Authorization: `Bearer ` + token } });

      setScan(prev => ({...prev, status: "reviewed", doctor_notes: doctorNotes, final_diagnosis: finalDiagnosis, action_plan: actionPlan, private_clinical_notes: privateNotes}));
      alert("Review completed successfully!");
      navigate("/doctor"); // Optionally redirect to queue
    } catch (err) {
      console.error(err);
      alert("Error submitting review.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleDownloadPdf = () => {
    window.print();
  }

  const handleSetReminder = () => {
    alert("Follow-up reminder has been scheduled.");
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-gray-500">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-semibold text-gray-900">Scan not found</h2> 
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button> 
      </div>
    );
  }

  const isDoctor = user?.role === "doctor" || user?.role === "admin";
  const riskLevel = scan.risk_level || "Low";

  const riskStyles = {
    High: { badge: "bg-red-100 text-red-800" },
    Medium: { badge: "bg-amber-100 text-amber-800" },
    Low: { badge: "bg-green-100 text-green-800" }
  };
  const style = riskStyles[riskLevel] || riskStyles.Low;

  console.log('RAW scan object:', scan);
    console.log('RAW scan.progressions:', scan.progressions);
    const progressionData = scan.progressions?.map((p) => ({ date: p.month_label, riskScore: Number(p.risk_score) })) || [];  
  console.log("progressionData:", progressionData);
    console.log('FINAL progressionData:', progressionData);
    console.log('isDoctor:', isDoctor);
    const confidencePercentage = scan.confidence_score || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto pb-12 px-4 sm:px-6"
    >
      {/* PROFESSIONAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 border border-slate-200 rounded-xl transition-all shadow-sm bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case Report #{scan.id?.substring(0,8)}</h1>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                scan.status === 'reviewed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {scan.status === 'reviewed' ? 'Completed' : 'Awaiting Review'}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium">Recorded on {new Date(scan.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={handleDownloadPdf} className="border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold shadow-sm">
             <Download className="w-4 h-4 mr-2" /> Export PDF
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN WORKSPACE: CLINICAL DATA */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. PATIENT PROFILE CARD */}
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
               <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                 <User className="w-4 h-4 text-blue-600" /> Patient Clinical Profile
               </h2>
               <span className="text-xs text-slate-400 font-medium italic">Internal Record</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-base font-bold text-slate-900">{scan.patient_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p>
                  <p className="text-base font-bold text-slate-900">{scan.age || "—"}y / {scan.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Localization</p>
                  <p className="text-base font-bold text-blue-700 flex items-center gap-1.5 capitalize">
                    <Target className="w-4 h-4" /> {scan.localization || "Unspecified"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Level</p>
                  <span className={`text-sm font-bold ${riskLevel === 'High' ? 'text-red-600' : 'text-amber-600'}`}>
                    {riskLevel} Risk
                  </span>
                </div>
              </div>
              
              {scan.medical_history && (
                <div className="mt-6 pt-6 border-t border-slate-50">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Clinical History & Symptoms</p>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                    "{scan.medical_history}"
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 2. DIAGNOSTIC PIPELINE (EVIDENCE) */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Diagnostic Evidence Pipeline</h2>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black tracking-widest border border-blue-100 uppercase">Hybrid CNN+ViT</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Raw Dermoscopy", key: "original_image_url", desc: "Original uncorrected specimen" },
                  { title: "Sakaguchi Enhanced", key: "preprocessed_image_url", desc: "Hairs removed & contrast optimized" },
                  { title: "XAI: Grad-CAM", key: "xai_heatmap_url", desc: "AI focal attention mapping" },
                  { title: "XAI: LRP Propagation", key: "xai_lrp_url", desc: "Pixel-level feature relevance" }
                ].map((stage, idx) => (
                  <Card key={idx} className="border-slate-200 overflow-hidden bg-white hover:border-blue-200 transition-colors group">
                    <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">{stage.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{stage.desc}</p>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">{idx + 1}</span>
                    </div>
                    <div className="aspect-[4/3] bg-slate-50 relative flex items-center justify-center">
                      {scan[stage.key] ? (
                        <img 
                          src={getImageUrl(scan[stage.key])} 
                          alt={stage.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <ImageIcon size={32} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Processing Layer Missing</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
             </div>
          </div>

          {/* 3. HISTORICAL TIMELINE */}
          {isDoctor && progressionData && progressionData.length > 0 && (
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800">Historical Risk Progression</h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Scan History</span>
               </div>
               <div className="p-8 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={{ r: 5, strokeWidth: 2, fill: 'white' }} 
                      activeDot={{ r: 7 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
               </div>
            </Card>
          )}
        </div>

        {/* SIDEBAR: ACTION & VERDICT */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          
          {/* AI PREDICTION SUMMARY */}
          <Card className="border-blue-200 bg-blue-50/30 shadow-sm overflow-hidden">
            <div className="p-6">
               <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Primary Prediction</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">{scan.ai_prediction || "Analyzing..."}</h3>
               
               <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <p className="text-xs font-bold text-slate-600">Model Confidence</p>
                      <p className="text-sm font-black text-blue-700">{confidencePercentage}%</p>
                    </div>
                    <Progress value={Number(confidencePercentage)} className="h-2 bg-slate-200/50" />
                  </div>

                  <div className="pt-4 border-t border-blue-100">
                    <div className="flex justify-between items-end mb-1.5">
                      <p className="text-xs font-bold text-slate-600">Secondary Risk Index</p>
                      <p className={`text-sm font-black ${scan.progression_risk > 0.5 ? 'text-red-600' : 'text-amber-600'}`}>
                        {(scan.progression_risk * 100 || 0).toFixed(1)}%
                      </p>
                    </div>
                    <Progress value={Number(scan.progression_risk * 100 || 0)} className="h-2 bg-slate-200/50" />
                  </div>
               </div>
            </div>
          </Card>

          {/* CLINICAL VERDICT FORM */}
          {scan.status !== 'reviewed' && isDoctor ? (
            <Card className="border-slate-200 shadow-xl bg-white overflow-hidden ring-1 ring-slate-900/5">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-800">Submit Clinical Verdict</h2>
              </div>
              <div className="p-6 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Internal Clinical Observations</label>
                    <textarea 
                      value={privateNotes}
                      onChange={(e) => setPrivateNotes(e.target.value)}
                      className="w-full min-h-[100px] p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                      placeholder="Enter private clinical reasoning..."
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Message for Patient</label>
                    <textarea 
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      className="w-full min-h-[100px] p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none"
                      placeholder="Explain findings to the patient..."
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recommended Action Plan</label>
                    <select 
                      value={actionPlan}
                      onChange={(e) => setActionPlan(e.target.value)}
                      className="w-full p-3 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                    >
                      <option value="">-- Select clinical next step --</option>
                      <option value="No immediate action needed.">No immediate action needed</option>
                      <option value="Monitor & re-scan in 3 months.">Monitor & re-scan in 3 months</option>
                      <option value="Consult a primary care physician.">Consult primary care</option>
                      <option value="Urgent biopsy / referral.">Urgent biopsy / dermatological referral</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Diagnostic Override</label>
                    <select 
                      value={finalDiagnosis}
                      onChange={(e) => setFinalDiagnosis(e.target.value)}
                      className="w-full p-3 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                    >
                      <option value={scan.ai_prediction}>AI Suggested: {scan.ai_prediction}</option>
                      <option value="Melanoma">Confirm: Melanoma</option>
                      <option value="Basal Cell Carcinoma">Confirm: BCC</option>
                      <option value="Benign Nevus">Confirm: Benign Nevus</option>
                      <option value="Other">Other Diagnostic</option>
                    </select>
                 </div>

                 <Button 
                   onClick={handleReviewSubmit}
                   disabled={submitting}
                   className="w-full py-7 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-xl shadow-slate-200 transition-all active:scale-95"
                 >
                   {submitting ? "Signing Record..." : "Publish Final Diagnosis"}
                 </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
               <Card className="border-emerald-200 bg-emerald-50 shadow-sm p-6">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Final Diagnostic Verdict</p>
                  <h3 className="text-2xl font-black text-emerald-900">{scan.final_diagnosis || "Awaiting Review"}</h3>
               </Card>

               <Card className="border-slate-200 bg-white p-6">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Clinical Action Plan</h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {scan.action_plan || "Pending clinical review and instructions."}
                  </p>
               </Card>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

}







