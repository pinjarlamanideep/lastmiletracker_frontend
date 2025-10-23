import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
} from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import io from 'socket.io-client';

import Colors from '@/constants/colors';
import { Order } from '@/constants/mockData';
import { API_URL } from '@/constants/api';
import { getToken } from '@/app/utils/token';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/orders/id/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        setOrder(data.order);
        setSelectedStatus(data.order?.status || '');
      } catch (err) {
        console.error('fetchOrder error', err);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (order && liveLocationEnabled) {
      socketRef.current = io(API_URL);
      socketRef.current.emit('joinOrder', (order as any)._id || order.id);

      const startLocationUpdates = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission denied');
          return;
        }

        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            socketRef.current.emit('updateLocation', {
              orderId: (order as any)._id || order.id,
              location: { latitude, longitude },
            });
          }
        );

        return locationSubscription;
      };

      const subscriptionPromise = startLocationUpdates();

      return () => {
        subscriptionPromise.then((subscription) => {
          if (subscription) {
            subscription.remove();
          }
        });
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } else if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, [order, liveLocationEnabled]);

  

  const handleCall = () => {
    if (order?.customerPhone) {
      Linking.openURL(`tel:${order.customerPhone}`);
    }
  };

  const handleUpdateStatus = () => {
    (async () => {
      if (!order) return;
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/orders/${(order as any)._id || order.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: selectedStatus }),
        });
        const data = await res.json();
        if (!res.ok) {
          console.warn('Failed to update status', data);
          return;
        }
        setOrder(data.order);
      } catch (err) {
        console.error('update status error', err);
      }
    })();
  };

  const handleStartNavigation = () => {
    console.log('Starting navigation');
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Order Details</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Order #{order.code}</Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Items</Text>
                <Text style={styles.infoValue}>{order.items}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{order.weight}</Text>
              </View>
            </View>
          </View>

          <View style={styles.customerCard}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.customerInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {order.customerName.charAt(0)}
                </Text>
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.customerPhone}>{order.customerPhone}</Text>
              </View>
              <Pressable style={styles.callButton} onPress={handleCall}>
                <Phone size={20} color={Colors.white} />
              </Pressable>
            </View>
          </View>

          <View style={styles.addressCard}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressItem}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.addressText}>{order.deliveryAddress}</Text>
            </View>
          </View>

          {order.instructions && (
            <View style={styles.instructionsCard}>
              <Text style={styles.sectionTitle}>Delivery Instructions</Text>
              <Text style={styles.instructionsText}>{order.instructions}</Text>
            </View>
          )}

          <View style={styles.statusCard}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.statusOptions}>
              {['pending', 'picked_up', 'on_the_way', 'delivered'].map(
                (status) => (
                  <Pressable
                    key={status}
                    style={[
                      styles.statusOption,
                      selectedStatus === status && styles.statusOptionActive,
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        selectedStatus === status &&
                          styles.statusOptionTextActive,
                      ]}
                    >
                      {status === 'pending' && 'Pending'}
                      {status === 'picked_up' && 'Picked Up'}
                      {status === 'on_the_way' && 'On the Way'}
                      {status === 'delivered' && 'Delivered'}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.updateButton,
                pressed && styles.updateButtonPressed,
              ]}
              onPress={handleUpdateStatus}
            >
              <Text style={styles.updateButtonText}>Update Status</Text>
            </Pressable>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.sectionTitle}>Share Live Location</Text>
              <Switch
                value={liveLocationEnabled}
                onValueChange={setLiveLocationEnabled}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={
                  liveLocationEnabled ? Colors.primary : Colors.textLight
                }
              />
            </View>
            {liveLocationEnabled && (
              <Text style={styles.locationSubtext}>
                Your location is being shared with the customer
              </Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.navigationButton,
              pressed && styles.navigationButtonPressed,
            ]}
            onPress={handleStartNavigation}
          >
            <Navigation size={20} color={Colors.white} />
            <Text style={styles.navigationButtonText}>Start Navigation</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  customerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  instructionsCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusOptions: {
    gap: 8,
    marginBottom: 16,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.secondary,
  },
  statusOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  statusOptionTextActive: {
    color: Colors.white,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  navigationButton: {
    backgroundColor: Colors.success,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navigationButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  navigationButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
});
