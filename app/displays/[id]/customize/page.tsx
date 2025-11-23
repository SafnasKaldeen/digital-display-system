import { CustomizePageClient } from "@/components/customization/customize-page-client";

interface DisplayCustomization {
  template: string;
  layout: string;
  prayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  iqamahOffsets: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
  backgroundType: "solid" | "gradient" | "image" | "slideshow";
  backgroundColor: string;
  backgroundImage: string[];
  slideshowDuration: number;
  announcements: Array<{ text: string; duration: number }>;
  showHijriDate: boolean;
  font: string;
}

export default async function CustomizePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CustomizePageClient displayId={id} />;
}
