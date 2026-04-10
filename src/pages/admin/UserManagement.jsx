import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse p-6">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
      ))}
    </div>
  </div>
);

const statusStyles = {
  Active: "bg-green-100 text-green-800",
  Suspended: "bg-red-100 text-red-800",
  pending: "bg-amber-100 text-amber-800"
};

export default function UserManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("dermai_user") || "{}").id;
        const res = await axios.get("http://localhost:3000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mappedUsers = res.data.map(u => ({ ...u, status: u.status || "Active" }));
        setUsers(mappedUsers);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleUserStatus = (id) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto pb-12"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage system access for doctors, patients, and staff.</p>
      </div>

      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        {isLoading ? (
          <SkeletonLoader />
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-900">{u.full_name || "N/A"}</td>
                    <td className="py-4 text-gray-500">{u.email}</td>
                    <td className="py-4 text-gray-500 capitalize">{u.role}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyles[u.status] || statusStyles.Suspended}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      {u.status === "Active" ? (
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => toggleUserStatus(u.id)}>
                          Suspend
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200" onClick={() => toggleUserStatus(u.id)}>
                          Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-500 bg-gray-50 border-t border-dashed border-gray-200">
            No records to display.
          </div>
        )}
      </Card>
    </motion.div>
  );
}
