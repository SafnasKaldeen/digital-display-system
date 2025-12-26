import { MasjidDisplay } from "@/components/displays/public/masjid-display";
import { HospitalDisplay } from "@/components/displays/public/hospital-display";
import { CorporateDisplay } from "@/components/displays/public/corporate-display";
import { RestaurantDisplay } from "@/components/displays/public/restaurant-display";

interface DisplayPageProps {
  params: {
    slug: string;
  };
}

// Mock function to fetch display config
async function getDisplayConfig(slug: string) {
  // TODO: Fetch from database using slug
  const mockConfigs: Record<string, any> = {
    "main-hall-123": {
      templateType: "masjid",
      prayerTimes: {
        fajr: "05:30",
        dhuhr: "12:30",
        asr: "15:45",
        maghrib: "18:00",
        isha: "19:30",
      },
      announcements: ["Jumu'ah at 1:30 PM - Please arrive early"],
      hijriDateEnabled: true,
      colorTheme: { primary: "#f97316" },
    },
    "emerg-dept-456": {
      templateType: "hospital",
      doctorSchedules: [
        {
          name: "Dr. Ahmed",
          specialty: "Emergency",
          time: "09:00",
          room: "A1",
        },
        {
          name: "Dr. Fatima",
          specialty: "Surgery",
          time: "10:00",
          room: "B2",
        },
      ],
      emergencyContact: "911",
      departmentInfo: "Emergency Department",
    },
    "lobby-789": {
      templateType: "corporate",
      meetingRooms: [
        {
          room: "Conference A",
          schedule: "09:00 - 10:00",
          status: "Available",
        },
        { room: "Conference B", schedule: "10:00 - 11:30", status: "Booked" },
        { room: "Board Room", schedule: "14:00 - 15:00", status: "Available" },
      ],
      kpiMetrics: { revenue: "$1.2M", growth: "+15%" },
    },
  };

  return mockConfigs[slug] || null;
}

export default async function DisplayPage({ params }: DisplayPageProps) {
  const config = await getDisplayConfig(params.slug);

  if (!config) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Display Not Found</h1>
          <p className="text-slate-400">
            The display you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      {config.templateType === "masjid" && <MasjidDisplay config={config} />}
      {config.templateType === "hospital" && (
        <HospitalDisplay config={config} />
      )}
      {config.templateType === "restaurant" && (
        <RestaurantDisplay config={config} />
      )}
      {config.templateType === "corporate" && (
        <CorporateDisplay config={config} />
      )}

      {/* Meta refresh for auto-update every 24 hours */}
      <meta httpEquiv="refresh" content="86400" />
    </div>
  );
}
