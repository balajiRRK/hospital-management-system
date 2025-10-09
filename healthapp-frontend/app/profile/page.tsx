import HealthMetrics from '@/app/profile/_components/health_metrics';
import PersonalInformation from '@/app/profile/_components/personal_Information';
import PrivacySecurity from '@/app/profile/_components/PrivacySecurity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Page() {
  return (
    <>
      {/* TODO: take borders out, it help me to understand what is going on with the CSS*/}
      <div className="flex h-full w-full items-start justify-center border pt-10">
        <Tabs defaultValue="Personal Information" className="w-[500px]">
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
    </>
  );
}
