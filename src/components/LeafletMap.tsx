import { useEffect, useRef, useState } from "react";
import { MapMarker } from "@/types/pearl-hub";

declare global {
  interface Window { L: any; }
}

interface LeafletMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onSelectLocation?: (lat: number, lng: number) => void;
}

const colorMap: Record<string, string> = {
  property: "#1B6B4A",
  stay: "#1A3A5C",
  vehicle: "#8B1A2A",
  event: "#C9A84C",
};

const LeafletMap = ({ markers = [], center = [7.8731, 80.7718], zoom = 8, height = "400px", onSelectLocation }: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
        await new Promise<void>((res) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
          script.onload = () => res();
          document.head.appendChild(script);
        });
      }
      setLoaded(true);
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.L) return;
    if (mapInstanceRef.current) mapInstanceRef.current.remove();

    const map = window.L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    if (onSelectLocation) {
      map.on("click", (e: any) => {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      });
      mapRef.current.style.cursor = "crosshair";
    }

    const createIcon = (emoji: string, color: string) => window.L.divIcon({
      html: `<div style="background:${color};width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,0,0,0.3);border:2px solid white;"><span style="transform:rotate(45deg);font-size:14px">${emoji}</span></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -40], className: "",
    });

    markers.forEach((m) => {
      const icon = createIcon(m.emoji || "📍", colorMap[m.type] || "#C9A84C");
      window.L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'DM Sans',sans-serif;min-width:200px">
            <div style="font-size:16px;margin-bottom:4px">${m.emoji || "📍"} <strong>${m.title}</strong></div>
            <div style="font-size:12px;color:#6B7A8D">${m.location || ""}</div>
            ${m.price ? `<div style="font-size:14px;font-weight:700;color:#C9A84C;margin-top:6px">Rs. ${m.price?.toLocaleString()}</div>` : ""}
            ${m.rating ? `<div style="color:#C9A84C;font-size:12px">★ ${m.rating}</div>` : ""}
          </div>
        `, { maxWidth: 250 });
    });

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [loaded, markers, center, zoom]);

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height }}>
      {!loaded && (
        <div className="h-full flex flex-col items-center justify-center bg-pearl gap-3">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Loading Map…</span>
        </div>
      )}
      <div ref={mapRef} style={{ height: "100%", width: "100%", display: loaded ? "block" : "none" }} />
    </div>
  );
};

export default LeafletMap;
