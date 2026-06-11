import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../themes/ThemeContext';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

export default function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...textInputProps
}: InputProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Text
          style={[
            {
              color: colors.textSecondary,
              fontSize: typography.fontSize.labelMedium,
              fontWeight: '500',
              marginBottom: spacing.sm,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: borderColor,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            {
              flex: 1,
              color: colors.onBackground,
              fontSize: typography.fontSize.bodyMedium,
              paddingVertical: spacing.md,
              outlineStyle: 'none',
              outlineWidth: 0,
            } as TextStyle,
            inputStyle,
          ]}
          {...textInputProps}
        />
      </View>
      {error && (
        <Text
          style={[
            {
              color: colors.error,
              fontSize: typography.fontSize.labelSmall,
              marginTop: spacing.xs,
            },
            errorStyle,
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
