export const MOCK_USERS = [
  {
    id: "p1",
    name: "Jane Doe",
    email: "patient@dermai.com",
    password: "password",
    role: "patient",
    avatar: "https://i.pravatar.cc/150?u=jane",
    history: []
  },
  {
    id: "d1",
    name: "Dr. Smith",
    email: "doctor@dermai.com",
    password: "password",
    role: "doctor",
    avatar: "https://i.pravatar.cc/150?u=smith",
    specialization: "Dermatologist"
  },
  {
    id: "a1",
    name: "Admin System",
    email: "admin@dermai.com",
    password: "password",
    role: "admin",
    avatar: "https://i.pravatar.cc/150?u=admin"
  }
];

export const MOCK_PATIENTS = [
  { id: "p1", name: "Jane Doe", age: 34, lastScan: "2026-03-20", risk: "Medium" },
  { id: "p2", name: "Robert Chase", age: 45, lastScan: "2026-04-01", risk: "Low" },
  { id: "p3", name: "Emily Clark", age: 28, lastScan: "2026-04-02", risk: "High" }
];

export const MOCK_RESULTS = [
  {
    id: "r1",
    patientId: "p1",
    date: "2026-03-20",
    disease: "Actinic Keratoses",
    confidence: 88.5,
    status: "Reviewed",
    explanation: "Grad-CAM highlighted irregular border textures characteristic of actinic keratoses.",
    progression: "Low risk of immediate progression.",
    image: "https://images.unsplash.com/photo-1612441804231-77a36b284856?auto=format&fit=crop&w=600&q=80",
    heatmap: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80" 
  },
  {
    id: "r2",
    patientId: "p1",
    date: "2026-04-05",
    disease: "Melanoma (Predicted)",
    confidence: 94.2,
    status: "Pending Review",
    explanation: "Strong activation in the center of the lesion indicates high asymmetrical pigmentation.",
    progression: "High risk. Immediate biopsy recommended.",
    image: "https://images.unsplash.com/photo-1612441804231-77a36b284856?auto=format&fit=crop&w=600&q=80",
    heatmap: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80"
  }
];

export const MOCK_STATS = {
  admin: {
    totalUsers: 1432,
    totalScans: 8520,
    modelAccuracy: 95.4,
    activeSessions: 42
  },
  doctor: {
    totalPatients: 145,
    pendingReviews: 12,
    recentCases: 8
  }
};
