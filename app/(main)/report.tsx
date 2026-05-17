import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_LABELS } from '@/components/feed/ReportCard';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';
import { useLocation } from '@/hooks/useLocation';
import { useFeedStore, type ReportCategory, type ReportRadius } from '@/stores/feedStore';
import { useAuthStore } from '@/stores/authStore';

const CATEGORIES: { key: ReportCategory; icon: string }[] = [
  { key: 'pothole', icon: 'road-variant' },
  { key: 'water_leak', icon: 'water' },
  { key: 'no_electricity', icon: 'lightning-bolt' },
  { key: 'illegal_dump', icon: 'delete-sweep' },
  { key: 'crime', icon: 'alert-octagon' },
  { key: 'road_damage', icon: 'road' },
  { key: 'flooding', icon: 'waves' },
  { key: 'other', icon: 'dots-horizontal-circle' },
];

const RADIUS_OPTIONS: { key: ReportRadius; label: string; desc: string }[] = [
  { key: 'private', label: 'Only Me', desc: 'Private' },
  { key: 'street', label: 'My Street', desc: '~200m' },
  { key: 'neighbourhood', label: 'My Neighbourhood', desc: '~1km' },
  { key: 'area', label: 'Whole Area', desc: 'Broadcast' },
];

const SMART_RADIUS: Partial<Record<ReportCategory, ReportRadius>> = {
  crime: 'neighbourhood',
  no_electricity: 'area',
  flooding: 'area',
  pothole: 'neighbourhood',
  water_leak: 'neighbourhood',
  road_damage: 'neighbourhood',
  illegal_dump: 'neighbourhood',
  other: 'neighbourhood',
};

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<ReportRadius>('neighbourhood');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const { location } = useLocation(false);
  const { addReport } = useFeedStore();
  const { user } = useAuthStore();

  const handleCategorySelect = (cat: ReportCategory) => {
    setCategory(cat);
    setSelectedRadius(SMART_RADIUS[cat] ?? 'neighbourhood');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Description required', 'Please describe what you observed.');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const num = `VK-${Math.floor(1000 + Math.random() * 9000)}`;
    setCaseNumber(num);
    addReport({
      id: `report_${Date.now()}`,
      category: category!,
      description: description.trim(),
      location: { lat: location?.lat ?? -26.2041, lng: location?.lng ?? 28.0473, address: location?.address ?? 'Your location' },
      validations: 0,
      status: 'open',
      daysOpen: 0,
      distanceMetres: 50,
      isAnonymous,
      caseNumber: num,
      createdAt: new Date().toISOString(),
      userId: user?.id ?? 'anon',
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const reset = () => {
    setStep(1);
    setCategory(null);
    setDescription('');
    setSubmitted(false);
    setCaseNumber('');
  };

  if (submitted) {
    return (
      <View style={[styles.container, styles.successContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 80 }]}>
        <MaterialCommunityIcons name="check-circle" size={80} color={colors.brand.green} />
        <Text style={[typography.display.lg, { color: colors.text.primary, marginTop: spacing.lg }]}>REPORT FILED</Text>
        <Text style={[typography.mono.md, { color: colors.brand.green, marginTop: spacing.sm }]}>Case #{caseNumber} is open</Text>
        <Text style={[typography.body.md, { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.xl }]}>
          Your community will be alerted. Thank you for making your area safer.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { marginTop: spacing.xl, backgroundColor: colors.brand.green }]}
          onPress={() => {
            const msg = `I just filed a report on Vuka for Case #${caseNumber} at ${location?.address ?? 'my location'}. Download Vuka to stay safe. https://vuka.app`;
            Alert.alert('Share to WhatsApp', msg.slice(0, 100) + '...');
          }}
        >
          <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
          <Text style={[typography.label.md, { color: '#fff' }]}>SHARE TO WHATSAPP</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} style={{ marginTop: spacing.lg }}>
          <Text style={[typography.body.md, { color: colors.text.secondary }]}>File another report</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          {step > 1 ? (
            <TouchableOpacity onPress={() => setStep((s) => s - 1)}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ) : <View style={{ width: 24 }} />}
          <Text style={[typography.display.md, { color: colors.text.primary }]}>
            {step === 1 ? 'WHAT HAPPENED?' : step === 2 ? 'DETAILS' : 'CONFIRM'}
          </Text>
          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={[styles.stepDot, s <= step && styles.stepDotActive]} />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Step 1: Category */}
          {step === 1 && (
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.catTile, category === cat.key && styles.catTileActive]}
                  onPress={() => handleCategorySelect(cat.key)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={28}
                    color={category === cat.key ? colors.text.primary : colors.text.secondary}
                  />
                  <Text style={[typography.body.sm, { color: category === cat.key ? colors.text.primary : colors.text.secondary, textAlign: 'center' }]}>
                    {CATEGORY_LABELS[cat.key]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <View style={styles.detailsSection}>
              <TouchableOpacity style={styles.photoBtn} onPress={async () => {
                if (Platform.OS === 'web') return;
                try {
                  const IP = await import('expo-image-picker');
                  await IP.launchCameraAsync({ quality: 0.7, allowsEditing: true });
                } catch {}
              }}>
                <MaterialCommunityIcons name="camera" size={32} color={colors.text.muted} />
                <Text style={[typography.body.md, { color: colors.text.muted, marginTop: spacing.sm }]}>
                  Tap to add a photo
                </Text>
                {category !== 'crime' && (
                  <Text style={[typography.label.sm, { color: colors.brand.red, marginTop: 2 }]}>Required</Text>
                )}
              </TouchableOpacity>

              <Text style={[typography.label.md, { color: colors.text.secondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                Description
              </Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholder={
                  category === 'pothole' ? 'Describe the pothole size and exact location...'
                  : category === 'crime' ? 'What crime did you witness? (anonymous by default)'
                  : 'Describe what you observed...'
                }
                placeholderTextColor={colors.text.muted}
                textAlignVertical="top"
              />

              <Text style={[typography.label.md, { color: colors.text.secondary, marginTop: spacing.lg, marginBottom: spacing.xs }]}>
                Location
              </Text>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={18} color={colors.brand.red} />
                <Text style={[typography.body.md, { color: colors.text.primary, flex: 1 }]}>
                  {location?.address ?? 'Fetching location...'}
                </Text>
              </View>

              {category === 'crime' && (
                <TouchableOpacity
                  style={styles.anonRow}
                  onPress={() => setIsAnonymous(!isAnonymous)}
                >
                  <MaterialCommunityIcons
                    name={isAnonymous ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={20}
                    color={isAnonymous ? colors.brand.red : colors.text.muted}
                  />
                  <Text style={[typography.body.md, { color: colors.text.secondary }]}>
                    Report anonymously
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: spacing.xl }]}
                onPress={() => setStep(3)}
              >
                <Text style={[typography.display.md, { color: colors.text.primary }]}>NEXT →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <View style={styles.confirmSection}>
              <View style={styles.summaryCard}>
                <Text style={[typography.label.md, { color: colors.text.muted, marginBottom: spacing.sm }]}>Summary</Text>
                <Text style={[typography.body.xl, { color: colors.text.primary }]}>
                  {CATEGORY_LABELS[category!]}
                </Text>
                <Text style={[typography.body.md, { color: colors.text.secondary, marginTop: spacing.xs }]}>
                  {description}
                </Text>
                <View style={[styles.locationRow, { marginTop: spacing.sm }]}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={colors.brand.red} />
                  <Text style={[typography.mono.sm, { color: colors.text.muted }]}>
                    {location?.address ?? 'Your location'}
                  </Text>
                </View>
              </View>

              <Text style={[typography.label.md, { color: colors.text.secondary, marginTop: spacing.xl, marginBottom: spacing.md }]}>
                Who should see this?
              </Text>
              {RADIUS_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.radiusOption, selectedRadius === r.key && styles.radiusOptionActive]}
                  onPress={() => setSelectedRadius(r.key)}
                >
                  <MaterialCommunityIcons
                    name={selectedRadius === r.key ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={selectedRadius === r.key ? colors.brand.red : colors.text.muted}
                  />
                  <View>
                    <Text style={[typography.body.lg, { color: colors.text.primary }]}>{r.label}</Text>
                    <Text style={[typography.mono.sm, { color: colors.text.muted }]}>{r.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: spacing.xl }, submitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : (
                  <Text style={[typography.display.md, { color: colors.text.primary }]}>REPORT NOW</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: colors.bg.primary },
  container: { flex: 1, backgroundColor: colors.bg.primary },
  successContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  stepIndicator: { flexDirection: 'row', gap: 4 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border.strong },
  stepDotActive: { backgroundColor: colors.brand.red },
  content: { padding: spacing.md, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catTile: {
    width: '47%',
    aspectRatio: 1.6,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  catTileActive: { borderColor: colors.brand.red, backgroundColor: colors.brand.redDim },
  detailsSection: {},
  photoBtn: {
    height: 140,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    color: colors.text.primary,
    padding: spacing.md,
    minHeight: 100,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  anonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  confirmSection: {},
  summaryCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  radiusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: spacing.sm,
  },
  radiusOptionActive: { borderColor: colors.brand.red, backgroundColor: colors.brand.redDim },
  primaryBtn: {
    backgroundColor: colors.brand.red,
    paddingVertical: spacing.md + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
