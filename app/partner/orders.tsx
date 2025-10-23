import { useRouter } from 'expo-router';
import { Package, RefreshCw, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { Order } from '@/constants/mockData';
import { API_URL } from '@/constants/api';
import { getToken } from '@/app/utils/token';

type FilterType = 'all' | 'pending' | 'picked_up' | 'on_the_way' | 'delivered';

export default function OrdersListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        console.warn('Failed to fetch orders', res.status);
        setOrders([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('fetchOrders error', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return Colors.success;
      case 'on_the_way':
      case 'picked_up':
        return Colors.primary;
      case 'pending':
        return Colors.warning;
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

  const renderOrderCard = ({ item }: { item: Order }) => (
    <Pressable
      style={({ pressed }) => [
        styles.orderCard,
        pressed && styles.orderCardPressed,
      ]}
  onPress={() => router.push(`/partner/order-details?id=${(item as any)._id || item.id}`)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderCodeSection}>
          <View style={styles.packageIcon}>
            <Package size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.orderCodeLabel}>Order Code</Text>
            <Text style={styles.orderCode}>#{item.code}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.customerSection}>
        <Text style={styles.customerLabel}>Customer</Text>
        <Text style={styles.customerName}>{item.customerName}</Text>
      </View>

      <View style={styles.addressSection}>
        <MapPin size={16} color={Colors.textSecondary} />
        <Text style={styles.addressText} numberOfLines={1}>
          {item.deliveryAddress}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.etaText}>ETA: {item.eta}</Text>
        <Pressable style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>My Orders</Text>
        <Pressable
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <RefreshCw size={24} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.filtersContainer}>
        {(['all', 'pending', 'picked_up', 'on_the_way', 'delivered'] as FilterType[]).map(
          (filterType) => (
            <Pressable
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === filterType && styles.filterTextActive,
                ]}
              >
                {filterType === 'all'
                  ? 'All'
                  : getStatusText(filterType)}
              </Text>
            </Pressable>
          )
        )}
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => (item as any)._id || item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderCodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  packageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCodeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  customerSection: {
    marginBottom: 12,
  },
  customerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  viewButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});
