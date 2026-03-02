import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Image,
  Instagram,
  Link,
  Smartphone,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

const DICEBEAR_STYLES = [
  { id: "adventurer", label: "Adventurer" },
  { id: "pixel-art", label: "Pixel Art" },
  { id: "lorelei", label: "Lorelei" },
  { id: "micah", label: "Micah" },
  { id: "notionists", label: "Notionists" },
  { id: "fun-emoji", label: "Fun Emoji" },
  { id: "big-smile", label: "Big Smile" },
  { id: "croodles", label: "Croodles" },
] as const;

function getDiceBearUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
  seed: string;
}

export function AvatarPicker({ value, onChange, seed }: AvatarPickerProps) {
  const safeSeed = seed || "character";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  const isAiStyle = value.startsWith("https://api.dicebear.com");
  const isDataUrl = value.startsWith("data:");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        onChange(result);
      }
      setIsLoadingPhoto(false);
    };
    reader.onerror = () => setIsLoadingPhoto(false);
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <Tabs defaultValue="ai-style">
        <TabsList className="w-full grid grid-cols-4 bg-muted/40 border border-border rounded-lg p-1 h-auto">
          <TabsTrigger
            value="ai-style"
            className="text-[10px] gap-1 py-2 px-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            AI
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="text-[10px] gap-1 py-2 px-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Link className="w-3 h-3 flex-shrink-0" />
            URL/GIF
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="text-[10px] gap-1 py-2 px-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Instagram className="w-3 h-3 flex-shrink-0" />
            Social
          </TabsTrigger>
          <TabsTrigger
            value="phone"
            className="text-[10px] gap-1 py-2 px-1 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Smartphone className="w-3 h-3 flex-shrink-0" />
            Photos
          </TabsTrigger>
        </TabsList>

        {/* AI Style Tab */}
        <TabsContent value="ai-style" className="mt-3 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {DICEBEAR_STYLES.map((style) => {
              const url = getDiceBearUrl(style.id, safeSeed);
              const isSelected = value === url;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onChange(url)}
                  className={`relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-150 group ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted/50 flex items-center justify-center">
                    <img
                      src={url}
                      alt={style.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight text-center">
                    {style.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview */}
          {isAiStyle && value && (
            <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
                <img
                  src={value}
                  alt="Selected avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Selected Avatar
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Personalized with your character's name
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* URL / GIF Tab */}
        <TabsContent value="url" className="mt-3 space-y-3">
          <div className="space-y-2">
            <Input
              value={isAiStyle ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/avatar.gif"
              className="bg-input border-border focus-visible:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Image className="w-3 h-3" />
              Supports direct image URLs including .gif animations
            </p>
          </div>

          {!isAiStyle && value && (
            <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
                <img
                  src={value}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Preview</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px] truncate">
                  {value}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Phone Photos Tab */}
        <TabsContent value="phone" className="mt-3 space-y-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,image/gif"
            className="hidden"
            onChange={handleFileSelect}
            tabIndex={-1}
          />

          {/* Upload button area */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoadingPhoto}
            className="w-full flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed group"
            aria-label="Open device photo library"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
              {isLoadingPhoto ? (
                <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isLoadingPhoto ? "Loading photo…" : "Choose from Photos"}
              </p>
              <p className="text-xs text-muted-foreground">
                Tap to open your device's photo library
              </p>
            </div>
          </button>

          {/* Helper note */}
          <div className="flex items-start gap-2 p-3 bg-muted/20 border border-border rounded-lg">
            <Smartphone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Opens your device's photo library (iPhone Photos, Android
              Gallery). Supports images and GIFs.
            </p>
          </div>

          {/* Preview after selection */}
          {isDataUrl && value && (
            <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
                <img
                  src={value}
                  alt="Selected avatar from device"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Photo Selected
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  From your device library
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  Change photo
                </button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TikTok / Instagram Tab */}
        <TabsContent value="social" className="mt-3 space-y-4">
          <div className="space-y-3">
            {/* TikTok instructions */}
            <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-background">
                    TT
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground">TikTok</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                On TikTok, tap your profile picture and hold to copy the image,
                or long-press a video thumbnail → Share → Copy Link, then use a
                TikTok media downloader to get the direct image URL.
              </p>
            </div>

            {/* Instagram instructions */}
            <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-1.5">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-foreground flex-shrink-0" />
                <p className="text-xs font-semibold text-foreground">
                  Instagram
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                On Instagram, open a post → tap the 3-dot menu → Copy Link. To
                get the direct image URL, open the link in a browser and
                right-click the image to copy image address.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              value={isAiStyle ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste direct media URL here…"
              className="bg-input border-border focus-visible:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Image className="w-3 h-3" />
              Paste a direct .gif or image URL from any social platform
            </p>
          </div>

          {!isAiStyle && value && (
            <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
                <img
                  src={value}
                  alt="Social media avatar preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Preview</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px] truncate">
                  {value}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
