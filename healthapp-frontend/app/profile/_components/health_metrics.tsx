'use client';
import axios from 'axios';
import React, { useState } from 'react';

import { useAuth } from '@/app/providers/authProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LBS_TO_KG = 0.453592;

export default function HealthMetrics() {
  const { user } = useAuth();
  const [weightLbs, setWeightLbs] = useState('');
  const [heightM, setHeightM] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const payload = {
        weight: parseFloat(weightLbs) * LBS_TO_KG,
        height: parseFloat(heightM),
      };
      const base = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${base}/api/users/${user.id}/health-metrics`, payload);
      alert('Health metric saved!');
      setWeightLbs('');
      setHeightM('');
    } catch (error) {
      console.error('Failed to save health metric:', error);
      alert('Error saving health metric.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
      <div>
        <label className="block text-sm font-medium">Weight (lbs)</label>
        <Input type="number" step="0.1" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">Height (m)</label>
        <Input type="number" step="0.01" value={heightM} onChange={(e) => setHeightM(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium">BMI</label>
        <Input type="number" step="0.01" disabled/>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Metric'}
      </Button>
    </form>
  );
}
