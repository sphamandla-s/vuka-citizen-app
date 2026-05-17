import React, { useEffect, useMemo, useRef } from 'react';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface MapReport {
  id: string;
  location: { lat: number; lng: number };
  status: string;
  title?: string;
  description?: string;
  distanceLabel?: string;
}

interface MapAlert {
  id: string;
  location: { lat: number; lng: number };
  status?: string;
  title?: string;
  description?: string;
  distanceLabel?: string;
}

interface Props {
  latitude: number;
  longitude: number;
  reports: MapReport[];
  alerts: MapAlert[];
}

const markerColor = (status: string) =>
  status === 'resolved' ? colors.brand.green : colors.brand.orange;

export function MapContainer({ latitude, longitude, reports, alerts }: Props) {
  const mapRef = useRef<MapView | null>(null);
  const region = useMemo(
    () => ({
      latitude,
      longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }),
    [latitude, longitude],
  );

  useEffect(() => {
    mapRef.current?.animateToRegion(region, 700);
  }, [region]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_DEFAULT}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton={false}
    >
      {alerts.map((a) => (
        <React.Fragment key={a.id}>
          <Marker
            coordinate={{ latitude: a.location.lat, longitude: a.location.lng }}
            pinColor={colors.brand.red}
            title={a.title ?? 'Panic alert'}
            description={a.distanceLabel ?? a.description}
          />
          {a.status !== 'resolved' && (
            <Circle
              center={{ latitude: a.location.lat, longitude: a.location.lng }}
              radius={200}
              fillColor={colors.brand.redDim}
              strokeColor={colors.brand.redBorder}
              strokeWidth={2}
            />
          )}
        </React.Fragment>
      ))}
      {reports.map((r) => (
        <Marker
          key={r.id}
          coordinate={{ latitude: r.location.lat, longitude: r.location.lng }}
          pinColor={markerColor(r.status)}
          title={r.title ?? 'Community report'}
          description={r.distanceLabel ?? r.description}
        />
      ))}
    </MapView>
  );
}
