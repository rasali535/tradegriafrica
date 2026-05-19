"use client";

import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Navigation, Info } from 'lucide-react';
import { Shipment, GPSData } from '@/context/AppContext';

interface CorridorMapProps {
  activeShipment?: Shipment;
}

// Coordinates map for vector drawing
// Relative SVG coordinates for our custom styled SADC map
const CITY_COORDS: Record<string, { x: number; y: number; lat: number; lng: number }> = {
  'Windhoek': { x: 180, y: 350, lat: -22.5609, lng: 17.0658 },
  'Walvis Bay': { x: 120, y: 340, lat: -22.9575, lng: 14.5053 },
  'Maun': { x: 320, y: 260, lat: -19.9833, lng: 23.4167 },
  'Gaborone': { x: 420, y: 410, lat: -24.6282, lng: 25.9231 },
  'Francistown': { x: 460, y: 330, lat: -21.1736, lng: 27.5144 },
  'Johannesburg': { x: 490, y: 490, lat: -26.2041, lng: 28.0473 },
  'Bloemfontein': { x: 450, y: 550, lat: -29.1181, lng: 26.2230 },
  'Harare': { x: 580, y: 220, lat: -17.8252, lng: 31.0335 },
  'Mutare': { x: 640, y: 250, lat: -18.9722, lng: 32.6694 },
  'Lusaka': { x: 500, y: 120, lat: -15.3875, lng: 28.3228 },
  'Choma': { x: 440, y: 160, lat: -16.8065, lng: 26.9839 },
};

const COUNTRIES_SHAPES = [
  // Mock simplified borders for Botswana, Namibia, Zimbabwe, Zambia, South Africa
  { name: 'Namibia', points: '50,220 220,220 260,300 260,480 200,480 200,530 110,480 50,480' },
  { name: 'Botswana', points: '260,300 420,300 450,340 450,440 380,470 260,430' },
  { name: 'Zambia', points: '260,180 380,180 430,90 560,90 580,180 520,200 420,200 280,240' },
  { name: 'Zimbabwe', points: '420,300 580,200 660,200 680,320 540,360 450,340' },
  { name: 'South Africa', points: '260,480 380,470 450,440 540,360 620,420 680,480 620,680 400,680 300,600' }
];

export const CorridorMap: React.FC<CorridorMapProps> = ({ activeShipment }) => {
  const [truckPos, setTruckPos] = useState<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState(0);

  // Calculate truck position along the active route
  useEffect(() => {
    if (activeShipment && activeShipment.status === 'transit') {
      const fromCity = activeShipment.route_from;
      const toCity = activeShipment.route_to;
      const start = CITY_COORDS[fromCity] || CITY_COORDS['Gaborone'];
      const end = CITY_COORDS[toCity] || CITY_COORDS['Johannesburg'];

      // Simulate movement along path
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          return next > 100 ? 0 : next;
        });
      }, 150);

      const x = start.x + (end.x - start.x) * (progress / 100);
      const y = start.y + (end.y - start.y) * (progress / 100);
      setTruckPos({ x, y });

      return () => clearInterval(interval);
    } else if (activeShipment && activeShipment.status === 'delivered') {
      const toCity = activeShipment.route_to;
      const end = CITY_COORDS[toCity] || CITY_COORDS['Johannesburg'];
      setTruckPos({ x: end.x, y: end.y });
    } else {
      setTruckPos(null);
    }
  }, [activeShipment, progress]);

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden glass-card p-4 flex flex-col justify-between border-emerald-900/40">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
        <div>
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-emerald-500 animate-pulse" />
            SADC Agribusiness Trade Corridor
          </h3>
          <p className="text-xs text-zinc-400">Real-time border tracking and logistics flow</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Active
          </span>
        </div>
      </div>

      {/* Corridor Map Graphic */}
      <div className="relative flex-1 bg-zinc-950/40 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-900">
        <svg viewBox="0 0 800 700" className="w-full h-full max-h-[320px] select-none text-zinc-600">
          {/* Countries Areas */}
          {COUNTRIES_SHAPES.map((country) => (
            <polygon
              key={country.name}
              points={country.points}
              className="fill-zinc-900/60 stroke-zinc-800/80 hover:fill-emerald-950/20 transition-all duration-300"
              strokeWidth="1.5"
            />
          ))}

          {/* SADC Core Corridor Paths */}
          {/* Gaborone -> Harare */}
          <line x1="420" y1="410" x2="580" y2="220" stroke="#0B5D3B" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />
          {/* Francistown -> Lusaka */}
          <line x1="460" y1="330" x2="500" y2="120" stroke="#0B5D3B" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />
          {/* Gaborone -> Johannesburg */}
          <line x1="420" y1="410" x2="490" y2="490" stroke="#0B5D3B" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />
          {/* Maun -> Windhoek */}
          <line x1="320" y1="260" x2="180" y2="350" stroke="#0B5D3B" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

          {/* Country Labels */}
          <text x="110" y="270" fill="#71717a" fontSize="12" fontWeight="bold" letterSpacing="0.05em">NAMIBIA</text>
          <text x="310" y="360" fill="#71717a" fontSize="12" fontWeight="bold" letterSpacing="0.05em">BOTSWANA</text>
          <text x="440" y="110" fill="#71717a" fontSize="12" fontWeight="bold" letterSpacing="0.05em">ZAMBIA</text>
          <text x="560" y="290" fill="#71717a" fontSize="12" fontWeight="bold" letterSpacing="0.05em">ZIMBABWE</text>
          <text x="490" y="600" fill="#71717a" fontSize="12" fontWeight="bold" letterSpacing="0.05em">SOUTH AFRICA</text>

          {/* Cities Pins */}
          {Object.entries(CITY_COORDS).map(([name, pos]) => (
            <g key={name} transform={`translate(${pos.x}, ${pos.y})`}>
              <circle r="4" className="fill-emerald-500 stroke-zinc-950" strokeWidth="1.5" />
              <text y="-8" textAnchor="middle" fill="#d4d4d8" fontSize="10" className="font-semibold pointer-events-none drop-shadow">
                {name}
              </text>
            </g>
          ))}

          {/* Active Route Line & Truck Marker */}
          {activeShipment && (
            <>
              {/* Route Line Highlight */}
              {(() => {
                const start = CITY_COORDS[activeShipment.route_from] || CITY_COORDS['Gaborone'];
                const end = CITY_COORDS[activeShipment.route_to] || CITY_COORDS['Johannesburg'];
                return (
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#D4AF37"
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                );
              })()}

              {/* Truck Icon Positioning */}
              {truckPos && (
                <g transform={`translate(${truckPos.x}, ${truckPos.y})`}>
                  <circle r="14" className="fill-zinc-950 stroke-amber-500" strokeWidth="2" />
                  <foreignObject x="-8" y="-8" width="16" height="16">
                    <Truck className="h-4 w-4 text-amber-500 animate-bounce" />
                  </foreignObject>
                </g>
              )}
            </>
          )}
        </svg>
      </div>

      {/* Map Info Bar */}
      <div className="mt-3 flex items-center justify-between text-xs bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
        <div className="flex items-center gap-2 text-zinc-300">
          <Info className="h-4 w-4 text-amber-500" />
          {activeShipment ? (
            <span>
              Tracking shipment: <strong className="text-zinc-100">{activeShipment.route_from} → {activeShipment.route_to}</strong>
              {activeShipment.status === 'transit' ? ' (In Transit)' : ' (Delivered)'}
            </span>
          ) : (
            <span>No active route selected. Click a shipment in the dashboard to view tracking.</span>
          )}
        </div>
        <div className="flex gap-4 font-mono text-[10px] text-zinc-500">
          <div>LAT: {truckPos ? (activeShipment?.gps?.lat || -24.6282).toFixed(4) : '-'}</div>
          <div>LNG: {truckPos ? (activeShipment?.gps?.lng || 25.9231).toFixed(4) : '-'}</div>
        </div>
      </div>
    </div>
  );
};
