import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "@/constants/api";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  status: string;
  department: { name: string };
  employmentType: string;
}

const STATUS_COLORS: Record<string, string> = { ACTIVE: "#10b981", ON_LEAVE: "#f59e0b", SUSPENDED: "#f59e0b", TERMINATED: "#ef4444" };

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (p = 1, reset = true) => {
    if (reset) setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "20", ...(search ? { search } : {}) });
    const json = await apiFetch(`/api/employees?${params}`);
    if (json.success) {
      const newEmps = json.data.employees as Employee[];
      setEmployees(prev => reset ? newEmps : [...prev, ...newEmps]);
      setTotal(json.data.pagination.total);
      setTotalPages(json.data.pagination.totalPages);
      setPage(p);
    }
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, [search]);

  useEffect(() => { fetchData(1, true); }, [fetchData]);

  function loadMore() {
    if (page < totalPages && !loadingMore) {
      setLoadingMore(true);
      fetchData(page + 1, false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={text => { setSearch(text); }}
          returnKeyType="search"
          onSubmitEditing={() => fetchData(1, true)}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.countText}>{total} employees</Text>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color="#3b82f6" size="large" /></View>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EmployeeCard employee={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(1, true); }} tintColor="#3b82f6" />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color="#3b82f6" style={{ margin: 16 }} /> : null}
          ListEmptyComponent={<Text style={styles.emptyText}>No employees found</Text>}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}

function EmployeeCard({ employee }: { employee: Employee }) {
  const initials = (employee.firstName[0] ?? "") + (employee.lastName[0] ?? "");
  const statusColor = STATUS_COLORS[employee.status] ?? "#64748b";
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.empName}>{employee.firstName} {employee.lastName}</Text>
        <Text style={styles.empJob}>{employee.jobTitle}</Text>
        <Text style={styles.empDept}>{employee.department.name}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22", borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{employee.status.replace("_", " ")}</Text>
        </View>
        <Text style={styles.empId}>{employee.employeeId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1e293b", margin: 16, marginBottom: 8,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "#334155",
  },
  searchInput: { flex: 1, color: "#f1f5f9", fontSize: 14 },
  countText: { color: "#64748b", fontSize: 12, fontWeight: "600", marginHorizontal: 16, marginBottom: 4 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#1e293b", borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: "#334155",
  },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  empName: { color: "#f1f5f9", fontSize: 14, fontWeight: "700" },
  empJob: { color: "#94a3b8", fontSize: 12, marginTop: 1 },
  empDept: { color: "#64748b", fontSize: 11, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "700" },
  empId: { color: "#475569", fontSize: 10, fontFamily: "monospace" ?? undefined },
});
