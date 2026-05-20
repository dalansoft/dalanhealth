import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getTheme, spacing, typography } from '@/theme';

const docs = [
  { id: 'd1', name: 'Dr. Anil Sharma', spec: 'ENT', clinic: 'Sharma ENT Clinic', timing: '10 AM – 2 PM', fee: 300, wait: 38, token: 12 },
  { id: 'd2', name: 'Dr. Priya Gupta', spec: 'Pediatrics', clinic: 'Gupta Child Care', timing: '5 PM – 8 PM', fee: 250, wait: 18, token: 4 },
];

export default function Doctor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = getTheme();
  const s = styles(t);
  const router = useRouter();
  const d = docs.find((x) => x.id === id) ?? docs[0];
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <Card>
        <Text style={s.h1}>{d.name}</Text>
        <Text style={s.muted}>{d.spec} · {d.clinic}</Text>
        <View style={s.row}>
          <Tile label="Timing" val={d.timing} t={t} />
          <Tile label="Current" val={`#${d.token}`} t={t} />
          <Tile label="Wait" val={`~${d.wait} min`} t={t} />
        </View>
      </Card>
      <Card>
        <Text style={[typography.caption, { color: t.muted, textTransform: 'uppercase' }]}>Consultation fee</Text>
        <Text style={s.h1}>₹{d.fee}</Text>
        <Text style={s.muted}>+ ₹1 booking fee · adjustable with cashback</Text>
      </Card>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}><Button label="Join queue · Free" fullWidth onPress={() => router.replace('/(tabs)/queue')} /></View>
        <View style={{ flex: 1 }}><Button label="Book · ₹1" variant="outline" fullWidth onPress={() => router.replace('/(tabs)/queue')} /></View>
      </View>
    </ScrollView>
  );
}

const Tile = ({ label, val, t }: { label: string; val: string; t: ReturnType<typeof getTheme> }) => (
  <View style={{ flex: 1, padding: spacing.md, borderRadius: 12, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border }}>
    <Text style={{ ...typography.caption, color: t.muted, textTransform: 'uppercase' }}>{label}</Text>
    <Text style={{ ...typography.h2, color: t.text }}>{val}</Text>
  </View>
);

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: t.bg },
    container: { padding: spacing.xl, gap: spacing.lg },
    h1: { ...typography.h1, color: t.text },
    muted: { ...typography.small, color: t.muted },
    row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  });
