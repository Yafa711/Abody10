import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;
const AVAILABLE_WIDTH = SCREEN_WIDTH - PADDING * 2;

interface BentoItem {
  key: string;
  span: 1 | 2;
  height: number;
  children: React.ReactNode;
}

interface BentoGridProps {
  items: BentoItem[];
}

export default function BentoGrid({ items }: BentoGridProps) {
  const columnWidth = (AVAILABLE_WIDTH - GAP) / 2;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {items.map((item, index) => {
          const width = item.span === 2 ? AVAILABLE_WIDTH : columnWidth;
          return (
            <View
              key={item.key}
              style={[
                styles.cell,
                {
                  width,
                  height: item.height,
                  marginRight: index % 2 === 0 && item.span === 1 ? GAP : 0,
                },
              ]}
            >
              {item.children}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    marginBottom: GAP,
    overflow: 'hidden',
  },
});
