import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/layout';
import { typography } from '@/constants/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const bg =
    variant === 'primary'
      ? colors.brand.red
      : variant === 'danger'
        ? colors.brand.red
        : variant === 'outline'
          ? 'transparent'
          : 'transparent';

  const textColor =
    variant === 'ghost' ? colors.text.secondary : colors.text.primary;

  const borderColor = variant === 'outline' ? colors.border.strong : 'transparent';

  const padding =
    size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          paddingVertical: padding,
          paddingHorizontal: padding * 1.5,
          borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            size === 'lg' ? typography.display.md : typography.label.md,
            { color: textColor },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  label: {
    textAlign: 'center',
  },
});
