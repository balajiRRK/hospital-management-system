'use client';
import axios from 'axios';
import React, { useMemo, useState } from 'react';

import { useAuth } from '@/app/providers/authProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LBS_TO_KG = 0.45359237;
const IN_TO_M = 0.0254;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

function parsePoundsToKg(input: string): number | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  if (/\bkg\b|\bkilo/.test(s)) return null;

  const n = parseFloat(s.replace(/[^0-9.\-]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;

  return n * LBS_TO_KG;
}

/**
 * Accept:
 *  - 6'7"      6' 7"      6'7
 *  - 6ft 7in   6 ft 7
 *  - 6 7
 *  - 6'        6 ft
 */
function parseFeetInchesToMeters(input: string): number | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  // reject metric or inches-only unit
  if (/\bcm\b|\bm\b|\bin\b|["”]/.test(s) && !/(\d+)\s*(?:'|ft)/.test(s)) {
    return null;
  }

  const withFeetMarker =
    s.match(/^(\d+)\s*(?:'|ft)\s*(\d+)?\s*(?:in|["”])?$/); // 6'7", 6' 7, 6 ft 7 in, 6ft7
  if (withFeetMarker) {
    const feet = parseInt(withFeetMarker[1]!, 10);
    const inches = withFeetMarker[2] ? parseInt(withFeetMarker[2]!, 10) : 0;
    if (!Number.isFinite(feet) || feet <= 0) return null;
    if (!Number.isFinite(inches) || inches < 0) return null;
    const totalIn = feet * 12 + inches;
    return totalIn * IN_TO_M;
  }

  // Two numbers separated by space → treat as feet inches
  const twoNums = s.match(/^(\d+)\s+(\d+)$/);
  if (twoNums) {
    const feet = parseInt(twoNums[1]!, 10);
    const inches = parseInt(twoNums[2]!, 10);
    if (!Number.isFinite(feet) || feet <= 0) return null;
    if (!Number.isFinite(inches) || inches < 0) return null;
    return (feet * 12 + inches) * IN_TO_M;
  }

  // Feet only: "6'" or "6 ft"
  const feetOnly = s.match(/^(\d+)\s*(?:'|ft)$/);
  if (feetOnly) {
    const feet = parseInt(feetOnly[1]!, 10);
    if (!Number.isFinite(feet) || feet <= 0) return null;
    return feet * 12 * IN_TO_M;
  }

  return null;
}

function formatFeetInchesFromMeters(meters: number | null) {
  if (!meters || meters <= 0) return '—';
  const totalIn = meters / IN_TO_M;
  const feet = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return `${feet}'${inches}"`;
}

export default function HealthMetrics() {
  const { user } = useAuth();
  const [weightLbInput, setWeightLbInput] = useState('');
  const [heightFtInInput, setHeightFtInInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weightKg = useMemo(() => parsePoundsToKg(weightLbInput), [weightLbInput]);
  const heightM = useMemo(() => parseFeetInchesToMeters(heightFtInInput), [heightFtInInput]);
  const bmi = useMemo(() => {
    if (!weightKg || !heightM || heightM <= 0) return null;
    return weightKg / (heightM * heightM);
  }, [weightKg, heightM]);

  const canSubmit = !!user && !!weightKg && !!heightM && weightKg! > 0 && heightM! > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!canSubmit) {
      alert('Please enter weight in pounds and height in feet + inches.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        weight: Number(weightKg!.toFixed(3)), // kg
        height: Number(heightM!.toFixed(3)),  // meters
      };

      await api.post(`/api/users/${user.id}/health-metrics`, payload);

      alert('Health metric saved!');
      setWeightLbInput('');
      setHeightFtInInput('');
    } catch (error: any) {
      console.error('Failed to save health metric:', error?.response?.data ?? error);
      alert('Error saving health metric.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div>
        <label className="block text-sm font-medium">Weight (lb only)</label>
        <Input
          placeholder='180 or 180 lb'
          value={weightLbInput}
          onChange={(e) => setWeightLbInput(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          → {weightKg ? `${weightKg.toFixed(2)} kg` : '—'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">Height (feet & inches only)</label>
        <Input
          placeholder={`6'7", 6 ft 7 in, or 6 7`}
          value={heightFtInInput}
          onChange={(e) => setHeightFtInInput(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          → {heightM ? `${heightM.toFixed(3)} m` : '—'} ({formatFeetInchesFromMeters(heightM)})
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">BMI</label>
        <Input value={bmi ? bmi.toFixed(2) : ''} placeholder="—" disabled />
      </div>

      <Button type="submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Metric'}
      </Button>
    </form>
  );
}
