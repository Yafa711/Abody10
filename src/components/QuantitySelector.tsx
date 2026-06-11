import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const { colors, radius } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        onPress={onDecrement}
        disabled={quantity <= min}
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.surface,
          opacity: quantity <= min ? 0.4 : 1,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>-</Text>
      </TouchableOpacity>
      <View
        style={{
          width: 40,
          height: 36,
          justifyContent: 'center',
          alignItems: 'center',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
          {quantity}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onIncrement}
        disabled={quantity >= max}
        activeOpacity={0.7}
        style={{
          width: 36,
          height: 36,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.surface,
          opacity: quantity >= max ? 0.4 : 1,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
