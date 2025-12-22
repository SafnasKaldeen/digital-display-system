"use client";
import React, { useEffect, useRef, useState } from "react";
import { UtensilsCrossed } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  available: boolean;
  isSpecial?: boolean;
  enabled?: boolean;
}

interface MenuCarouselProps {
  menuItems: MenuItem[];
  layout: "Authentic" | "Advanced";
  slideSpeed?: number;
  menuRotationSpeed?: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function MenuCarousel({
  menuItems = [],
  layout = "Authentic",
  slideSpeed = 20,
  menuRotationSpeed = 6000,
  primaryColor,
  secondaryColor,
  accentColor,
}: MenuCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultMenuImage = "/default-food.jpeg";

  // Filter only available menu items
  const activeMenuItems = menuItems.filter(
    (item) => item.available && item.enabled !== false
  );

  // Handle menu item rotation based on menuRotationSpeed
  useEffect(() => {
    if (activeMenuItems.length === 0) return;

    // Clear any existing timer
    if (rotationTimerRef.current) {
      clearTimeout(rotationTimerRef.current);
    }

    // Set up rotation timer
    rotationTimerRef.current = setTimeout(() => {
      setIsTransitioning(true);

      // After transition animation starts, update index
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activeMenuItems.length);
        setIsTransitioning(false);
      }, 500); // Half second for transition effect
    }, menuRotationSpeed);

    return () => {
      if (rotationTimerRef.current) {
        clearTimeout(rotationTimerRef.current);
      }
    };
  }, [currentIndex, activeMenuItems.length, menuRotationSpeed]);

  // Get current menu item
  const currentItem = activeMenuItems[currentIndex];

  if (activeMenuItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="relative flex-1 overflow-hidden rounded-3xl shadow-2xl border-2 bg-slate-800/50 flex items-center justify-center">
          <div className="text-center text-gray-400 py-12">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No menu items available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        className="relative flex-1 overflow-hidden rounded-3xl shadow-2xl border-2"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(20px)",
          borderColor: `${accentColor}40`,
        }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/30 backdrop-blur-sm px-6 py-4 border-b border-white/10 z-30">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>
              Today's Menu
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">
                {currentIndex + 1} / {activeMenuItems.length}
              </span>
              <div className="flex gap-1">
                {activeMenuItems.map((_, idx) => (
                  <div
                    key={idx}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        idx === currentIndex
                          ? accentColor
                          : "rgba(255,255,255,0.3)",
                      transform:
                        idx === currentIndex ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-24 left-0 right-0 bottom-0 flex items-center justify-center px-8">
          <div
            className={`w-full transition-all duration-500 ${
              isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {currentItem && (
              <MenuItemCard
                item={currentItem}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                accentColor={accentColor}
                defaultMenuImage={defaultMenuImage}
              />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50 z-30">
          <div
            className="h-full transition-all"
            style={{
              backgroundColor: accentColor,
              width: isTransitioning ? "100%" : "0%",
              animation: `progressBar ${menuRotationSpeed}ms linear`,
            }}
          />
        </div>

        {/* Gradient overlays */}
        <div
          className="absolute top-24 left-0 right-0 h-20 pointer-events-none z-20"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progressBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Menu Item Card Component
function MenuItemCard({
  item,
  primaryColor,
  secondaryColor,
  accentColor,
  defaultMenuImage,
}: {
  item: MenuItem;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultMenuImage: string;
}) {
  return (
    <div
      className="rounded-3xl p-8 shadow-2xl border-2 backdrop-blur-md"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
        borderColor: `${accentColor}60`,
      }}
    >
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Menu Item Image */}
        {item.image && (
          <div className="relative flex-shrink-0">
            <div className="relative w-72 h-72 rounded-3xl overflow-hidden shadow-2xl">
              <div
                className="absolute inset-0 opacity-60 blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              />

              <img
                src={item.image || defaultMenuImage}
                alt={item.name}
                className="relative w-full h-full object-cover rounded-3xl border-4 border-white/40"
                onError={(e) => {
                  e.currentTarget.src = defaultMenuImage;
                }}
              />

              <div
                className="absolute inset-0 rounded-3xl opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              />

              {/* Special Badge */}
              {item.isSpecial && (
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  ⭐ SPECIAL
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu Item Details */}
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-3 h-16 rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 20px ${accentColor}`,
                  }}
                />
                <h3
                  className="text-5xl font-black tracking-tight leading-tight"
                  style={{
                    color: "white",
                    textShadow: `0 4px 30px ${accentColor}80`,
                  }}
                >
                  {item.name}
                </h3>
              </div>
              <span
                className="text-5xl font-bold whitespace-nowrap"
                style={{
                  color: primaryColor,
                  textShadow: `0 2px 15px ${primaryColor}60`,
                }}
              >
                {item.price}
              </span>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p
              className="text-2xl font-medium leading-relaxed"
              style={{
                color: `${secondaryColor}EE`,
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {item.description}
            </p>
          )}

          {/* Category Badge */}
          {item.category && (
            <div className="flex items-center gap-4 pt-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: accentColor,
                }}
              >
                <span className="text-white text-2xl">🍽️</span>
              </div>
              <span
                className="px-6 py-2 rounded-full text-lg font-bold shadow-lg"
                style={{
                  backgroundColor: `${accentColor}40`,
                  color: accentColor,
                  border: `2px solid ${accentColor}80`,
                }}
              >
                {item.category}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <div
              className="flex-1 h-1 rounded-full opacity-40"
              style={{
                backgroundColor: accentColor,
              }}
            />
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 15px ${accentColor}`,
              }}
            />
            <div
              className="flex-1 h-1 rounded-full opacity-40"
              style={{
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuCarousel;
