'use client';
import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/app/providers/authProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LBS_TO_KG = 0.45359237;
const IN_TO_M = 0.0254;

type HealthMetric = {
  id?: number | string;
  weight: number;
  height: number;
  bmi?: number | null;
  recordedAt?: string | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

//Functions

function parsePoundsToKg(input: string): number | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  // Prevent user from entering "kg" explicitly
  if (/\bkg\b|\bkilo/.test(s)) return null;

  const n = parseFloat(s.replace(/[^0-9.\-]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;

  return n * LBS_TO_KG;
}

function parseFeetInchesToMeters(input: string): number | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  //Strict Metric/Inches rejection to avoid confusion
  if (/\bcm\b|\bm\b|\bin\b|["”]/.test(s) && !/(\d+)\s*(?:'|ft)/.test(s)) {
    return null;
  }

  // Format: 6' 7" | 6ft 7in | 6'7
  const explicitPattern = /^(\d+)\s*(?:'|ft)\s*(\d+)?(?:\s*(?:in|["”]))?$/;
  const matchExplicit = s.match(explicitPattern);

  if (matchExplicit) {
    const feet = parseInt(matchExplicit[1]!, 10);
    const inches = matchExplicit[2] ? parseInt(matchExplicit[2]!, 10) : 0;
    
    if (feet <= 0) return null;
    return (feet * 12 + inches) * IN_TO_M;
  }

  //Format: 6 2 (Two numbers separated by space)
  const spacePattern = /^(\d+)\s+(\d+)$/;
  const matchSpace = s.match(spacePattern);
  
  if (matchSpace) {
    const feet = parseInt(matchSpace[1]!, 10);
    const inches = parseInt(matchSpace[2]!, 10);
    
    if (feet <= 0) return null;
    return (feet * 12 + inches) * IN_TO_M;
  }

  return null;
}

function formatFeetInchesFromMeters(meters: number | null) {
  if (!meters || meters <= 0) return '—';
  const totalIn = meters / IN_TO_M;
  let feet = Math.floor(totalIn / 12);
  let inches = Math.round(totalIn % 12);

  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  return `${feet} ft ${inches} in`;
}

function formatPoundsFromKg(kg: number | null | undefined) {
  if (!kg || kg <= 0) return '—';
  return `${(kg / LBS_TO_KG).toFixed(1)} lb`;
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Unknown Date';
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function friendlyError(err: any, fallback: string) {
  const status = err?.response?.status;
  if (status === 401) return 'Please sign in again to view your metrics.';
  if (status === 403) return 'You are not allowed to view these metrics.';
  return fallback;
}

export default function HealthMetrics() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Inputs
  const [weightLbInput, setWeightLbInput] = useState('');
  const [heightFtInInput, setHeightFtInInput] = useState('');
  
  // State
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const weightKg = useMemo(() => parsePoundsToKg(weightLbInput), [weightLbInput]);
  const heightM = useMemo(() => parseFeetInchesToMeters(heightFtInInput), [heightFtInInput]);
  
  const bmi = useMemo(() => {
    if (!weightKg || !heightM || heightM <= 0) return null;
    return weightKg / (heightM * heightM);
  }, [weightKg, heightM]);

  const canSubmit = !!user && !!weightKg && !!heightM && weightKg > 0 && heightM > 0;


  const loadMetrics = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Backend returns List<HealthMetric>
      const res = await api.get<HealthMetric[]>(`/api/users/${userId}/health-metrics`);
      setMetrics(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch metrics:', err);
      setError(friendlyError(err, 'Could not load history.'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Matches your HealthMetricDto fields
      const payload = {
        weight: Number(weightKg!.toFixed(3)), 
        height: Number(heightM!.toFixed(3)), 
      };

      await api.post(`/api/users/${userId}/health-metrics`, payload);

      // Clear inputs
      setWeightLbInput('');
      setHeightFtInInput('');
      
      // Refresh list to see the new entry (sorted by recordedAt desc from backend)
      await loadMetrics();
      
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(friendlyError(err, 'Failed to save metric.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setMetrics([]);
      setError(null);
      return;
    }
    loadMetrics();
  }, [userId, loadMetrics]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4 shadow-sm bg-card">
        <h2 className="text-lg font-semibold">New Entry</h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Weight (lb)</label>
            <Input
              placeholder="e.g. 180"
              value={weightLbInput}
              onChange={(e) => setWeightLbInput(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground min-h-[1.5em]">
              {weightKg ? `≈ ${weightKg.toFixed(2)} kg` : ''}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height (ft & in)</label>
            <Input
              placeholder="e.g. 6'2 or 6 2"
              value={heightFtInInput}
              onChange={(e) => setHeightFtInInput(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground min-h-[1.5em]">
              {heightM ? `≈ ${formatFeetInchesFromMeters(heightM)} (${heightM.toFixed(2)}m)` : ''}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Calculated BMI</label>
          <Input 
            value={bmi ? bmi.toFixed(2) : '—'} 
            disabled 
            className={bmi && bmi > 25 ? 'text-orange-600 font-medium' : ''} 
          />
        </div>

        <div className="pt-2">
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <Button type="submit" disabled={!canSubmit || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Saving...' : 'Save Metric'}
            </Button>
        </div>
      </form>

      <div className="space-y-2 rounded-lg border p-4 shadow-sm bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">History</h3>
          {isLoading && <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>}
        </div>

        {!isLoading && metrics.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No metrics recorded yet.</p>
        )}

        <ul className="divide-y">
          {metrics.map((metric, idx) => {
            return (
              <li key={metric.id || idx} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-base">
                    {formatPoundsFromKg(metric.weight)} 
                    <span className="mx-2 text-muted-foreground">/</span>
                    {formatFeetInchesFromMeters(metric.height)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    BMI: {metric.bmi?.toFixed(1) ?? '—'}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {formatDateTime(metric.recordedAt)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
