import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "@/constants/api";

interface LeaveRequest {
  id: string;
  days: number;
  reason?: string;
  status: string;
  startDate: string;
  endDate: string;
  employee: { firstName: string; lastName: string; employeeId: string };
  leaveType: { name: string };
}

const STATUS_COLORS: Record<string, string> = { APPROVED: "#10b981", REJECTED: "#ef4444", PENDING: "#f59e0b" };
const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

export default function LeaveScreen() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const params = filter !== "ALL" ? `?status=${filter}` : "";
    const json = await apiFetch(`/api/leave/requests${params}`);
    if (json.success) setRequests(json.data.requests ?? []);
    setLoading(false);
    setRefreshing(false);
  }, [filter]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

  async function approve(id: string) {
    await apiFetch(`/api/leave/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "APPROVED" }),
    });
    fetchData();
  }

  async function reject(id: string) {
    await apiFetch(`/api/leave/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "REJECTED" }),
    });
    fetchData();
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#3b82f6" /></View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <LeaveCard request={item} onApprove={() => approve(item.id)} onReject={() => reject(item.id)} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#3b82f6" />}
          ListEmptyComponent={<Text style={styles.emptyText}>No leave requests found</Text>}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

function LeaveCard({ request, onApprove, onReject }: { request: LeaveRequest; onApprove: () => void; onReject: () => void }) {
  const statusColor = STATUS_COLORS[request.status] ?? "#64748b";
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empName}>{request.employee.firstName} {request.employee.lastName}</Text>
          <Text style={styles.empId}>{request.employee.employeeId}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor + "22", borderColor: statusColor }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{request.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={14} color="#64748b" />
        <Text style={styles.infoText}>{request.leaveType.name} — {request.days} days</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={14} color="#64748b" />
        <Text style={styles.infoText}>
          {new Date(request.startDate).toLocaleDateString()} → {new Date(request.endDate).toLocaleDateString()}
        </Text>
      </View>
      {request.reason && (
        <Text style={styles.reason}>{request.reason}</Text>
      )}

      {request.status === "PENDING" && (
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={onApprove} style={[styles.actionBtn, { backgroundColor: "#10b981" + "22", borderColor: "#10b981" }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
            <Text style={[styles.actionText, { color: "#10b981" }]}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onReject} style={[styles.actionBtn, { backgroundColor: "#ef4444" + "22", borderColor: "#ef4444" }]}>
            <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
            <Text style={[styles.actionText, { color: "#ef4444" }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  filterRow: { flexDirection: "row", padding: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  filterBtnActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  filterText: { color: "#64748b", fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: "#fff" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 40 },
  card: { backgroundColor: "#1e293b", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#334155" },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  empName: { color: "#f1f5f9", fontSize: 14, fontWeight: "700" },
  empId: { color: "#475569", fontSize: 11, marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  infoText: { color: "#94a3b8", fontSize: 12 },
  reason: { color: "#64748b", fontSize: 11, marginTop: 8, fontStyle: "italic" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  actionText: { fontSize: 13, fontWeight: "700" },
});
