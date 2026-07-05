import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapPickerProps {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
}

function DraggableMarker({ lat, lng, onChange }: MapPickerProps) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    },
  });

  const position: [number, number] =
    lat && lng ? [parseFloat(lat), parseFloat(lng)] : [36.8065, 10.1815];

  return (
    <Marker
      ref={markerRef}
      position={position}
      draggable={true}
      icon={defaultIcon}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          onChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        },
      }}
    />
  );
}

function MapCenter({ lat, lng }: { lat: string; lng: string }) {
  const map = useMap();
  const prevRef = useRef({ lat, lng });

  useEffect(() => {
    if (lat && lng && (lat !== prevRef.current.lat || lng !== prevRef.current.lng)) {
      prevRef.current = { lat, lng };
      map.setView([parseFloat(lat), parseFloat(lng)], map.getZoom());
    }
  }, [lat, lng, map]);

  return null;
}

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const center: [number, number] =
    lat && lng ? [parseFloat(lat), parseFloat(lng)] : [36.8065, 10.1815];

  return (
    <div className="rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={lat && lng ? 15 : 7}
        className="h-64 w-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker lat={lat} lng={lng} onChange={onChange} />
        <MapCenter lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
