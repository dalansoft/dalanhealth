import { View, Text, StyleSheet } from 'react-native';
import { LinearGradientLike } from './LinearGradientLike';
import { getTheme, radius, spacing, typography } from '@/theme';

interface Props {
  clinic: string;
  yourToken: number;
  runningToken: number;
  waitMin: number;
}

export function TokenCard({ clinic, yourToken, runningToken, waitMin }: Props) {
  const t = getTheme();
  return (
    <LinearGradientLike colors={[t.brand, t.accent]} style={styles.outer}>
      <Text style={styles.eyebrow}>{clinic}</Text>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Your token</Text>
          <Text style={styles.big}>#{yourToken}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.label}>Running</Text>
          <Text style={styles.medium}>#{runningToken}</Text>
        </View>
      </View>
      <View style={styles.footRow}>
        <Stat label="Approx wait" val={`~${waitMin} min`} />
        <Stat label="Ahead" val={`${Math.max(0, yourToken - runningToken)} patients`} />
      </View>
    </LinearGradientLike>
  );
}

const Stat = ({ label, val }: { label: string; val: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.medium}>{val}</Text>
  </View>
);

const styles = StyleSheet.create({
  outer: { borderRadius: radius.xxl, padding: spacing.xl, gap: spacing.lg },
  eyebrow: { ...typography.caption, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg },
  big: { color: '#fff', fontSize: 56, fontWeight: '800', lineHeight: 56 },
  medium: { color: '#fff', fontSize: 18, fontWeight: '700' },
  label: { ...typography.caption, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' },
  footRow: { flexDirection: 'row', gap: spacing.md },
  statBox: { backgroundColor: 'rgba(255,255,255,0.18)', padding: spacing.md, borderRadius: radius.lg, flex: 1 },
});
