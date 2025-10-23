import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
} from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import io from 'socket.io-client';

import Colors from '@/constants/colors';
import { Order, StatusUpdate } from '@/constants/mockData';
import { API_URL } from '@/constants/api';

export default function StatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!code) return;
      try {
        const res = await fetch(`${API_URL}/api/orders/code/${code}`);
        if (!res.ok) return;
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error('fetchOrder error', err);
      }
    };
    fetchOrder();
  }, [code]);

  useEffect(() => {
    if (order) {
      socketRef.current = io(API_URL);
      socketRef.current.emit('joinOrder', (order as any)._id || order.id);

      socketRef.current.on('locationUpdate', (location: { latitude: number; longitude: number }) => {
        setPartnerLocation(location);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [order]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'clock':
        return Clock;
      case 'package':
        return Package;
      case 'truck':
        return Truck;
      case 'check-circle':
        return CheckCircle;
      default:
        return Clock;
    }
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
          <Text style={styles.title}>Order Status</Text>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Order Number</Text>
              <Text style={styles.orderNumber}>#{order.code}</Text>
            </View>
            <View style={styles.itemsInfo}>
              <Text style={styles.itemsLabel}>Items</Text>
              <Text style={styles.itemsText}>{order.items}</Text>
            </View>
          </View>

          {order.weight && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailValue}>{order.weight}</Text>
            </View>
          )}

          {order.instructions && (
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsLabel}>Instructions</Text>
              <Text style={styles.instructionsText}>{order.instructions}</Text>
            </View>
          )}
        </View>

        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>Delivery Timeline</Text>

          <View style={styles.timeline}>
            {order.statusHistory.map((status: StatusUpdate, index: number) => {
              const IconComponent = getIconComponent(status.icon);
              const isLast = index === order.statusHistory.length - 1;

              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeftSection}>
                    <View style={styles.iconCircle}>
                      <IconComponent size={20} color={Colors.primary} />
                    </View>
                    {!isLast && <View style={styles.timelineConnector} />}
                  </View>

                  <View style={styles.timelineContent}>
                    <View style={styles.statusCard}>
                      <Text style={styles.statusTitle}>{status.status}</Text>
                      <Text style={styles.statusTime}>{status.timestamp}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
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
    paddingBottom: 24,
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
  orderCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  itemsInfo: {
    alignItems: 'flex-end',
  },
  itemsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  itemsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  instructionsCard: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  timelineContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 20,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineLeftSection: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  statusCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 14,
    color: Colors.textSecondary,
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
