import { useRouter } from 'expo-router';
import { ArrowLeft, Package, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

export default function EnterCodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');

  const handleTrack = () => {
    if (code.trim()) {
      console.log('Tracking order:', code);
      router.push(`/user/tracking?code=${code}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Package size={48} color={Colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.title}>Track Your Order</Text>
          <Text style={styles.subtitle}>
            Enter your delivery code to track your package in real-time
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Delivery Code</Text>
            <View style={styles.inputWrapper}>
              <Search size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit code (e.g., 1234)"
                placeholderTextColor={Colors.textLight}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.trackButton,
              pressed && styles.trackButtonPressed,
              !code.trim() && styles.trackButtonDisabled,
            ]}
            onPress={handleTrack}
            disabled={!code.trim()}
          >
            <Text style={styles.trackButtonText}>Track Order</Text>
          </Pressable>
        </View>

        <View style={styles.illustration}>
          <View style={styles.illustrationCircle}>
            <Package size={64} color={Colors.primaryLight} strokeWidth={1.5} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.text,
  },
  trackButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trackButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  trackButtonDisabled: {
    opacity: 0.5,
  },
  trackButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  illustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed' as const,
  },
});
