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
  const [currentMenuIndex, setCurrentMenuIndex] = useState(0);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const menuRotationRef = useRef<NodeJS.Timeout | null>(null);

  const defaultMenuImage = "/default-food.jpeg";

  // Filter only available menu items
  const activeMenuItems = menuItems.filter(
    (item) => item.available && item.enabled !== false
  );

  // Handle scrolling animation for Authentic layout
  useEffect(() => {
    if (layout !== "Authentic" || activeMenuItems.length === 0) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setScrollPosition((prev) => {
        const speed = slideSpeed / 80;
        const newPosition = prev + (speed * delta) / 16.67;
        return newPosition;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [layout, slideSpeed, activeMenuItems.length]);

  // Handle menu item rotation for Advanced layout
  useEffect(() => {
    if (layout === "Advanced" && activeMenuItems.length > 1) {
      if (menuRotationRef.current) clearInterval(menuRotationRef.current);

      menuRotationRef.current = setInterval(() => {
        setCurrentMenuIndex((prev) => (prev + 1) % activeMenuItems.length);
      }, menuRotationSpeed);

      return () => {
        if (menuRotationRef.current) clearInterval(menuRotationRef.current);
      };
    }
  }, [layout, activeMenuItems.length, menuRotationSpeed]);

  const getCurrentMenuItem = () => {
    if (layout === "Advanced" && activeMenuItems.length > 0) {
      return activeMenuItems[currentMenuIndex];
    }
    return activeMenuItems[0];
  };

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

  // Render Authentic layout (scrolling carousel)
  const renderAuthenticLayout = () => {
    if (activeMenuItems.length === 0) {
      return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl h-full flex flex-col">
          <div className="bg-black/30 backdrop-blur-sm px-6 py-4 border-b border-white/10">
            <h2
              className="text-3xl font-bold text-center"
              style={{ color: primaryColor }}
            >
              Today's Menu
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400 py-12">
              <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl">No menu items available</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl h-full flex flex-col">
        <div className="bg-black/30 backdrop-blur-sm px-6 py-4 border-b border-white/10">
          <h2
            className="text-3xl font-bold text-center"
            style={{ color: primaryColor }}
          >
            Today's Menu
          </h2>
        </div>

        <div
          className="flex-1 relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
          }}
        >
          <div
            className="absolute z-10 w-full px-6"
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
            className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-20"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-center h-full">
      {renderAuthenticLayout()}
    </div>
  );
}

// Menu Item Card Component for Authentic layout
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
    <div className="mb-4" style={{ height: `${itemHeight}px` }}>
      <div
        className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 border transition-all duration-300 h-full hover:scale-[1.02] ${
          item.isSpecial
            ? "border-amber-400/50 shadow-lg shadow-amber-400/20"
            : "border-white/10"
        }`}
      >
        <div className="flex gap-4 h-full">
          {item.image && (
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden">
                <img
                  src={item.image || defaultMenuImage}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultMenuImage;
                  }}
                />
                {item.isSpecial && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-2xl font-bold text-white">{item.name}</h3>
              <span
                className="text-2xl font-bold whitespace-nowrap ml-2"
                style={{ color: primaryColor }}
              >
                {item.price}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-2 line-clamp-2">
              {item.description}
            </p>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium self-start"
              style={{
                backgroundColor: accentColor + "30",
                color: accentColor,
              }}
            >
              {item.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuCarousel;
