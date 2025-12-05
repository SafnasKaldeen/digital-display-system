"use client";

import {
  LayoutGrid,
  Building2,
  Hospital,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
} from "lucide-react";

const templates = [
  { id: "All Screens", icon: LayoutGrid, show: true },
  { id: "Masjid Screens", icon: Building2, show: true },
  { id: "Hospital Screens", icon: Hospital, show: true },
  { id: "Restaurant Screens", icon: UtensilsCrossed, show: false },
  { id: "Retail Screens", icon: ShoppingBag, show: false },
  { id: "Corporate Screens", icon: Briefcase, show: false },
] as const;

export type Room = (typeof templates)[number]["id"];

interface RoomSelectorProps {
  selectedRoom: Room;
  onRoomChange: (room: Room) => void;
}

export function RoomSelector({
  selectedRoom,
  onRoomChange,
}: RoomSelectorProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto w-full scrollbar-hide">
      {templates.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onRoomChange(id)}
          className={`min-w-[42px] h-9 px-2.5 md:px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 touch-manipulation ${
            id === selectedRoom
              ? "bg-white text-gray-900"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }
               ${
                 !templates.find((template) => template.id === id)?.show
                   ? "opacity-40 cursor-not-allowed hover:bg-gray-800"
                   : ""
               }`}
        >
          <Icon size={16} className="flex-shrink-0" />
          <span className="hidden sm:inline">{id}</span>
        </button>
      ))}
    </div>
  );
}
