import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Phone, Clock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { API_URL } from '@/constants/api';
import { Order } from '@/constants/mockData';

export default function TrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/code/${code}`);
        if (!res.ok) return;
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error(err);
      }
    };
    if (code) fetchOrder();
  }, [code]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return Colors.success;
      case 'on_the_way':
      case 'picked_up':
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'picked_up':
        return 'Picked Up';
      case 'on_the_way':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const handleCall = () => {
    if (order?.deliveryBoyPhone) {
      Linking.openURL(`tel:${order.deliveryBoyPhone}`);
    }
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <Pressable
            style={styles.backToHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToHomeButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <View style={styles.routeLine} />
            <View style={styles.pickupMarker}>
              <MapPin size={24} color={Colors.primary} />
            </View>
            <Animated.View
              style={[
                styles.deliveryMarker,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.markerDot} />
            </Animated.View>
            <View style={styles.destinationMarker}>
              <MapPin size={24} color={Colors.success} />
            </View>
          </View>

          <Pressable
            style={[styles.backButtonFloating, { top: insets.top + 20 }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </Pressable>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderNumber}>Order #{order.code}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Clock size={20} color={Colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>ETA</Text>
                <Text style={styles.infoValue}>{order.eta}</Text>
              </View>
            </View>
          </View>

          {order.deliveryBoyName && (
            <View style={styles.deliveryBoyCard}>
              <View style={styles.deliveryBoyInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {order.deliveryBoyName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.deliveryBoyDetails}>
                  <Text style={styles.deliveryBoyLabel}>Delivery Partner</Text>
                  <Text style={styles.deliveryBoyName}>
                    {order.deliveryBoyName}
                  </Text>
                </View>
              </View>
              <Pressable style={styles.callButton} onPress={handleCall}>
                <Phone size={20} color={Colors.white} />
              </Pressable>
            </View>
          )}

          <View style={styles.addressSection}>
            <View style={styles.addressItem}>
              <View style={styles.addressDot} />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>Pickup</Text>
                <Text style={styles.addressText}>{order.pickupAddress}</Text>
              </View>
            </View>

            <View style={styles.addressConnector} />

            <View style={styles.addressItem}>
              <View style={[styles.addressDot, styles.addressDotDestination]} />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>Delivery</Text>
                <Text style={styles.addressText}>{order.deliveryAddress}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.viewDetailsButton}
            onPress={() => router.push(`/user/status?code=${order.code}`)}
          >
            <Text style={styles.viewDetailsButtonText}>View Status Timeline</Text>
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
  mapContainer: {
    height: 400,
    backgroundColor: Colors.secondary,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.secondary,
    position: 'relative',
  },
  routeLine: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: '60%',
    height: 2,
    backgroundColor: Colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  pickupMarker: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  deliveryMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },
  markerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  destinationMarker: {
    position: 'absolute',
    top: '70%',
    right: '15%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonFloating: {
    position: 'absolute',
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  infoRow: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  deliveryBoyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  deliveryBoyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  deliveryBoyDetails: {
    flex: 1,
  },
  deliveryBoyLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  deliveryBoyName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressSection: {
    marginBottom: 24,
  },
  addressItem: {
    flexDirection: 'row',
    gap: 12,
  },
  addressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  addressDotDestination: {
    backgroundColor: Colors.success,
  },
  addressConnector: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  viewDetailsButton: {
    backgroundColor: Colors.secondary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  viewDetailsButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  backToHomeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToHomeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
