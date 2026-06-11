import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginScreen({ navigation }: any) {
  const { colors, spacing } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول');
      setLoading(false);
      return;
    }
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
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
            تسوق بذوق رفيع
          </Text>
        </View>

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
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          size="lg"
          style={{ width: '100%', marginBottom: spacing.md }}
        >
          تسجيل الدخول
        </Button>

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={{ alignItems: 'center', marginBottom: spacing.xxl }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>نسيت كلمة المرور؟</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>ليس لديك حساب؟</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginLeft: spacing.xs }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>إنشاء حساب</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
