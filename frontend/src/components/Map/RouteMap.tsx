import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TripRoute } from '../../types/trip';

interface RouteMapProps {
  route: TripRoute;
}

function FitBounds({ route }: { route: TripRoute }) {
  const map = useMap();

  useEffect(() => {
    if (route.polyline.length > 0) {
      const bounds = L.latLngBounds(
        route.polyline.map((p) => [p.latitude, p.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (route.bounds) {
      const bounds = L.latLngBounds(
        [route.bounds.south, route.bounds.west],
        [route.bounds.north, route.bounds.east]
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, route]);

  return null;
}

function TileErrorFallback() {
  const map = useMap();
  const [error, setError] = useState(false);

  useEffect(() => {
    const tiles = map as L.Map & { _tileContainer?: HTMLElement };
    const container = tiles.getContainer();
    const img = container.querySelector('img.leaflet-tile');
    if (img) {
      const handler = () => setError(true);
      img.addEventListener('error', handler);
      return () => img.removeEventListener('error', handler);
    }
  }, [map]);

  if (!error) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-[1000]" style={{ backgroundColor: 'var(--surface-secondary)' }}>
      <div className="text-center p-4">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Map tiles unavailable</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Check your network connection</p>
      </div>
    </div>
  );
}

const markerIcons: Record<string, L.Icon> = {
  current: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  pickup: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  dropoff: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  fuel: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  break: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

export function RouteMap({ route }: RouteMapProps) {
  const polylinePositions = route.polyline.map(
    (p) => [p.latitude, p.longitude] as [number, number]
  );

  const defaultCenter: [number, number] = route.polyline.length > 0
    ? [route.polyline[0].latitude, route.polyline[0].longitude]
    : [39.8283, -98.5795];

  return (
    <div className="rounded-lg overflow-hidden relative z-0" style={{ border: '1px solid var(--border)' }}>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        className="w-full"
        style={{ minHeight: '300px', height: '50vh', maxHeight: '500px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds route={route} />
        <TileErrorFallback />

        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            color="#374151"
            weight={5}
            opacity={0.85}
          />
        )}

        {route.markers.map((marker, index) => (
          <Marker
            key={`${marker.type}-${index}`}
            position={[marker.latitude, marker.longitude]}
            icon={markerIcons[marker.type] || markerIcons.current}
          >
            <Popup>
              <div className="p-1.5 min-w-[140px]">
                <h3 className="font-bold text-gray-900 text-sm">{marker.title}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{marker.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
