import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { errorService } from './errorService';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const storageService = {
  async uploadPaymentProof(userId: string, imageUri: string): Promise<string> {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists || fileInfo.size === undefined) {
      throw new Error('ملف غير موجود');
    }
    if (fileInfo.size > MAX_FILE_SIZE) {
      throw new Error('حجم الملف يتجاوز 5 ميجابايت');
    }

    const compressed = await manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    const ext = 'jpg';
    const fileName = `payment_${userId}_${Date.now()}.${ext}`;
    const filePath = `payment-proofs/${fileName}`;

    const base64 = await FileSystem.readAsStringAsync(compressed.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, decode(base64), {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: signedData, error: signedError } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(filePath, 3600);

    if (signedError || !signedData) {
      errorService.log(signedError || 'Failed to create signed URL');
      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);
      return urlData.publicUrl;
    }

    return signedData.signedUrl;
  },

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .createSignedUrl(filePath, expiresIn);
      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
