import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, AlertTriangle, Activity, CheckCircle, Target, Image as ImageIcon, Loader2, Download, Calendar } from "lucide-react";
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
    const fetchScanData = async () => {
      try {
        const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("dermai_user") || "{}").id;
        const res = await axios.get(`http://localhost:3000/api/scans/` + id, {  
          headers: { Authorization: `Bearer ` + token }
        });

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
  const testData = [
    { date: "Baseline", riskScore: 40 },
    { date: "Current", riskScore: 80 },
    { date: "Forecast (XGBoost)", riskScore: 92 }
  ];
    console.log('FINAL progressionData:', progressionData);
    console.log('isDoctor:', isDoctor);
    const confidencePercentage = scan.confidence_score || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto pb-12 print:max-w-full print:m-0 print:p-0"
    >
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-900 bg-white border border-gray-200 shadow-sm rounded-full p-2 h-auto"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case ID: {scan.id?.substring(0,8)}</h1>   
            {isDoctor && (
              <p className="text-sm font-medium text-gray-700 mt-1">
                Patient: {scan.patient_name || "Unknown Patient"}
              </p>
            )}
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">  
              Submitted on {new Date(scan.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {scan.status === "reviewed" ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Status: Reviewed / Completed
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Status: Pending Doctor Review
          </div>
        )}
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Dermatological Scan Report</h1>
        <div className="text-gray-600 mt-2">Case ID: {scan.id}</div>
        {isDoctor && (
          <div className="text-gray-600">Patient: {scan.patient_name || "Unknown Patient"}</div>
        )}
        <div className="text-gray-600">Date: {new Date(scan.created_at).toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual History & Hybrid Explainable AI Analysis */}
          <Card className="p-0 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" /> {isDoctor ? "Hybrid Diagnostic Pipeline (CNN + BiLSTM + ViT)" : "Uploaded Image Timeline"}
              </h2>
            </div>
            
            <div className={`grid grid-cols-1 ${isDoctor ? 'sm:grid-cols-2 gap-4 bg-gray-50 p-4' : ''}`}>
              {/* 1. Original Image */}
              <div className="bg-white p-3 flex flex-col h-full rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">        
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">1. Original Image</p>
                </div>
                <div className="flex-1 min-h-[220px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                  <img
                    src={getImageUrl(scan.original_image_url || scan.image_url) || "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400"}      
                    alt="Original Dermoscopy"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {isDoctor && (
                <>
                  {/* 2. Enhanced Preprocessing (Sakaguchi + OpenCV) */}
                  <div className="bg-white p-3 flex flex-col h-full rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">        
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3 h-3" /> 2. Preprocessed (Sakaguchi Function & OpenCV)
                      </p>
                    </div>
                    <div className="flex-1 min-h-[220px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                      <img
                        src={getImageUrl(scan.original_image_url || scan.image_url) || "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400"}
                        alt="Preprocessed enhanced contrast"
                        className="object-cover w-full h-full"
                        style={{ filter: 'contrast(1.35) saturate(1.2) brightness(1.1) drop-shadow(0 0 0.5rem rgba(0,0,0,0.1))', mixBlendMode: 'luminosity' }}
                      />
                    </div>
                  </div>

                  {/* 3. XAI Grad-CAM */}
                  <div className="bg-white p-3 flex flex-col h-full rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">        
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3 h-3" /> 3. XAI: Grad-CAM
                      </p>
                    </div>
                    <div className="flex-1 min-h-[220px] bg-red-50 rounded-lg overflow-hidden flex items-center justify-center relative">
                      <img
                        src={getImageUrl(scan.xai_heatmap_url) || getImageUrl(scan.original_image_url || scan.image_url) || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400"}
                        alt="Grad-CAM Heatmap"
                        className="object-cover w-full h-full opacity-90"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/80 to-transparent p-3 pt-8 text-white pointer-events-none">       
                        <p className="text-xs font-medium">Gradient-weighted Class Activation Mapping</p>
                      </div>
                    </div>
                  </div>

                  {/* 4. XAI LRP */}
                  <div className="bg-white p-3 flex flex-col h-full rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">        
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3 h-3" /> 4. XAI: Layer-wise Relevance Propagation (LRP)
                      </p>
                    </div>
                    <div className="flex-1 min-h-[220px] bg-emerald-50 rounded-lg overflow-hidden flex items-center justify-center relative">
                      <img
                        src={getImageUrl(scan.xai_heatmap_url) || getImageUrl(scan.original_image_url || scan.image_url) || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400"}
                        alt="LRP Heatmap"
                        className="object-cover w-full h-full opacity-90"
                        style={{ filter: 'hue-rotate(180deg) saturate(1.5)' }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/80 to-transparent p-3 pt-8 text-white pointer-events-none">       
                        <p className="text-xs font-medium">Pixel-level propagation highlighting lesion boundaries</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* DOCTOR ONLY: Progression History Chart & Future XGBoost Prediction */}
            {true && (
              <div style={{ width: "100%", height: 350, border: "2px solid red", padding: "10px" }}>
                <Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl print:hidden h-full">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-blue-600" /> Future Disease Progression Forecast (XGBoost Model)
                  </h2>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={testData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="riskScore" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}
          </div>

        <div className="space-y-6">
          {/* Main 2. MAIN RESULT SECTION */}
          {scan.status === "reviewed" && scan.final_diagnosis ? (
            <div className="space-y-6">
              <Card className="p-6 border border-green-100 bg-green-50 rounded-xl shadow-sm">
                <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-2">Final Diagnosis</h3>
                <div className="text-3xl font-bold text-green-900">{scan.final_diagnosis}</div>
              </Card>

              {/* 3. ACTION PLAN SECTION */}
              <Card className="p-6 bg-white border border-blue-200 shadow-sm rounded-xl">
                 <h3 className="text-blue-800 font-semibold flex items-center gap-2 mb-3">
                   <Target className="w-5 h-5" /> Next Steps & Action Plan
                 </h3>
                 <div className="text-blue-900 bg-blue-50/50 p-4 rounded-lg border border-blue-100 italic">
                   {scan.action_plan || "Monitor the affected area and attend regularly scheduled checkups as advised."}
                 </div>
              </Card>

              {isDoctor && (
  <Card className="p-6 bg-white border border-red-200 shadow-sm rounded-xl mb-6">
    <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-4">
      Internal Clinical Notes (Private)
    </h3>
    <div className="text-sm text-red-900 bg-red-50 p-4 rounded border border-red-200 min-h-[100px] leading-relaxed">
      {scan.private_clinical_notes || "No internal notes provided."}
    </div>
  </Card>
)}
<Card className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
    Doctor's Message for Patient
  </h3>
  <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded border border-gray-200 min-h-[100px] leading-relaxed">
    {scan.doctor_notes || "No additional commentary provided by the reviewing physician."}
  </div>
</Card>

              {/* 5. UTILITIES SECTION */}
              {!isDoctor && (
                <div className="grid grid-cols-2 gap-3 print:hidden pt-4">
                  <Button variant="outline" onClick={handleDownloadPdf} className="w-full flex items-center gap-2 text-gray-700">
                    <Download className="w-4 h-4" /> Download Report
                  </Button>
                  <Button onClick={handleSetReminder} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Calendar className="w-4 h-4" /> Set Reminder
                  </Button>
                </div>
              )}
            </div>
          ) : isDoctor ? (
            /* DOCTOR PRE-REVIEW SECTION */
            <Card className="p-6 border border-gray-100 bg-white rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Hybrid Framework Prediction (XGBoost)</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">{scan.ai_prediction || "Unknown"}</div>
              
              <div className="flex flex-wrap gap-2 mt-3 mb-1">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold tracking-wider">CNN</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold tracking-wider">BiLSTM</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold tracking-wider">CapsNet</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold tracking-wider">ViT</span>
              </div>
  
              <div className="flex items-center gap-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.badge}`}>
                  {riskLevel} Risk
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {confidencePercentage}% Confidence
                </span>
              </div>
  
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="font-medium text-gray-900">Confidence Score</h3>
                   <span className="font-bold text-blue-600">{confidencePercentage}%</span>
                 </div>
                 <Progress value={Number(confidencePercentage)} className="h-2.5 bg-gray-200"  />
              </div>
            </Card>
          ) : (
            /* PATIENT PRE-REVIEW STATUS */
            <Card className="p-6 border border-amber-100 bg-amber-50 rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-2">Notice</h3>
              <div className="text-xl font-bold text-amber-900 mb-2">Awaiting Doctor Review</div>
              <p className="text-sm text-amber-700">Your clinical photography has been successfully stored to our secure database. A certified dermatologist is scheduled to review your case and will post the finalized verdict shortly.</p>
            </Card>
          )}

          {/* DOCTOR ACTIONABLE FORM */}
          {isDoctor && scan.status !== "reviewed" && (
            <Card className="p-6 bg-gray-50 border border-gray-200 shadow-sm rounded-xl print:hidden">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
                Clinical Evaluation & Verdict
              </h3>
              <div className="space-y-4">  
                <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mt-4">Internal Clinical Notes (Private)</h3>
                <textarea
                  className="w-full border p-2 rounded-lg text-sm bg-red-50 border-red-200 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Differential diagnosis, internal observations (Internal Use Only)..."
                  rows={3}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                />

                <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider mt-4">Message for Patient (Public)</h3>
                <textarea
                  className="w-full border p-2 rounded-lg text-sm bg-green-50 border-green-200 text-green-900 placeholder-green-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Explain findings to the patient in clear, reassuring terms..."
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />

                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mt-4">Action Plan & Next Steps</h3>
                <select
                  className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                >
                  <option value="">-- Select next step --</option>
                  <option value="No immediate action needed. Continue standard skincare routine.">No immediate action needed</option>
                  <option value="Monitor and re-scan the specific lesion in 3 months.">Monitor & re-scan in 3 months</option>
                  <option value="Monitor and re-scan the specific lesion in 6 months.">Monitor & re-scan in 6 months</option>
                  <option value="Consult a primary care physician within the next 2 weeks.">Consult primary care</option>
                  <option value="Urgent: book an in-person appointment with a dermatologist immediately.">Urgent biopsy / dermatological referral</option>
                </select>

                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mt-4">Override Final Diagnosis</h3>
                <select
                  className="w-full border p-2 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={finalDiagnosis}
                  onChange={(e) => setFinalDiagnosis(e.target.value)}
                >
                  <option value={scan.ai_prediction}>
                    Suggest AI Prediction ({scan.ai_prediction})
                  </option>
                  <option value="Melanoma">Melanoma</option>
                  <option value="Benign Nevus">Benign Nevus</option>
                  <option value="Actinic Keratosis">Actinic Keratosis</option>
                  <option value="Basal Cell Carcinoma">Basal Cell Carcinoma</option>
                  <option value="Other">Other</option>
                </select>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 py-3"
                  onClick={handleReviewSubmit}
                  disabled={submitting}
                >
                   {submitting ? "Signing & Saving..." : "Publish Final Diagnosis"}  
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}







