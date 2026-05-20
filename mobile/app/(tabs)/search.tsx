import { View, Text, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { getTheme, spacing, typography, radius } from '@/theme';

const docs = [
  { id: 'd1', name: 'Dr. Anil Sharma', spec: 'ENT', clinic: 'Sharma ENT', city: 'Patna' },
  { id: 'd2', name: 'Dr. Priya Gupta', spec: 'Pediatrics', clinic: 'Gupta Child Care', city: 'Patna' },
  { id: 'd3', name: 'Dr. Ravi Kumar', spec: 'General Physician', clinic: 'Kumar Polyclinic', city: 'Muzaffarpur' },
  { id: 'd4', name: 'Dr. Neha Singh', spec: 'Dermatology', clinic: 'Skin & Smile', city: 'Gaya' },
];

export default function Search() {
  const t = getTheme();
  const s = styles(t);
  const [q, setQ] = useState('');
  const router = useRouter();
  const filtered = docs.filter((d) => `${d.name} ${d.spec} ${d.clinic} ${d.city}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <TextInput placeholder="Doctor, clinic, city" value={q} onChangeText={setQ} placeholderTextColor={t.muted} style={s.input} autoFocus />
      <View style={{ gap: spacing.sm }}>
        {filtered.map((d) => (
          <Pressable key={d.id} onPress={() => router.push({ pathname: '/doctor/[id]', params: { id: d.id } })}>
            <Card>
              <Text style={s.h2}>{d.name}</Text>
              <Text style={s.muted}>{d.spec} · {d.clinic}</Text>
              <Text style={s.muted}>{d.city}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: t.bg },
    container: { padding: spacing.xl, gap: spacing.lg },
    input: { borderWidth: 1, borderColor: t.border, borderRadius: radius.lg, padding: spacing.lg, color: t.text, backgroundColor: t.card, fontSize: 16 },
    h2: { ...typography.h2, color: t.text },
    muted: { ...typography.small, color: t.muted },
  });
