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
  const [scrollPosition, setScrollPosition] = useState(0);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const defaultMenuImage = "/default-food.jpeg";

  // Filter only available menu items
  const activeMenuItems = menuItems.filter(
    (item) => item.available && item.enabled !== false
  );

  // Handle vertical scrolling animation
  useEffect(() => {
    if (activeMenuItems.length === 0) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setScrollPosition((prev) => {
        // Convert slideSpeed (1-100) to pixels per frame
        const speed = slideSpeed / 10000;
        const newPosition = prev + (speed * delta) / 16.67;
        return newPosition;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [slideSpeed, activeMenuItems.length]);

  // Duplicate items for seamless loop
  const duplicatedMenuItems = [
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
    ...activeMenuItems,
  ];

  const itemHeight = 180;
  const totalHeight = activeMenuItems.length * itemHeight;

  // Render vertical scrolling marquee
  const renderMarquee = () => {
    if (activeMenuItems.length === 0) {
      return (
        <div className="relative flex-1 overflow-hidden rounded-3xl shadow-2xl border-2 bg-slate-800/50 flex items-center justify-center">
          <div className="text-center text-gray-400 py-12">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No menu items available</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative flex-1 overflow-hidden rounded-3xl shadow-2xl border-2"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(20px)",
          borderColor: `${accentColor}40`,
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
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
          <h2
            className="text-3xl font-bold text-center"
            style={{ color: primaryColor }}
          >
            Today's Menu
          </h2>
        </div>

        {/* Scrolling content */}
        <div
          className="absolute top-20 left-0 right-0 bottom-0 z-10 w-full px-6"
          style={{
            transform: `translateY(-${scrollPosition % (totalHeight * 3)}px)`,
            willChange: "transform",
          }}
        >
          {duplicatedMenuItems.map((item, index) => (
            <MenuItemCard
              key={`${item.id}-${index}`}
              item={item}
              itemHeight={itemHeight}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              defaultMenuImage={defaultMenuImage}
            />
          ))}
        </div>

        {/* Gradient overlays for fade effect */}
        <div
          className="absolute top-20 left-0 right-0 h-20 pointer-events-none z-20"
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
        <div
          className="absolute top-0 left-0 bottom-0 w-16 pointer-events-none z-20"
          style={{
            background: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute top-0 right-0 bottom-0 w-16 pointer-events-none z-20"
          style={{
            background: `linear-gradient(to left, rgba(0,0,0,0.9) 0%, transparent 100%)`,
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {renderMarquee()}
    </div>
  );
}

// Menu Item Card Component
function MenuItemCard({
  item,
  itemHeight,
  primaryColor,
  secondaryColor,
  accentColor,
  defaultMenuImage,
}: {
  item: MenuItem;
  itemHeight: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultMenuImage: string;
}) {
  return (
    <div className="mb-5" style={{ height: `${itemHeight}px` }}>
      <div
        className="h-full rounded-2xl p-5 shadow-xl border-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
          borderColor: `${accentColor}60`,
        }}
      >
        <div className="flex items-center h-full gap-6">
          {/* Menu Item Image */}
          {item.image && (
            <div className="relative flex-shrink-0">
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div
                  className="absolute inset-0 opacity-60 blur-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />

                <img
                  src={item.image || defaultMenuImage}
                  alt={item.name}
                  className="relative w-full h-full object-cover rounded-2xl border-4 border-white/40 group-hover:border-white/60 transition-all duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = defaultMenuImage;
                  }}
                />

                <div
                  className="absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />

                {/* Special Badge */}
                {item.isSpecial && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ SPECIAL
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Menu Item Details */}
          <div className="flex-1 space-y-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-10 rounded-full"
                    style={{
                      backgroundColor: accentColor,
                      boxShadow: `0 0 15px ${accentColor}`,
                    }}
                  />
                  <p
                    className="text-3xl font-black tracking-tight leading-tight"
                    style={{
                      color: "white",
                      textShadow: `0 3px 20px ${accentColor}80`,
                    }}
                  >
                    {item.name}
                  </p>
                </div>
                <span
                  className="text-3xl font-bold whitespace-nowrap"
                  style={{
                    color: primaryColor,
                    textShadow: `0 2px 10px ${primaryColor}60`,
                  }}
                >
                  {item.price}
                </span>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p
                className="text-lg font-medium line-clamp-2"
                style={{
                  color: `${secondaryColor}EE`,
                  textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              >
                {item.description}
              </p>
            )}

            {/* Category Badge */}
            {item.category && (
              <div className="flex items-center gap-3 pt-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: accentColor,
                  }}
                >
                  <span className="text-white text-lg">🍽️</span>
                </div>
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-bold shadow-lg"
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
            <div className="flex items-center gap-2 pt-1">
              <div
                className="flex-1 h-0.5 rounded-full opacity-40"
                style={{
                  backgroundColor: accentColor,
                }}
              />
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 10px ${accentColor}`,
                }}
              />
              <div
                className="flex-1 h-0.5 rounded-full opacity-40"
                style={{
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuCarousel;
