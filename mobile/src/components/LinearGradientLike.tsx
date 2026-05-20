import { View, ViewProps, StyleSheet } from 'react-native';

// Lightweight stand-in for expo-linear-gradient — single colour blend.
// Swap with `expo-linear-gradient` for true gradients once installed.
interface Props extends ViewProps {
  colors: [string, string, ...string[]];
}

export function LinearGradientLike({ colors, style, children, ...rest }: Props) {
  return (
    <View style={[styles.base, { backgroundColor: colors[0] }, style]} {...rest}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[colors.length - 1], opacity: 0.5 }]} />
      <View style={{ position: 'relative' }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({ base: { overflow: 'hidden' } });
