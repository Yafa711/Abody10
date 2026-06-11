import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../themes/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { colors, spacing } = useTheme();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendResetLink = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    if (!email.trim()) {
      setError('يرجى إدخال بريدك الإلكتروني');
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      setLoading(false);
      return;
    }
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'فشل إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Text style={{ fontSize: 52, color: colors.primary, marginBottom: spacing.lg }}>✓</Text>
        <Text style={{ fontSize: 24, fontWeight: '600', color: colors.onBackground, marginBottom: spacing.sm }}>
          تم إرسال الرابط
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 22 }}>
          تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.
        </Text>
        <Button onPress={() => navigation.goBack()} variant="outline" size="md">
          العودة لتسجيل الدخول
        </Button>
      </View>
    );
  }

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
            إعادة تعيين كلمة المرور
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
          onPress={handleSendResetLink}
          loading={loading}
          disabled={loading}
          size="lg"
          style={{ width: '100%', marginBottom: spacing.lg }}
        >
          إرسال رابط إعادة التعيين
        </Button>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>تذكرت كلمة المرور؟</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: spacing.xs }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
