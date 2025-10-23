import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Package, Truck, User } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={[styles.backgroundExtension, { height: insets.top }]} />
        <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.centerContainer}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Package size={52} color={Colors.white} strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Welcome to</Text>
              <Text style={styles.appName}>LastMileTracker</Text>
              <Text style={styles.subtitle}>Choose your role to continue</Text>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.roleButton,
                  pressed && styles.roleButtonPressed,
                ]}
                onPress={() => router.push('/user/login')}
              >
                <View style={styles.roleIconCircle}>
                  <User size={36} color={Colors.primary} strokeWidth={2.5} />
                </View>
                <Text style={styles.roleButtonText}>User Login</Text>
                <Text style={styles.roleButtonSubtext}>Track your deliveries</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.roleButton,
                  pressed && styles.roleButtonPressed,
                ]}
                onPress={() => router.push('/partner/login')}
              >
                <View style={styles.roleIconCircle}>
                  <Truck size={36} color={Colors.primary} strokeWidth={2.5} />
                </View>
                <Text style={styles.roleButtonText}>Delivery Partner Login</Text>
                <Text style={styles.roleButtonSubtext}>Manage your deliveries</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.decorativeDots}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundExtension: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 56,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400' as const,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 34,
    color: Colors.white,
    fontWeight: '700' as const,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400' as const,
    textAlign: 'center' as const,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  roleButton: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  roleButtonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.97 }],
  },
  roleIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  roleButtonText: {
    fontSize: 19,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center' as const,
  },
  roleButtonSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400' as const,
    textAlign: 'center' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  decorativeDots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});
