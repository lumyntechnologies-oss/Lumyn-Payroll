import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "@/constants/api";

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: string;
  overtime: number;
}

interface TodayStatus {
  clockedIn: boolean;
  clockInTime?: string;
  clockOutTime?: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "#10b981",
  ABSENT: "#ef4444",
  LATE: "#f59e0b",
  HALF_DAY: "#8b5cf6",
  ON_LEAVE: "#3b82f6",
};

const STATUS_ICONS: Record<string, string> = {
  PRESENT: "checkmark-circle",
  ABSENT: "close-circle",
  LATE: "time",
  HALF_DAY: "remove-circle",
  ON_LEAVE: "calendar",
};

export default function AttendanceScreen() {
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    try {
      const [todayRes, historyRes] = await Promise.all([
        apiFetch("/api/attendance/today"),
        apiFetch("/api/attendance/history?limit=10"),
      ]);

      if (todayRes.success) setTodayStatus(todayRes.data);
      if (historyRes.success) setHistory(historyRes.data || []);
    } catch (error) {
      console.error("Failed to load attendance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      const res = await apiFetch("/api/attendance/clock-in", { method: "POST" });
      if (res.success) {
        loadData();
      }
    } catch (error) {
      console.error("Clock in failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      const res = await apiFetch("/api/attendance/clock-out", { method: "POST" });
      if (res.success) {
        loadData();
      }
    } catch (error) {
      console.error("Clock out failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: "#0f172a" }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#3b82f6" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text style={styles.headerSub}>Track your work hours</Text>
      </View>

      {/* Today's Status */}
      <View style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <Text style={styles.todayTitle}>Today</Text>
          <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[todayStatus?.status || "ABSENT"] || "#64748b") + "22" }]}>
            <Ionicons name={STATUS_ICONS[todayStatus?.status || "ABSENT"] as any} size={16} color={STATUS_COLORS[todayStatus?.status || "ABSENT"] || "#64748b"} />
            <Text style={[styles.statusText, { color: STATUS_COLORS[todayStatus?.status || "ABSENT"] || "#64748b" }]}>
              {todayStatus?.status || "Not Clocked In"}
            </Text>
          </View>
        </View>

        <View style={styles.timeGrid}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Clock In</Text>
            <Text style={styles.timeValue}>{formatTime(todayStatus?.clockInTime)}</Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Clock Out</Text>
            <Text style={styles.timeValue}>{formatTime(todayStatus?.clockOutTime)}</Text>
          </View>
        </View>

        {!todayStatus?.clockedIn ? (
          <TouchableOpacity style={styles.clockButton} onPress={handleClockIn} disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in" size={20} color="#fff" />
                <Text style={styles.clockButtonText}>Clock In</Text>
              </>
            )}
          </TouchableOpacity>
        ) : !todayStatus?.clockOutTime ? (
          <TouchableOpacity style={[styles.clockButton, { backgroundColor: "#ef4444" }]} onPress={handleClockOut} disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-out" size={20} color="#fff" />
                <Text style={styles.clockButtonText}>Clock Out</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.completedText}>Day Completed</Text>
          </View>
        )}
      </View>

      {/* History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent History</Text>
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#334155" />
            <Text style={styles.emptyText}>No attendance records yet</Text>
          </View>
        ) : (
          history.map((record) => (
            <View key={record.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={[styles.historyIcon, { backgroundColor: (STATUS_COLORS[record.status] || "#64748b") + "22" }]}>
                  <Ionicons name={STATUS_ICONS[record.status] as any} size={20} color={STATUS_COLORS[record.status] || "#64748b"} />
                </View>
                <View>
                  <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
                  <Text style={styles.historyStatus}>{record.status.replace("_", " ")}</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyTime}>{formatTime(record.clockIn)} - {formatTime(record.clockOut)}</Text>
                {record.overtime > 0 && (
                  <Text style={styles.overtimeText}>+{record.overtime.toFixed(1)}h OT</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.statsGrid}>
          {[
            { label: "Present", value: history.filter(r => r.status === "PRESENT").length, color: "#10b981" },
            { label: "Late", value: history.filter(r => r.status === "LATE").length, color: "#f59e0b" },
            { label: "Absent", value: history.filter(r => r.status === "ABSENT").length, color: "#ef4444" },
            { label: "Overtime", value: history.reduce((sum, r) => sum + r.overtime, 0).toFixed(1) + "h", color: "#8b5cf6" },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  header: { marginBottom: 16 },
  headerTitle: { color: "#f1f5f9", fontSize: 28, fontWeight: "800" },
  headerSub: { color: "#64748b", fontSize: 14, marginTop: 4 },
  todayCard: { backgroundColor: "#1e293b", borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#334155" },
  todayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  todayTitle: { color: "#f1f5f9", fontSize: 18, fontWeight: "700" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },
  timeGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  timeItem: { flex: 1, backgroundColor: "#0f172a", borderRadius: 12, padding: 12 },
  timeLabel: { color: "#64748b", fontSize: 11, fontWeight: "600", marginBottom: 4 },
  timeValue: { color: "#f1f5f9", fontSize: 20, fontWeight: "800" },
  clockButton: { backgroundColor: "#3b82f6", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  clockButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  completedBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14 },
  completedText: { color: "#10b981", fontSize: 16, fontWeight: "700" },
  section: { marginBottom: 20 },
  sectionTitle: { color: "#94a3b8", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { color: "#64748b", fontSize: 14, marginTop: 8 },
  historyCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  historyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  historyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  historyDate: { color: "#f1f5f9", fontSize: 14, fontWeight: "600" },
  historyStatus: { color: "#64748b", fontSize: 12, marginTop: 2 },
  historyRight: { alignItems: "flex-end" },
  historyTime: { color: "#f1f5f9", fontSize: 14, fontWeight: "600" },
  overtimeText: { color: "#8b5cf6", fontSize: 12, marginTop: 2 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 14, flex: 1, minWidth: "45%", borderWidth: 1, borderColor: "#334155" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { color: "#64748b", fontSize: 11, marginTop: 2, fontWeight: "600" },
});
