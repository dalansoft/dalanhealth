import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { TokenCard } from '@/components/TokenCard';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getTheme, spacing, typography } from '@/theme';

export default function Queue() {
  const t = getTheme();
  const s = styles(t);
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <TokenCard clinic="Sharma ENT Clinic" yourToken={18} runningToken={12} waitMin={38} />
      <Card>
        <Text style={s.caption}>Doctor</Text>
        <Text style={s.h2}>Dr. Anil Sharma</Text>
        <Text style={s.muted}>Sharma ENT Clinic · Patna</Text>
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
          <View style={s.statBox}><Text style={s.caption}>Expected</Text><Text style={s.statVal}>1:10 PM</Text></View>
          <View style={s.statBox}><Text style={s.caption}>Doctor till</Text><Text style={s.statVal}>2:00 PM</Text></View>
        </View>
      </Card>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}><Button label="Cancel" variant="outline" fullWidth /></View>
        <View style={{ flex: 1 }}><Button label="Directions" fullWidth /></View>
      </View>
    </ScrollView>
  );
}

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: t.bg },
    container: { padding: spacing.xl, gap: spacing.lg },
    caption: { ...typography.caption, color: t.muted, textTransform: 'uppercase' },
    h2: { ...typography.h2, color: t.text, marginTop: 4 },
    muted: { ...typography.small, color: t.muted },
    statBox: { flex: 1, padding: spacing.md, borderRadius: 12, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border },
    statVal: { ...typography.h2, color: t.text },
  });
