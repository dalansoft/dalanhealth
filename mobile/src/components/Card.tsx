import { View, ViewProps, StyleSheet } from 'react-native';
import { getTheme, radius, spacing } from '@/theme';

export function Card({ style, ...rest }: ViewProps) {
  const t = getTheme();
  return <View style={[styles(t).card, style]} {...rest} />;
}

const styles = (t: ReturnType<typeof getTheme>) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.card,
      borderColor: t.border,
      borderWidth: 1,
      borderRadius: radius.xl,
      padding: spacing.lg,
    },
  });
