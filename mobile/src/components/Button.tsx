import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { getTheme, radius, spacing, typography } from '@/theme';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', loading, disabled, fullWidth }: Props) {
  const t = getTheme();
  const s = styles(t);
  const variantStyle = variant === 'primary' ? s.primary : variant === 'outline' ? s.outline : s.ghost;
  const textStyle = variant === 'primary' ? s.textOnPrimary : s.textDefault;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.base,
        size === 'lg' ? s.lg : s.md,
        variantStyle,
        fullWidth && { alignSelf: 'stretch' },
        pressed && { opacity: 0.85 },
        (disabled || loading) && { opacity: 0.5 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : t.brand} />
      ) : (
        <View style={s.row}>
          <Text style={[textStyle, size === 'lg' ? { fontSize: 16 } : { fontSize: 14 }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    base: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
    md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
    primary: { backgroundColor: t.brand },
    outline: { borderWidth: 1, borderColor: t.border, backgroundColor: 'transparent' },
    ghost: { backgroundColor: 'transparent' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    textOnPrimary: { ...typography.body, color: '#fff', fontWeight: '600' },
    textDefault: { ...typography.body, color: t.text, fontWeight: '600' },
  });
