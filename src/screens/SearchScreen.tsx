import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../themes/ThemeContext';
import { useSearch } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { ProductCard, EmptyState, Skeleton } from '../components';

export default function SearchScreen({ navigation }: any) {
  const { colors, spacing, radius, typography } = useTheme();
  const { user } = useAuth();
  const search = useSearch(user?.id || null);

  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    search.loadTopSearches();
  }, []);

  const saveRecentSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 10);
    setRecentSearches(updated);
  };

  const handleSearch = useCallback(
    async (q: string) => {
      Keyboard.dismiss();
      if (!q.trim()) return;
      setQuery(q);
      setShowResults(true);
      await search.search(q);
      saveRecentSearch(q.trim());
    },
    [search]
  );

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    search.clear();
    Keyboard.dismiss();
  };

  const handleRemoveRecent = (q: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== q));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.lg,
          paddingTop: spacing.xxxl,
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceVariant,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            height: 44,
          }}
        >
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontSize: typography.fontSize.bodyMedium,
              marginLeft: spacing.sm,
              height: 44,
            }}
            placeholder="ابحث عن منتجات..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {showResults ? (
        <FlatList
          data={search.results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: spacing.md }}
          columnWrapperStyle={{ gap: spacing.md }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
              />
            </View>
          )}
          ListEmptyComponent={
            search.loading ? (
              <View style={{ padding: spacing.lg }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={40} style={{ marginBottom: spacing.md }} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="search-outline"
                title="لا توجد نتائج"
                message={`لم نجد نتائج لـ "${query}". حاول بكلمة أخرى.`}
              />
            )
          }
          ListFooterComponent={<View style={{ height: spacing.xxxl }} />}
        />
      ) : (
        <FlatList
          data={[]}
          keyExtractor={(_, i) => i.toString()}
          renderItem={null}
          ListHeaderComponent={
            <View style={{ padding: spacing.lg }}>
              {/* Top Searches */}
              {search.topSearches.length > 0 && (
                <View style={{ marginBottom: spacing.xxl }}>
                  <Text
                    style={{
                      fontSize: typography.fontSize.bodyMedium,
                      fontWeight: '600',
                      color: colors.textPrimary,
                      marginBottom: spacing.md,
                    }}
                  >
                    الأكثر بحثاً
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {search.topSearches.map((s) => (
                      <TouchableOpacity
                        key={s.query}
                        onPress={() => {
                          setQuery(s.query);
                          handleSearch(s.query);
                        }}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: colors.surfaceVariant,
                          paddingVertical: spacing.sm,
                          paddingHorizontal: spacing.md,
                          borderRadius: radius.pill,
                          borderWidth: 1,
                          borderColor: colors.border,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Ionicons name="trending-up" size={14} color={colors.primary} />
                        <Text style={{ fontSize: typography.fontSize.bodySmall, color: colors.textSecondary }}>
                          {s.query}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View>
                  <Text
                    style={{
                      fontSize: typography.fontSize.bodyMedium,
                      fontWeight: '600',
                      color: colors.textPrimary,
                      marginBottom: spacing.md,
                    }}
                  >
                    عمليات البحث الأخيرة
                  </Text>
                  {recentSearches.map((q) => (
                    <TouchableOpacity
                      key={q}
                      onPress={() => {
                        setQuery(q);
                        handleSearch(q);
                      }}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: spacing.sm,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <Ionicons name="time-outline" size={18} color={colors.textTertiary} />
                        <Text style={{ fontSize: typography.fontSize.bodyMedium, color: colors.textSecondary }}>
                          {q}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveRecent(q)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close" size={16} color={colors.textTertiary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {search.topSearches.length === 0 && recentSearches.length === 0 && (
                <View style={{ alignItems: 'center', marginTop: spacing.xxxxl }}>
                  <Ionicons name="search" size={48} color={colors.textTertiary} />
                  <Text
                    style={{
                      fontSize: typography.fontSize.bodyMedium,
                      color: colors.textTertiary,
                      marginTop: spacing.md,
                      textAlign: 'center',
                    }}
                  >
                    ابحث عن منتجاتك المفضلة
                  </Text>
                </View>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
