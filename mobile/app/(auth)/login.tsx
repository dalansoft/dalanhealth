import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { getTheme, radius, spacing, typography } from '@/theme';
import { useAuth } from '@/store/auth';

export default function Login() {
  const t = getTheme();
  const s = styles(t);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const login = useAuth((x) => x.login);
  const router = useRouter();

  const send = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setStep('otp');
    setLoading(false);
  };

  const verify = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    await login({ id: 'patient-demo', name: 'Shailesh Kumar', mobile }, 'mock-jwt');
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
      <View style={s.container}>
        <View style={s.logoBlock}>
          <View style={s.logoBox}><Text style={s.logoMark}>+</Text></View>
          <Text style={s.brand}>DalanHealth</Text>
        </View>
        <Text style={s.h1}>Sign in</Text>
        <Text style={s.muted}>Enter your mobile number to receive an OTP. In demo, the code is <Text style={s.mono}>123456</Text>.</Text>

        {step === 'mobile' ? (
          <>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="+91 98765 43210"
              placeholderTextColor={t.muted}
              keyboardType="phone-pad"
              style={s.input}
              autoFocus
            />
            <Button label="Send OTP" fullWidth size="lg" loading={loading} onPress={send} />
          </>
        ) : (
          <>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="6-digit OTP"
              placeholderTextColor={t.muted}
              keyboardType="number-pad"
              style={s.input}
              autoFocus
            />
            <Button label="Verify & continue" fullWidth size="lg" loading={loading} onPress={verify} />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: t.bg },
    container: { flex: 1, padding: spacing.xl, justifyContent: 'center', gap: spacing.lg },
    logoBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    logoBox: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: t.brand, alignItems: 'center', justifyContent: 'center' },
    logoMark: { color: '#fff', fontWeight: '800', fontSize: 20 },
    brand: { ...typography.h1, color: t.text },
    h1: { ...typography.display, color: t.text, marginTop: spacing.lg },
    muted: { ...typography.body, color: t.muted },
    input: { borderWidth: 1, borderColor: t.border, borderRadius: radius.lg, padding: spacing.lg, color: t.text, fontSize: 16, backgroundColor: t.card },
    mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  });
