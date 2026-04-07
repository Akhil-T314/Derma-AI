import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Activity, Eye, ShieldCheck } from "lucide-react";
import { Card } from "../../components/ui/card";

const scanData = [
  { name: 'Mon', scans: 40 },
  { name: 'Tue', scans: 55 },
  { name: 'Wed', scans: 45 },
  { name: 'Thu', scans: 70 },
  { name: 'Fri', scans: 65 },
  { name: 'Sat', scans: 30 },
  { name: 'Sun', scans: 25 },
];

const modelAccuracy = [
  { name: 'Melanoma', accuracy: 94 },
  { name: 'Nevus', accuracy: 98 },
  { name: 'Basal Cell', accuracy: 91 },
  { name: 'Actinic', accuracy: 89 },
];

export default function AdminDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-gray-500 mt-1">Monitor platform usage and AI diagnostic performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">1,248</span>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Scans Processed</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Activity className="w-5 h-5" /></div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">8,542</span>
            <span className="text-sm font-medium text-green-600">+24%</span>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Avg. Model Accuracy</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">93.8%</span>
            <span className="text-sm font-medium text-green-600">+0.4%</span>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Active Clinicians</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Eye className="w-5 h-5" /></div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">142</span>
            <span className="text-sm font-medium text-gray-500">Stable</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Line Chart */}
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Scan Volume</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scanData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{stroke: '#E5E7EB', strokeWidth: 2}}
                />
                <Line type="monotone" dataKey="scans" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart */}
        <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Model Accuracy by Class</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelAccuracy} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#374151', fontWeight: 500}} width={80} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="accuracy" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
