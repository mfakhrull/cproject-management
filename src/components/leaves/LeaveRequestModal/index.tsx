"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaveSubmitted: () => void;
  employeeId: string; //  Added employeeId to props
}

export const LeaveRequestModal = ({ isOpen, onClose, onLeaveSubmitted, employeeId }: LeaveRequestModalProps) => {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/leaves/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId, //  Pass dynamic employeeId
          ...formData,
        }),
      });
      onLeaveSubmitted();
      onClose();
    } catch (error) {
      console.error("Error submitting leave request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4">Request Leave</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Leave Type</label>
            <select name="leaveType" required onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Select</option>
              <option value="Sick">Sick</option>
              <option value="Vacation">Vacation</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label>Start Date</label>
            <input type="date" name="startDate" required onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>End Date</label>
            <input type="date" name="endDate" required onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Reason</label>
            <textarea 
              name="reason" 
              required 
              onChange={handleChange} 
              className="w-full p-2 border rounded" 
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
