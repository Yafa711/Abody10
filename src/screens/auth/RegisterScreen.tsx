import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterScreen({ navigation }: any) {
  const { colors, spacing } = useTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('يرجى ملء جميع الحقول');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور على الأقل 6 أحرف');
      setLoading(false);
      return;
    }
    try {
      await signUp(email.trim(), password);
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: spacing.xxxxl }}>
          <Text style={{ fontSize: 36, fontWeight: '700', color: colors.primary, letterSpacing: 1 }}>
            متجر الإلكترو
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm }}>
            إنشاء حساب جديد
          </Text>
        </View>

        <Input
          label="الاسم الكامل"
          placeholder="أدخل اسمك الكامل"
          value={name}
          onChangeText={setName}
          containerStyle={{ marginBottom: spacing.md }}
        />

        <Input
          label="البريد الإلكتروني"
          placeholder="أدخل بريدك الإلكتروني"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={{ marginBottom: spacing.md }}
        />

        <Input
          label="كلمة المرور"
          placeholder="أدخل كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          containerStyle={{ marginBottom: spacing.md }}
        />

        <Input
          label="تأكيد كلمة المرور"
          placeholder="أعد إدخال كلمة المرور"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          containerStyle={{ marginBottom: spacing.md }}
        />

        {error ? (
          <View style={{
            backgroundColor: colors.error,
            borderRadius: 8,
            padding: spacing.sm,
            marginBottom: spacing.md,
          }}>
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 14 }}>{error}</Text>
          </View>
        ) : null}

        <Button
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          size="lg"
          style={{ width: '100%', marginBottom: spacing.lg }}
        >
          إنشاء حساب
        </Button>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>لديك حساب بالفعل؟</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: spacing.xs }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
