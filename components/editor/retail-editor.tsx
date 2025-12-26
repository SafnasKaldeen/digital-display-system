"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import CollapsibleSection from "./CollapsibleSection";
import { AdvertisementEditor } from "./AdvertisementEditor";

interface RetailEditorProps {
  config: any;
  onConfigChange: (config: any) => void;
  displayId: string;
  displayName: string;
  templateType: string;
  userId?: string;
  environment?: "preview" | "production";
}

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  available: boolean;
  isSpecial?: boolean;
}

export function RetailEditor({
  displayId,
  displayName,
  templateType,
  config,
  onConfigChange,
  userId,
  environment = "preview",
}: RetailEditorProps) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    userId
  );
  const [newCategory, setNewCategory] = useState("");

  // Fetch user ID if not provided
  useEffect(() => {
    const fetchUserId = async () => {
      if (userId) {
        setCurrentUserId(userId);
        return;
      }

      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user?.id) {
            setCurrentUserId(data.user.id);
          }
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, [userId]);

  // Extract config values with defaults
  const shopName = config.shopName || "Premium Retail";
  const tagline = config.tagline || "Quality Products, Exceptional Value";
  const shopLogo = config.shopLogo || "";
  const backgroundImage = config.backgroundImage || "";
  const primaryColor = config.primaryColor || "#3b82f6";
  const secondaryColor = config.secondaryColor || "#8b5cf6";
  const accentColor = config.accentColor || "#10b981";
  const tickerMessage =
    config.tickerMessage ||
    "🛍️ New Arrivals Daily • Best Prices Guaranteed • Quality You Can Trust";
  const tickerRightMessage =
    config.tickerRightMessage || "Shop with Confidence";

  const productItems = config.productItems || [];
  const galleryImages = config.galleryImages || [];
  const advertisements = config.advertisements || [];
  const enableSlideshow = config.enableSlideshow || false;
  const slideshowSpeed = config.slideshowSpeed || 10000;
  const slideSpeed = config.slideSpeed || 8000;
  const productRotationSpeed = config.productRotationSpeed || 8000;
  const customCategories = config.customCategories || [];
  const carouselTitle = config.carouselTitle || "Featured Products";

  // Handle basic field updates
  const handleFieldChange = (field: string, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  // ==============================
  // CATEGORY MANAGEMENT
  // ==============================
  const defaultCategories = [
    "Electronics",
    "Clothing & Fashion",
    "Home & Living",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Books & Stationery",
    "Toys & Games",
    "Food & Beverages",
    "Special Offers",
  ];

  const productCategories = [...defaultCategories, ...customCategories];

  const handleAddCategory = () => {
    if (newCategory.trim() && !productCategories.includes(newCategory.trim())) {
      const updated = [...customCategories, newCategory.trim()];
      handleFieldChange("customCategories", updated);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    const updated = customCategories.filter((cat: string) => cat !== category);
    handleFieldChange("customCategories", updated);
  };

  // ==============================
  // GALLERY MANAGEMENT
  // ==============================
  const handleGalleryImagesChange = (imgs: string[]) => {
    onConfigChange({ ...config, galleryImages: imgs });
  };

  const removeGalleryImage = (index: number) => {
    const updated = galleryImages.filter((_: string, i: number) => i !== index);
    handleFieldChange("galleryImages", updated);
  };

  // ==============================
  // PRODUCT ITEMS MANAGEMENT
  // ==============================
  const handleAddProductItem = () => {
    const newItem: ProductItem = {
      id: `product-${Date.now()}`,
      name: "",
      description: "",
      price: "",
      category: "Electronics",
      image: "",
      available: true,
      isSpecial: false,
    };

    onConfigChange({
      ...config,
      productItems: [...productItems, newItem],
    });
  };

  const handleUpdateProductItem = (idx: number, field: string, value: any) => {
    const updated = [...productItems];
    updated[idx] = { ...updated[idx], [field]: value };
    onConfigChange({ ...config, productItems: updated });
  };

  const handleRemoveProductItem = (idx: number) => {
    const updated = productItems.filter((_: any, i: number) => i !== idx);
    onConfigChange({ ...config, productItems: updated });
  };

  const handleMoveProductItem = (idx: number, direction: "up" | "down") => {
    const updated = [...productItems];
    const newIdx = direction === "up" ? idx - 1 : idx + 1;

    if (newIdx >= 0 && newIdx < updated.length) {
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      onConfigChange({ ...config, productItems: updated });
    }
  };

  return (
    <div className="space-y-8">
      {/* Shop Branding */}
      <CollapsibleSection title="🛍️ Shop Branding">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Shop Name
            </label>
            <Input
              value={shopName}
              onChange={(e) => handleFieldChange("shopName", e.target.value)}
              placeholder="Premium Retail"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tagline</label>
            <Input
              value={tagline}
              onChange={(e) => handleFieldChange("tagline", e.target.value)}
              placeholder="Quality Products, Exceptional Value"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Shop Logo
            </label>
            <ImageUploader
              images={shopLogo ? [shopLogo] : []}
              onChange={(imgs) => handleFieldChange("shopLogo", imgs[0] || "")}
              maxImages={1}
              userId={currentUserId}
              displayId={displayId}
              imageType="logo"
              environment={environment}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Visual & Theme Settings */}
      <CollapsibleSection title="🎨 Visual & Theme Settings">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Primary Color (Main Theme)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) =>
                  handleFieldChange("primaryColor", e.target.value)
                }
                className="w-10 h-10 cursor-pointer rounded border border-slate-600"
              />
              <Input
                value={primaryColor}
                onChange={(e) =>
                  handleFieldChange("primaryColor", e.target.value)
                }
                placeholder="#3b82f6"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Secondary Color (Accents)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) =>
                  handleFieldChange("secondaryColor", e.target.value)
                }
                className="w-10 h-10 cursor-pointer rounded border border-slate-600"
              />
              <Input
                value={secondaryColor}
                onChange={(e) =>
                  handleFieldChange("secondaryColor", e.target.value)
                }
                placeholder="#8b5cf6"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Accent Color (Highlights)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) =>
                  handleFieldChange("accentColor", e.target.value)
                }
                className="w-10 h-10 cursor-pointer rounded border border-slate-600"
              />
              <Input
                value={accentColor}
                onChange={(e) =>
                  handleFieldChange("accentColor", e.target.value)
                }
                placeholder="#10b981"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
          </div>

          <div className="p-2 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-xs text-slate-300">Primary</span>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: secondaryColor }}
              />
              <span className="text-xs text-slate-300">Secondary</span>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-xs text-slate-300">Accent</span>
            </div>
            <p className="text-xs text-slate-500">
              Primary: Main background | Secondary: Product highlights | Accent:
              Special items
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Background Images */}
      <CollapsibleSection title="🏞️ Background Images">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Main Background Image
            </label>
            <ImageUploader
              images={backgroundImage ? [backgroundImage] : []}
              onChange={(imgs) =>
                handleFieldChange("backgroundImage", imgs[0] || "")
              }
              maxImages={1}
              userId={currentUserId}
              displayId={displayId}
              imageType="background"
              environment={environment}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 font-medium">
                Slideshow Images ({config.backgroundImages?.length || 0})
              </label>
              <button
                onClick={() =>
                  handleFieldChange("enableSlideshow", !enableSlideshow)
                }
                className={`text-xs px-2 py-1 rounded ${
                  enableSlideshow
                    ? "bg-green-500/20 text-green-400"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {enableSlideshow ? "✓ Slideshow ON" : "Slideshow OFF"}
              </button>
            </div>

            {enableSlideshow && (
              <div className="space-y-3">
                <ImageUploader
                  images={config.backgroundImages || []}
                  onChange={(imgs) =>
                    handleFieldChange("backgroundImages", imgs)
                  }
                  maxImages={10}
                  userId={currentUserId}
                  displayId={displayId}
                  imageType="slideshow"
                  environment={environment}
                />

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Slideshow Speed (seconds)
                  </label>
                  <Input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={slideshowSpeed / 1000}
                    onChange={(e) =>
                      handleFieldChange(
                        "slideshowSpeed",
                        parseInt(e.target.value) * 1000
                      )
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>5s</span>
                    <span>{slideshowSpeed / 1000}s</span>
                    <span>30s</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {enableSlideshow && config.backgroundImages?.length > 0 && (
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-400">
                Slideshow rotation: {slideshowSpeed / 1000} seconds per image
                {config.backgroundImages?.length > 0 &&
                  ` | Full cycle: ${(
                    (config.backgroundImages.length * slideshowSpeed) /
                    1000
                  ).toFixed(0)}s`}
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Advertisement Schedules Section */}
      <CollapsibleSection title="📢 Advertisement Schedules (16:9 Full Screen)">
        <AdvertisementEditor
          advertisements={advertisements}
          onAdvertisementsChange={(ads) =>
            handleFieldChange("advertisements", ads)
          }
          displayId={displayId}
          userId={currentUserId}
          environment={environment}
        />
      </CollapsibleSection>

      {/* Gallery Images Section */}
      <CollapsibleSection title="🖼️ Gallery Images (1:1 Ratio)">
        <div className="space-y-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>1:1 Square Gallery:</strong> Upload square images (1:1
              ratio) for your shop gallery. Images will display on the right
              side and rotate automatically with your product displays.
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-2">
              Gallery Images ({galleryImages.length})
            </label>
            <ImageUploader
              images={galleryImages}
              onChange={handleGalleryImagesChange}
              maxImages={20}
              userId={currentUserId}
              displayId={displayId}
              imageType="gallery"
              environment={environment}
            />
          </div>

          {galleryImages.length > 0 && (
            <div className="mt-4 space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                Uploaded Gallery Images ({galleryImages.length})
              </label>
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((img: string, idx: number) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded border-2 border-slate-600"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        Image #{idx + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Ticker Messages */}
      <CollapsibleSection title="📰 Ticker Messages">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Bottom Ticker Message
            </label>
            <Input
              value={tickerMessage}
              onChange={(e) =>
                handleFieldChange("tickerMessage", e.target.value)
              }
              placeholder="🛍️ New Arrivals Daily • Best Prices Guaranteed • Quality You Can Trust"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Right Side Message
            </label>
            <Input
              value={tickerRightMessage}
              onChange={(e) =>
                handleFieldChange("tickerRightMessage", e.target.value)
              }
              placeholder="Shop with Confidence"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Product Display Settings */}
      <CollapsibleSection title="⚙️ Product Display Settings">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Slide Speed
            </label>
            <Input
              type="range"
              min="3"
              max="20"
              step="1"
              value={slideSpeed / 1000}
              onChange={(e) =>
                handleFieldChange("slideSpeed", parseInt(e.target.value) * 1000)
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>3s</span>
              <span className="text-blue-400 font-medium">
                {slideSpeed / 1000}s
              </span>
              <span>20s</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              How fast the product items scroll vertically
            </p>
          </div>

          <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-400">
              Products scroll at {slideSpeed / 1000} speed
              {productItems.length > 0 &&
                ` | Total items: ${productItems.length}`}
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Product Categories Section */}
      <CollapsibleSection title="📂 Product Categories">
        <div className="space-y-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Custom Categories:</strong> Add your own categories in
              addition to the default ones. Custom categories will appear in the
              category dropdown when creating product items.
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Default Categories (9)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-700/30 rounded-lg">
              {defaultCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Add Custom Category
            </label>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory();
                  }
                }}
                placeholder="e.g., Seasonal Items, Clearance"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
              <Button
                size="sm"
                onClick={handleAddCategory}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {customCategories.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 mb-2 block">
                Custom Categories ({customCategories.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {customCategories.map((cat: string) => (
                  <div
                    key={cat}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs rounded"
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="ml-1 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customCategories.length > 0 && (
            <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-400">
                Total categories available: {productCategories.length} (
                {defaultCategories.length} default + {customCategories.length}{" "}
                custom)
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Product Items Section */}
      <CollapsibleSection title="🛒 Product Items">
        <div className="space-y-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Product Display:</strong> Your products will be displayed
              on the left side with vertical scrolling. Add items with names,
              descriptions, prices, and images. Mark special items to highlight
              them!
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Product Carousel Title
            </label>
            <Input
              value={carouselTitle}
              onChange={(e) =>
                handleFieldChange("carouselTitle", e.target.value)
              }
              placeholder="Featured Products"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">
              This title will appear at the top of your product carousel
            </p>
          </div>

          <div className="flex justify-end mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddProductItem}
              className="border-slate-600 text-slate-300 h-7 bg-transparent hover:bg-slate-700"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Product
            </Button>
          </div>

          {productItems.map((item: ProductItem, idx: number) => (
            <div
              key={item.id}
              className={`bg-slate-700/50 p-4 rounded-lg space-y-3 border-2 ${
                item.isSpecial ? "border-blue-500/50" : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  Product #{idx + 1}
                  {item.isSpecial && (
                    <span className="ml-2 text-blue-400">⭐ Special</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveProductItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-600 rounded disabled:opacity-30"
                    title="Move up"
                  >
                    <span className="text-slate-400">↑</span>
                  </button>
                  <button
                    onClick={() => handleMoveProductItem(idx, "down")}
                    disabled={idx === productItems.length - 1}
                    className="p-1 hover:bg-slate-600 rounded disabled:opacity-30"
                    title="Move down"
                  >
                    <span className="text-slate-400">↓</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Product Name
                  </label>
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateProductItem(idx, "name", e.target.value)
                    }
                    placeholder="Wireless Headphones"
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Price
                  </label>
                  <Input
                    value={item.price}
                    onChange={(e) =>
                      handleUpdateProductItem(idx, "price", e.target.value)
                    }
                    placeholder="$99.99"
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    💡 For multiple sizes/variants, use <strong>&</strong> or{" "}
                    <strong>,</strong> • e.g., "Small $49 & Large $79"
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Description
                </label>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    handleUpdateProductItem(idx, "description", e.target.value)
                  }
                  placeholder="Premium wireless headphones with noise cancellation"
                  className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Category
                </label>
                <select
                  value={item.category}
                  onChange={(e) =>
                    handleUpdateProductItem(idx, "category", e.target.value)
                  }
                  className="w-full bg-slate-700 border border-slate-600 text-slate-50 text-sm rounded px-3 py-2"
                >
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Product Image (Optional)
                </label>
                <ImageUploader
                  images={item.image ? [item.image] : []}
                  onChange={(imgs) =>
                    handleUpdateProductItem(idx, "image", imgs[0] || "")
                  }
                  maxImages={1}
                  userId={currentUserId}
                  displayId={displayId}
                  imageType="product"
                  environment={environment}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={(e) =>
                      handleUpdateProductItem(
                        idx,
                        "available",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                  />
                  <span className="text-xs text-slate-300">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isSpecial || false}
                    onChange={(e) =>
                      handleUpdateProductItem(
                        idx,
                        "isSpecial",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                  />
                  <span className="text-xs text-blue-400">
                    ⭐ Mark as Special
                  </span>
                </label>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveProductItem(idx)}
                className="w-full text-red-400 hover:bg-red-500/10 text-sm"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove Product
              </Button>
            </div>
          ))}

          {productItems.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No products added yet. Click "Add Product" to start building your
              catalog.
            </div>
          )}

          {productItems.length > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mt-4">
              <p className="text-xs text-green-400">
                <strong>{productItems.length}</strong> products configured for
                display.
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
