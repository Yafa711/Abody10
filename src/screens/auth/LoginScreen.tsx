import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 100 }),
      Animated.spring(logoOpacity, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 100 }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(titleY, { toValue: 0, useNativeDriver: true, damping: 14, stiffness: 100 }),
        Animated.spring(titleOpacity, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 100 }),
      ]).start();
    }, 200);
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(formY, { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 100 }),
        Animated.spring(formOpacity, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 100 }),
      ]).start();
    }, 400);
  }, []);

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

  const logoAnim = { transform: [{ scale: logoScale }], opacity: logoOpacity };
  const titleAnim = { transform: [{ translateY: titleY }], opacity: titleOpacity };
  const formAnim = { transform: [{ translateY: formY }], opacity: formOpacity };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[{ alignItems: 'center', marginBottom: spacing.lg }, logoAnim]}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: colors.primaryLight,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="flash" size={36} color={colors.primary} />
          </View>
        </Animated.View>

        <Animated.View style={[{ alignItems: 'center', marginBottom: spacing.xxxxl }, titleAnim]}>
          <Text style={{ fontSize: 36, fontWeight: '700', color: colors.textPrimary, letterSpacing: 1 }}>
            متجر الكتروني
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm }}>
            تسوق بذوق رفيع
          </Text>
        </Animated.View>

        <Animated.View style={formAnim}>
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
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
