import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '@/constants/api';
// NativeBase or Tamagui not used; using native RN

interface KPI {
  label: string;
  value: string;
  change: number;
}

interface RecentActivity {
  title: string;
  subtitle: string;
  time: string;
  type: 'payroll' | 'leave' | 'attendance';
}

export default function DashboardTab() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recent, setRecent] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [dashboardRes] = await Promise.all([
        apiFetch('/api/dashboard'),
      ]);
      if (dashboardRes.success) {
        // Mock KPIs based on response
        setKpis([
          { label: 'Balance', value: 'KES 45,200', change: 5.2 },
          { label: 'Next Pay', value: '25th', change: 0 },
          { label: 'Leave Balance', value: '12 days', change: -1 },
          { label: 'Pending Approval', value: '2', change: 1 },
        ]);
        setRecent([
          { title: 'Payroll Processed', subtitle: 'May salary disbursed', time: '2h ago', type: 'payroll' },
          { title: 'Leave Approved', subtitle: 'Annual leave 3 days', time: '1d ago', type: 'leave' },
        ]);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#3b82f6" />}
    >
      {/* Header */}
      <Text style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Dashboard</Text>

      {/* KPIs */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        {kpis.map((kpi, i) => (
          <View key={i} style={{ flex: 1, minWidth: 140, backgroundColor: '#1e293b', padding: 16, borderRadius: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>{kpi.label}</Text>
              <Ionicons name="trending-up" size={16} color={kpi.change >= 0 ? '#10b981' : '#ef4444'} />
            </View>
            <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 'bold' }}>{kpi.value}</Text>
            <Text style={{ color: kpi.change >= 0 ? '#10b981' : '#ef4444', fontSize: 12 }}>{kpi.change > 0 ? '+' : ''}{kpi.change}%</Text>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={{ backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Recent Activity</Text>
        {recent.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: i < recent.length - 1 ? 1 : 0, borderBottomColor: '#334155' }}>
            <View style={{ backgroundColor: item.type === 'payroll' ? '#3b82f6' : '#10b981', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={item.type === 'payroll' ? 'cash' : 'calendar'} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#f1f5f9', fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>{item.subtitle}</Text>
            </View>
            <Text style={{ color: '#64748b' }}>{item.time}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[
          { icon: 'people', label: 'Employees', screen: 'employees' },
          { icon: 'time', label: 'Attendance', screen: 'attendance' },
          { icon: 'wallet', label: 'Wallet', screen: 'wallet' },
        ].map((action) => (
          <View key={action.screen} style={{ flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 12, alignItems: 'center' }}>
          <Ionicons name={`${action.icon}-outline` as any} size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
            <Text style={{ color: '#f1f5f9', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>{action.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
