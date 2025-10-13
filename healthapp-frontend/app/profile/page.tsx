'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import HealthMetrics from '@/app/profile/_components/health_metrics';
import PersonalInformation from '@/app/profile/_components/personal_Information';
import PrivacySecurity from '@/app/profile/_components/PrivacySecurity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type MeResponse = {
  id: number;
  email: string;
  authorities: string[];
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default function Page() {
  const [userId, setUserId] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus('loading');
        const res = await api.get<MeResponse>('/api/me');
        if (!cancelled) {
          setUserId(res.data.id);
          setStatus('idle');
        }
      } catch (e) {
        console.error('Failed to fetch /api/me:', e);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading your profile…</div>
      </div>
    );
  }

  if (status === 'error' || userId == null) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-red-600">
          Couldn’t load your account. Please sign in and try again.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* TODO: take borders out; they’re helpful for visualizing layout during build */}
      <div className="flex h-full w-full items-start justify-center border pt-10">
        <Tabs defaultValue="Personal Information" className="w-[800px]">
          <TabsList className="flex w-full justify-center">
            <TabsTrigger value="Personal Information">Personal Info</TabsTrigger>
            <TabsTrigger value="Health Metrics & Records">Health Metrics</TabsTrigger>
            <TabsTrigger value="Privacy & Security">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="Personal Information">
            <PersonalInformation userId={userId} />
          </TabsContent>

          <TabsContent value="Health Metrics & Records">
            <HealthMetrics userId={userId} />
          </TabsContent>

          <TabsContent value="Privacy & Security">
            <PrivacySecurity userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
