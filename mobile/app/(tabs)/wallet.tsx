import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { LinearGradientLike } from '@/components/LinearGradientLike';
import { getTheme, radius, spacing, typography } from '@/theme';

const tx = [
  { date: 'Today', note: 'Doctor promo · Dr. Sharma', amt: 0.5, type: 'earn' as const },
  { date: 'Yesterday', note: 'Normal booking', amt: 0.1, type: 'earn' as const },
  { date: '12 Jan', note: 'Adjusted on booking 9rs+gst', amt: 0.5, type: 'use' as const },
];

export default function Wallet() {
  const t = getTheme();
  const s = styles(t);
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <LinearGradientLike colors={[t.accent, t.brand]} style={s.heroCard}>
        <Text style={s.caption}>DalanHealth Rewards Wallet</Text>
        <Text style={s.big}>₹2.80</Text>
        <Text style={s.muted2}>For booking-fee adjustment only · max 50% per booking</Text>
      </LinearGradientLike>

      <Card>
        <Text style={[typography.caption, { color: t.muted, textTransform: 'uppercase' }]}>Transactions</Text>
        <View style={{ marginTop: spacing.sm }}>
          {tx.map((row, i) => (
            <View key={i} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.note}>{row.note}</Text>
                <Text style={s.date}>{row.date}</Text>
              </View>
              <Text style={[s.amt, row.type === 'use' && { color: t.brand }]}>
                {row.type === 'earn' ? '+' : '−'} ₹{row.amt.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: t.bg },
    container: { padding: spacing.xl, gap: spacing.lg },
    heroCard: { borderRadius: radius.xxl, padding: spacing.xl },
    caption: { ...typography.caption, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' },
    big: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 4 },
    muted2: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    note: { ...typography.body, color: t.text, fontWeight: '600' },
    date: { ...typography.small, color: t.muted },
    amt: { ...typography.body, color: t.success, fontWeight: '700' },
  });
