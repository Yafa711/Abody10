# Supabase Skill

## الإعداد
npm install @supabase/supabase-js

## الاتصال
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

## قواعد مهمة
- دائماً تحقق من الخطأ: const { data, error } = await supabase...
- استخدم RLS (Row Level Security) على كل جدول
- لا تضع المفاتيح في الكود — استخدم .env

## جلب البيانات
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category', 'phones')
  .order('created_at', { ascending: false })
  .limit(20)

## الإدراج
const { data, error } = await supabase
  .from('orders')
  .insert({ user_id, items, total, status: 'pending' })
  .select()

## التحديث
const { error } = await supabase
  .from('orders')
  .update({ status: 'paid' })
  .eq('id', orderId)

## المصادقة
supabase.auth.signUp({ email, password })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()
supabase.auth.getUser()

## رفع الملفات (إثبات الدفع)
const { data, error } = await supabase.storage
  .from('transfer-screenshots')
  .upload(`orders/${orderId}.jpg`, file)

## الوقت الفعلي
supabase.channel('orders')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, callback)
  .subscribe()
