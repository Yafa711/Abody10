import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';

export default function AddressScreen({ navigation: _navigation }: { navigation?: any }) {
  const { colors, spacing, radius } = useTheme();
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'المنزل',
      street: 'شارع الاستقلال، مبنى 123',
      city: 'الرياض',
      postalCode: '12345',
      isDefault: true,
    },
    {
      id: 2,
      name: 'العمل',
      street: 'طريق الملك فهد، مكتب 456',
      city: 'الدمام',
      postalCode: '56789',
      isDefault: false,
    }
  ]);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    postalCode: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddAddress = () => {
    setShowAddForm(true);
  };

  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.postalCode) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const address = {
        id: Date.now(),
        ...newAddress,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, address]);
      setNewAddress({ name: '', street: '', city: '', postalCode: '' });
      setShowAddForm(false);
      setLoading(false);
    }, 1000);
  };

  const handleSetDefault = (id: number) => {
    setLoading(true);
    setTimeout(() => {
      setAddresses(
        addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
      setLoading(false);
    }, 1000);
  };

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const s = {
    screenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderColor: colors.border },
    screenTitle: { fontSize: 24, fontWeight: '600' },
    addFormContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    addFormContent: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '90%', maxWidth: 400 },
    formTitle: { fontSize: 20, marginBottom: spacing.lg },
    inputContainer: { marginBottom: spacing.md },
    inputLabel: { color: colors.onBackground, fontSize: 14, marginBottom: spacing.xs },
    input: { height: 48, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.onBackground, fontSize: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg },
    cancelButtonBase: { flex: 1, marginRight: spacing.sm, height: 40, justifyContent: 'center', alignItems: 'center' },
    cancelButtonText: { color: colors.onBackground, fontSize: 14 },
    saveButtonBase: { flex: 1, marginLeft: spacing.sm, height: 40, justifyContent: 'center', alignItems: 'center' },
    saveButtonText: { color: colors.onBackground, fontSize: 14, fontWeight: '600' },
    addressItem: { padding: spacing.md },
    addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    addressName: { fontSize: 16 },
    defaultBadge: { fontSize: 12 },
    addressDetails: { marginBottom: spacing.sm },
    addressDetailText: { fontSize: 14 },
    addressActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    emptyText: { fontSize: 16 },
  } as const;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }]}>
      <View style={[s.screenHeader]}>
        <Text style={[s.screenTitle, { color: colors.onBackground }]}>
          العناوين
        </Text>
        <TouchableOpacity onPress={handleAddAddress}>
          <Text style={[{ color: colors.primary, fontWeight: '600' }]}>
            إضافة عنوان
          </Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={[s.addFormContainer]}>
          <View style={[s.addFormContent]}>
            <Text style={[s.formTitle, { color: colors.onBackground }]}>
              إضافة عنوان جديد
            </Text>

            <View style={[s.inputContainer]}>
              <Text style={[s.inputLabel]}>
                اسم العنوان (مثل: المنزل، العمل)
              </Text>
              <TextInput
                style={[s.input]}
                placeholder="أدخل اسم العنوان"
                placeholderTextColor={colors.textTertiary}
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
              />
            </View>

            <View style={[s.inputContainer]}>
              <Text style={[s.inputLabel]}>
                الشارع ورقم المبنى
              </Text>
              <TextInput
                style={[s.input]}
                placeholder="أدخل الشارع ورقم المبنى"
                placeholderTextColor={colors.textTertiary}
                value={newAddress.street}
                onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
              />
            </View>

            <View style={[s.inputContainer]}>
              <Text style={[s.inputLabel]}>
                المدينة
              </Text>
              <TextInput
                style={[s.input]}
                placeholder="أدخل المدينة"
                placeholderTextColor={colors.textTertiary}
                value={newAddress.city}
                onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
              />
            </View>

            <View style={[s.inputContainer]}>
              <Text style={[s.inputLabel]}>
                الرمز البريدي
              </Text>
              <TextInput
                style={[s.input]}
                placeholder="أدخل الرمز البريدي"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={newAddress.postalCode}
                onChangeText={(text) => setNewAddress({ ...newAddress, postalCode: text })}
              />
            </View>

            <View style={[s.formActions]}>
              <TouchableOpacity
                style={[s.cancelButtonBase, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                onPress={() => setShowAddForm(false)}
                disabled={loading}
              >
                {loading ? (
                  <Text style={{ color: colors.textSecondary }}>جاري الحفظ...</Text>
                ) : (
                  <Text style={[s.cancelButtonText]}>
                    إلغاء
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveButtonBase, { backgroundColor: loading ? colors.textTertiary : colors.primary }]}
                onPress={handleSaveAddress}
                disabled={loading}
              >
                {loading ? (
                  <Text style={{ color: colors.onBackground }}>جاري الحفظ...</Text>
                ) : (
                  <Text style={[s.saveButtonText]}>
                    حفظ
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={addresses}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={[s.addressItem, { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: spacing.md }]}>
            <View style={[s.addressHeader]}>
              <Text style={[s.addressName, { color: colors.onBackground, fontWeight: '600' }]}>
                {item.name}
              </Text>
              {item.isDefault && (
                <Text style={[s.defaultBadge, { backgroundColor: colors.primary, color: colors.onBackground, paddingHorizontal: spacing.xs, paddingVertical: spacing.xs, borderRadius: radius.sm }]}>
                  الافتراضي
                </Text>
              )}
            </View>

            <View style={[s.addressDetails]}>
              <Text style={[s.addressDetailText, { color: colors.textSecondary }]}>
                {item.street}
              </Text>
              <Text style={[s.addressDetailText, { color: colors.textSecondary }]}>
                {item.city}, {item.postalCode}
              </Text>
            </View>

            <View style={[s.addressActions]}>
              {!item.isDefault && (
                <TouchableOpacity
                  style={{ marginRight: spacing.sm }}
                  onPress={() => handleSetDefault(item.id)}
                >
                  <Text style={[{ color: colors.primary, fontWeight: '600' }]}>
                    جعله الافتراضي
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                <Text style={[{ color: colors.error, fontWeight: '600' }]}>
                  حذف
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={[s.emptyContainer]}>
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              لا توجد عناوين محفوظة بعد
            </Text>
          </View>
        }
      />
    </View>
  );
}
