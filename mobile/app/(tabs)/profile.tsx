import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { getTheme, spacing, typography } from '@/theme';
import { useAuth } from '@/store/auth';
import { useRouter } from 'expo-router';

export default function Profile() {
  const t = getTheme();
  const s = styles(t);
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.container}>
      <Card>
        <View style={s.avatar}><Text style={s.avatarText}>{user?.name?.[0] ?? 'P'}</Text></View>
        <Text style={s.h1}>{user?.name ?? 'Patient'}</Text>
        <Text style={s.muted}>{user?.mobile ?? '+91 …'}</Text>
      </Card>
      <Card>
        <Text style={[typography.caption, { color: t.muted, textTransform: 'uppercase' }]}>Booking history</Text>
        {['12 Jan · Sharma ENT · Completed', '16 Jan · Gupta Child Care · Cancelled', 'Today · Sharma ENT · Upcoming'].map((b, i) => (
          <View key={i} style={s.row}>
            <Text style={[typography.body, { color: t.text }]}>{b}</Text>
          </View>
        ))}
      </Card>
      <Button label="Sign out" variant="outline" fullWidth onPress={async () => { await logout(); router.replace('/(auth)/login'); }} />
    </ScrollView>
  );
}

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: t.bg },
    container: { padding: spacing.xl, gap: spacing.lg },
    avatar: { width: 64, height: 64, borderRadius: 18, backgroundColor: t.brand, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
    h1: { ...typography.h1, color: t.text, marginTop: spacing.md },
    muted: { ...typography.small, color: t.muted },
    row: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.border, marginTop: 6 },
  });
