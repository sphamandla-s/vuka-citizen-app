import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';

interface Props {
  latitude: number;
  longitude: number;
  reports: any[];
  alerts: any[];
}

export function MapContainer({ latitude, longitude, reports, alerts }: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="map-marker-radius-outline" size={64} color={colors.border.strong} />
      <Text style={[typography.body.lg, { color: colors.text.secondary, marginTop: spacing.md }]}>
        Map available on device
      </Text>
      <Text style={[typography.mono.sm, { color: colors.text.muted, marginTop: spacing.sm }]}>
        Your location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </Text>
      <Text style={[typography.mono.sm, { color: colors.text.muted, marginTop: spacing.sm }]}>
        {alerts.length} alerts · {reports.length} issues nearby
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0D',
  },
});
