'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAuth } from '../providers/authProvider';
import HealthMetrics from './_components/health_metrics';
import PersonalInformation from './_components/personal_Information';
import PrivacySecurity from './_components/PrivacySecurity';

export default function Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading your profile…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-red-600">
          Couldn’t load your account. Please sign in and try again.
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-start justify-center pt-10">
      <Tabs defaultValue="Personal Information" className="w-[800px]">
        <TabsList className="flex w-full justify-center">
          <TabsTrigger value="Personal Information">Personal Info</TabsTrigger>
          <TabsTrigger value="Health Metrics & Records">Health Metrics</TabsTrigger>
          <TabsTrigger value="Privacy & Security">Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="Personal Information">
          <PersonalInformation />
        </TabsContent>
        <TabsContent value="Health Metrics & Records">
          <HealthMetrics />
        </TabsContent>
        <TabsContent value="Privacy & Security">
          <PrivacySecurity />
        </TabsContent>
      </Tabs>
    </div>
  );
}
