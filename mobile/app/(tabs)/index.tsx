import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { TokenCard } from '@/components/TokenCard';
import { getTheme, spacing, typography } from '@/theme';
import { useAuth } from '@/store/auth';

const demoDoctors = [
  { id: 'd1', name: 'Dr. Anil Sharma', spec: 'ENT', clinic: 'Sharma ENT Clinic', token: 12, wait: 38 },
  { id: 'd2', name: 'Dr. Priya Gupta', spec: 'Pediatrics', clinic: 'Gupta Child Care', token: 4, wait: 18 },
  { id: 'd3', name: 'Dr. Ravi Kumar', spec: 'General', clinic: 'Kumar Polyclinic', token: 9, wait: 28 },
];

export default function Home() {
  const t = getTheme();
  const s = styles(t);
  const user = useAuth((u) => u.user);
  const router = useRouter();
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      <View>
        <Text style={s.caption}>Hello</Text>
        <Text style={s.h1}>{user?.name ?? 'There'}</Text>
      </View>

      <Pressable onPress={() => router.push('/(tabs)/search')}>
        <Card style={s.searchCard}><Text style={{ color: t.muted }}>🔍  Search doctor, clinic or specialization</Text></Card>
      </Pressable>

      <Pressable onPress={() => router.push('/(tabs)/queue')}>
        <TokenCard clinic="Sharma ENT Clinic" yourToken={18} runningToken={12} waitMin={38} />
      </Pressable>

      <View style={{ gap: spacing.sm }}>
        <Text style={s.h2}>Doctors near you</Text>
        {demoDoctors.map((d) => (
          <Pressable key={d.id} onPress={() => router.push({ pathname: '/doctor/[id]', params: { id: d.id } })}>
            <Card style={s.docRow}>
              <View style={s.avatar}><Text style={s.avatarText}>{d.name.split(' ')[1]?.[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.docName}>{d.name}</Text>
                <Text style={s.docMeta}>{d.spec} · {d.clinic}</Text>
                <Text style={s.docMeta}>#{d.token} · ~{d.wait} min</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    scroll: { flex: 1, backgroundColor: t.bg },
    container: { padding: spacing.xl, gap: spacing.lg },
    caption: { ...typography.caption, color: t.muted, textTransform: 'uppercase' },
    h1: { ...typography.display, color: t.text },
    h2: { ...typography.h2, color: t.text },
    searchCard: { paddingVertical: spacing.lg },
    docRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
    avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: t.brand + '22', alignItems: 'center', justifyContent: 'center' },
    avatarText: { ...typography.h2, color: t.brand },
    docName: { ...typography.h2, color: t.text },
    docMeta: { ...typography.small, color: t.muted },
  });
