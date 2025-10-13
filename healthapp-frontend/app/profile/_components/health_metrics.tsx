'use client';
import axios from "axios";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HealthMetricFormProps {
  userId: number;
}

interface HealthMetricDto {
  weight: number | "";
  height: number | "";
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default function HealthMetricForm({ userId }: HealthMetricFormProps) {
  const [metrics, setMetrics] = useState<HealthMetricDto>({ weight: "", height: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseFloat(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/users/${userId}/health-metrics`, metrics, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Health metric saved!");
      setMetrics({ weight: "", height: "" }); // reset form
    } catch (error) {
      console.error("Failed to save health metric:", error);
      alert("Error saving health metric.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
      <div>
        <label className="block text-sm font-medium">Weight (lbs)</label>
        <Input
          type="number"
          step="0.1"
          name="weight"
          value={metrics.weight}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Height (m)</label>
        <Input
          type="number"
          step="0.01"
          name="height"
          value={metrics.height}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">Save Metric</Button>
    </form>
  );
}
