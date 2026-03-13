import {
  View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "@/constants/api";

interface DashboardData {
  kpi: {
    totalEmployees: number;
    activeEmployees: number;
    payrollThisMonth: number;
    pendingLeave: number;
    advancesOutstanding: number;
    complianceStatus: string;
    complianceDueCount: number;
  };
  recentNotifications: { id: string; title: string; message: string; type: string; createdAt: string }[];
  complianceAlerts: { id: string; type: string; status: string; dueDate: string }[];
}

const COLORS = {
  bg: "#0f172a",
  card: "#1e293b",
  cardBorder: "#334155",
  text: "#f1f5f9",
  muted: "#94a3b8",
  blue: "#3b82f6",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
};

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  async function loadData() {
    setError(false);
    const json = await apiFetch("/api/dashboard");
    if (json.success) setData(json.data);
    else setError(true);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: COLORS.bg }]}>
      <ActivityIndicator size="large" color={COLORS.blue} />
    </View>
  );

  if (error || !data) return (
    <View style={[styles.centered, { backgroundColor: COLORS.bg }]}>
      <Ionicons name="warning-outline" size={48} color={COLORS.amber} />
      <Text style={[styles.errorText]}>Could not load dashboard.</Text>
      <Text style={[styles.errorSub]}>Check your database connection.</Text>
      <TouchableOpacity onPress={() => { setLoading(true); loadData(); }} style={styles.retryBtn}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const kpis = [
    { label: "Total Employees", value: data.kpi.totalEmployees, icon: "people", color: COLORS.blue },
    { label: "Active", value: data.kpi.activeEmployees, icon: "person-circle", color: COLORS.green },
    { label: "Pending Leave", value: data.kpi.pendingLeave, icon: "calendar", color: COLORS.amber },
    { label: "Advances", value: `KES ${(data.kpi.advancesOutstanding / 1000).toFixed(0)}K`, icon: "wallet", color: COLORS.purple },
  ];

  const notifColors: Record<string, string> = { WARNING: COLORS.amber, SUCCESS: COLORS.green, INFO: COLORS.blue, ERROR: COLORS.red };

  return (
    <ScrollView
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.blue} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Good morning, HR 👋</Text>
        <Text style={styles.headerSub}>{new Date().toLocaleDateString("en-KE", { dateStyle: "long" })}</Text>
      </View>

      <View style={styles.payrollBanner}>
        <View>
          <Text style={styles.bannerLabel}>Payroll This Month</Text>
          <Text style={styles.bannerValue}>KES {(data.kpi.payrollThisMonth / 1000000).toFixed(2)}M</Text>
          <Text style={styles.bannerSub}>Net payout to employees</Text>
        </View>
        <Ionicons name="cash-outline" size={40} color="rgba(255,255,255,0.3)" />
      </View>

      <View style={styles.kpiGrid}>
        {kpis.map(kpi => {
          const Icon = kpi.icon as React.ComponentProps<typeof Ionicons>["name"];
          return (
            <View key={kpi.label} style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: kpi.color + "22" }]}>
                <Ionicons name={Icon} size={20} color={kpi.color} />
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Status</Text>
        <View style={[styles.complianceBadge, {
          backgroundColor: data.kpi.complianceStatus === "Compliant" ? COLORS.green + "22" : COLORS.amber + "22",
          borderColor: data.kpi.complianceStatus === "Compliant" ? COLORS.green : COLORS.amber,
        }]}>
          <Ionicons
            name={data.kpi.complianceStatus === "Compliant" ? "checkmark-circle" : "warning"}
            size={20}
            color={data.kpi.complianceStatus === "Compliant" ? COLORS.green : COLORS.amber}
          />
          <Text style={[styles.complianceText, { color: data.kpi.complianceStatus === "Compliant" ? COLORS.green : COLORS.amber }]}>
            {data.kpi.complianceStatus} — {data.kpi.complianceDueCount} due this week
          </Text>
        </View>
      </View>

      {data.recentNotifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {data.recentNotifications.map(n => (
            <View key={n.id} style={styles.notifCard}>
              <View style={[styles.notifDot, { backgroundColor: notifColors[n.type] ?? COLORS.blue }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifMsg}>{n.message}</Text>
                <Text style={styles.notifTime}>{new Date(n.createdAt).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { color: "#f1f5f9", fontSize: 16, fontWeight: "700", marginTop: 8 },
  errorSub: { color: "#94a3b8", fontSize: 13 },
  retryBtn: { marginTop: 8, backgroundColor: "#3b82f6", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  header: { marginBottom: 16 },
  headerTitle: { color: "#f1f5f9", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#64748b", fontSize: 13, marginTop: 2 },
  payrollBanner: {
    backgroundColor: "#3b82f6", borderRadius: 20, padding: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
  },
  bannerLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  bannerValue: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 2 },
  bannerSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  kpiCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 14, flex: 1, minWidth: "45%", borderWidth: 1, borderColor: "#334155" },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  kpiValue: { color: "#f1f5f9", fontSize: 22, fontWeight: "800" },
  kpiLabel: { color: "#64748b", fontSize: 11, marginTop: 2, fontWeight: "600" },
  section: { marginBottom: 16 },
  sectionTitle: { color: "#94a3b8", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  complianceBadge: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  complianceText: { fontSize: 14, fontWeight: "700" },
  notifCard: { flexDirection: "row", gap: 12, backgroundColor: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  notifTitle: { color: "#f1f5f9", fontSize: 13, fontWeight: "700" },
  notifMsg: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  notifTime: { color: "#475569", fontSize: 11, marginTop: 4 },
});
