import React, { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';

const ScanContext = createContext();

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('dermai_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        config.headers.Authorization = `Bearer ${user.id}`;
      }
    } catch(e){}
  }
  return config;
});

export function ScanProvider({ children }) {
  const [patientHistory, setPatientHistory] = useState([]);
  const [doctorQueue, setDoctorQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatientHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/scans/my-history');
      setPatientHistory(res.data);
      setError(null);
    } catch (err) {
      console.error("fetchPatientHistory Error:", err);
      setError('Failed to fetch scan history.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/doctor/scans');
      setDoctorQueue(res.data);
      setError(null);
    } catch (err) {
      console.error("fetchDoctorQueue Error:", err);
      setError('Failed to fetch doctor queue.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadScan = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/scans/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Prepend the new scan dynamically
      setPatientHistory(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("uploadScan Error:", err);
      setError(err.response?.data?.error || 'Failed to submit scan to ML service.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getScanById = async (id) => {
    try {
      const res = await api.get(`/scans/${id}`);
      return res.data;
    } catch (err) {
      console.error('Failed to get scan by id:', err);
      return null;
    }
  };

  const reviewScan = async (id, reviewData) => {
    setIsLoading(true);
    try {
      const res = await api.put(`/scans/${id}/review`, reviewData);
      setDoctorQueue(prev => prev.filter(scan => scan.id !== id));
      return res.data;
    } catch (err) {
      console.error("reviewScan Error:", err);
      setError(err.response?.data?.error || 'Failed to submit review.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScanContext.Provider value={{ 
      patientHistory, 
      doctorQueue, 
      isLoading, 
      error, 
      fetchPatientHistory, 
      fetchDoctorQueue, 
      uploadScan, 
      reviewScan,
      getScanById
    }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScans() {
  return useContext(ScanContext);
}
