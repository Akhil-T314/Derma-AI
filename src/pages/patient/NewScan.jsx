import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";

export default function NewScan() {
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(URL.createObjectURL(uploadedFile));
      setResult(null);
    }
  };

  const startScan = () => {
    if (!file) return;
    setIsScanning(true);
    setProgress(0);
    
    // Simulate AI scanning process
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setResult({
            prediction: "Melanoma",
            confidence: 89,
            riskLevel: "High",
            recommendation: "Immediate clinical review recommended."
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const resetScan = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Skin Lesion Analysis</h1>
        <p className="text-gray-500 mt-1">Upload a clear image of the skin condition for preliminary AI screening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Image</h2>
          
          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleUpload} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img src={file} alt="Lesion preview" className="w-full h-full object-cover" />
              </div>
              
              {!isScanning && !result && (
                <div className="flex space-x-3">
                  <Button onClick={startScan} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
                    Analyze Image
                  </Button>
                  <Button onClick={resetScan} variant="outline" className="flex-1 py-2 rounded-md border-gray-300">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {isScanning && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>Analyzing lesion features...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-blue-100" />
            </div>
          )}
        </Card>

        {/* Results Section */}
        <Card className={`p-6 bg-white border shadow-sm rounded-xl transition-all duration-300 ${result ? 'border-gray-200' : 'border-dashed border-gray-200 opacity-50'}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
          
          {!result ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <CheckCircle className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">Results will appear here after analysis</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-4 rounded-lg flex items-start space-x-3 ${result.riskLevel === 'High' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider">Primary Prediction</h3>
                  <p className="text-2xl font-bold mt-1">{result.prediction}</p>
                  <p className="text-sm mt-1 opacity-90">{result.recommendation}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">AI Confidence Score</span>
                    <span className="font-bold text-gray-900">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-2 bg-gray-100" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex space-x-3">
                <Button className="flex-1 bg-gray-900 hover:bg-black text-white py-2 rounded-md shadow-sm">
                  Send to Doctor
                </Button>
                <Button onClick={resetScan} variant="outline" className="flex-none px-4 py-2 rounded-md border-gray-300">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
