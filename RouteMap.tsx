import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FoodDonation, Recipient, Vehicle, PlannedRoute } from '../../types';
import { findLocationById } from '../../data/locations';

interface RouteMapProps {
  donations: FoodDonation[];
  recipients: Recipient[];
  vehicles: Vehicle[];
  routes?: PlannedRoute[];
  selectedCity?: string;
  center?: [number, number];
  zoom?: number;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  donations,
  recipients,
  vehicles,
  routes = [],
  selectedCity,
  center,
  zoom,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Determine initial and dynamic center
  const getCoordinatesForCenter = (): { lat: number; lng: number; zoom: number } => {
    if (center) {
      return { lat: center[0], lng: center[1], zoom: zoom || 12 };
    }
    if (selectedCity) {
      const loc = findLocationById(selectedCity);
      return { lat: loc.lat, lng: loc.lng, zoom: loc.zoom || 12 };
    }
    // Default Coimbatore
    return { lat: 11.0168, lng: 76.9558, zoom: 12 };
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initial = getCoordinatesForCenter();
      const map = L.map(mapContainerRef.current, {
        center: [initial.lat, initial.lng],
        zoom: initial.zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when selectedCity or center prop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const target = getCoordinatesForCenter();
    map.setView([target.lat, target.lng], target.zoom, { animate: true });
  }, [selectedCity, center, zoom]);

  // Update map markers and polylines whenever data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Add Donor Markers (Amber / Gold)
    donations.forEach((d) => {
      if (!d.location?.lat || !d.location?.lng) return;

      const donorIcon = L.divIcon({
        className: 'custom-donor-icon',
        html: `
          <div style="background-color: #f97316; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; cursor: pointer;">
            🍲
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([d.location.lat, d.location.lng], { icon: donorIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; max-width: 220px;">
          <span style="font-size: 10px; font-weight: bold; color: #f97316; text-transform: uppercase;">Surplus Food Donor</span><br/>
          <strong style="color: #0f172a; font-size: 13px;">${d.foodName || d.description}</strong><br/>
          <span style="color: #475569; font-weight: 500;">${d.donorName} (${d.donorType})</span><br/>
          <div style="margin-top: 4px; padding: 4px; background: #fff7ed; border-radius: 6px; font-weight: bold; color: #ea580c;">
            ${d.quantity} ${d.unit} • ${d.foodCategory}
          </div>
          <span style="color: #059669; font-size: 11px; display: block; margin-top: 4px;">Safe window: ${new Date(d.verifiedSafeDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span style="color: #94a3b8; font-size: 10px; display: block; margin-top: 2px;">${d.location.address || d.location.name || ''}</span>
        </div>
      `);
      layers.addLayer(marker);
    });

    // 2. Add Recipient Markers (Emerald / Green)
    recipients.forEach((r) => {
      if (!r.location?.lat || !r.location?.lng) return;

      const recipientIcon = L.divIcon({
        className: 'custom-recipient-icon',
        html: `
          <div style="background-color: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; cursor: pointer;">
            🏠
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([r.location.lat, r.location.lng], { icon: recipientIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; max-width: 220px;">
          <span style="font-size: 10px; font-weight: bold; color: #10b981; text-transform: uppercase;">Community Recipient</span><br/>
          <strong style="color: #0f172a; font-size: 13px;">${r.name}</strong><br/>
          <span style="color: #475569;">${r.type}</span><br/>
          <div style="margin-top: 4px; padding: 4px; background: #ecfdf5; border-radius: 6px; font-weight: bold; color: #047857;">
            Daily Demand: ${r.demandQuantity} meals (Cap: ${r.maxReceivingCapacity})
          </div>
          <span style="color: #64748b; font-size: 10px; display: block; margin-top: 4px;">Hours: ${r.operatingHours.open} - ${r.operatingHours.close}</span>
          <span style="color: #94a3b8; font-size: 10px;">${r.location.address || r.location.name || ''}</span>
        </div>
      `);
      layers.addLayer(marker);
    });

    // 3. Add Vehicle Markers (Navy)
    vehicles.forEach((v) => {
      if (!v.location?.lat || !v.location?.lng) return;

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-icon',
        html: `
          <div style="background-color: #0f172a; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2px solid #38bdf8;">
            🚚
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([v.location.lat, v.location.lng], { icon: vehicleIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0f172a;">${v.name}</strong><br/>
          <span style="color: #64748b;">${v.type}</span><br/>
          <span style="color: #0284c7; font-weight: 600;">Capacity: ${v.capacity} meals • Status: ${v.status}</span>
        </div>
      `);
      layers.addLayer(marker);
    });

    // 4. Add Route Polylines
    routes.forEach((route, idx) => {
      if (!route.stops || route.stops.length < 2) return;

      const latLngs: [number, number][] = route.stops
        .filter((s) => s.location && s.location.lat && s.location.lng)
        .map((s) => [s.location.lat, s.location.lng]);

      if (latLngs.length < 2) return;

      const colors = ['#059669', '#2563eb', '#7c3aed', '#d97706'];
      const color = colors[idx % colors.length];

      const polyline = L.polyline(latLngs, {
        color,
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 6',
      });

      polyline.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong>Route: ${route.vehicleName}</strong><br/>
          Distance: ${route.totalDistanceKm} km • Est: ${route.totalDurationMinutes} mins<br/>
          Stops: ${route.stops.length} (${route.isBundledPickup ? 'Bundled Pickup' : 'Direct'})
        </div>
      `);

      layers.addLayer(polyline);
    });
  }, [donations, recipients, vehicles, routes]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
    </div>
  );
};
