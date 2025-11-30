"use client";

import { useState } from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Room } from "@/src/components/header/RoomSelector";
import { LivingRoom } from "@/src/components/rooms/LivingRoom";
import { Kitchen } from "@/src/components/rooms/Kitchen";
import { Bathroom } from "@/src/components/rooms/Bathroom";
import { Bedroom } from "@/src/components/rooms/Bedroom";
import { Backyard } from "@/src/components/rooms/Backyard";
import { Terrace } from "@/src/components/rooms/Terrace";

export default function Page() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<Room>("Living Room");

  useEffect(() => {
    // Redirect to login
    router.push("/login");
  }, [router]);

  const renderRoom = () => {
    switch (selectedRoom) {
      case "Living Room":
        return <LivingRoom />;
      case "Kitchen":
        return <Kitchen />;
      case "Bathroom":
        return <Bathroom />;
      case "Bedroom":
        return <Bedroom />;
      case "Backyard":
        return <Backyard />;
      case "Terrace":
        return <Terrace />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <p className="text-slate-400">Redirecting...</p>
    </div>
  );
}
