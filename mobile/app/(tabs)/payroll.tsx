import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "@/constants/api";

interface PayrollRun {
  id: string;
  month: number;
  year: number;
  status: string;
  totalGross: number;
  totalTax: number;
  totalNet: number;
  _count: { entries: number };
}

interface PayrollEntry {
  id: string;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  employee: { firstName: string; lastName: string; department: { name: string } };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLORS: Record<string, string> = { DRAFT: "#f59e0b", APPROVED: "#10b981", DISBURSED: "#3b82f6" };

export default function PayrollScreen() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadRuns() {
    const json = await apiFetch("/api/payroll/runs");
    if (json.success && json.data.runs.length > 0) {
      setRuns(json.data.runs);
      selectRun(json.data.runs[0]);
    }
    setLoading(false);
    setRefreshing(false);
  }

  async function selectRun(run: PayrollRun) {
    setSelectedRun(run);
    setEntriesLoading(true);
    const json = await apiFetch(`/api/payroll/entries?payrollRunId=${run.id}`);
    if (json.success) setEntries(json.data);
    setEntriesLoading(false);
  }

  useEffect(() => { loadRuns(); }, []);

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color="#3b82f6" /></View>
  );

  return (
    <ScrollView
      style={{ backgroundColor: "#0f172a" }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRuns(); }} tintColor="#3b82f6" />}
    >
      {runs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cash-outline" size={48} color="#334155" />
          <Text style={styles.emptyText}>No payroll runs yet</Text>
          <Text style={styles.emptySub}>Create a payroll run from the web dashboard</Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {runs.map(run => (
                <TouchableOpacity key={run.id} onPress={() => selectRun(run)}
                  style={[styles.runTab, selectedRun?.id === run.id && styles.runTabActive]}>
                  <Text style={[styles.runTabText, selectedRun?.id === run.id && styles.runTabTextActive]}>
                    {MONTHS[run.month - 1]} {run.year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {selectedRun && (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.runTitle}>{MONTHS[selectedRun.month - 1]} {selectedRun.year} Payroll</Text>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[selectedRun.status] ?? "#64748b") + "22", borderColor: STATUS_COLORS[selectedRun.status] ?? "#64748b" }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[selectedRun.status] ?? "#64748b" }]}>{selectedRun.status}</Text>
                </View>
              </View>

              <View style={styles.summaryGrid}>
                {[
                  { label: "Gross Payroll", value: `KES ${(selectedRun.totalGross / 1000000).toFixed(2)}M`, color: "#3b82f6" },
                  { label: "Tax Deductions", value: `KES ${(selectedRun.totalTax / 1000).toFixed(0)}K`, color: "#ef4444" },
                  { label: "Net Payout", value: `KES ${(selectedRun.totalNet / 1000000).toFixed(2)}M`, color: "#10b981" },
                  { label: "Employees", value: String(selectedRun._count.entries), color: "#8b5cf6" },
                ].map(item => (
                  <View key={item.label} style={styles.summaryCard}>
                    <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Payroll Register</Text>
              {entriesLoading ? (
                <ActivityIndicator color="#3b82f6" style={{ margin: 20 }} />
              ) : entries.map(entry => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryAvatar}>
                    <Text style={styles.entryAvatarText}>{entry.employee.firstName[0]}{entry.employee.lastName[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryName}>{entry.employee.firstName} {entry.employee.lastName}</Text>
                    <Text style={styles.entryDept}>{entry.employee.department.name}</Text>
                    <View style={styles.entryBreakdown}>
                      <Text style={styles.entrySmall}>Basic: {entry.basicSalary.toLocaleString()}</Text>
                      <Text style={styles.entrySmall}>PAYE: {entry.paye.toFixed(0)}</Text>
                      <Text style={styles.entrySmall}>NSSF: {entry.nssf.toFixed(0)}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.entryNet}>KES {entry.netSalary.toFixed(0)}</Text>
                    <Text style={styles.entryNetLabel}>Net Pay</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyText: { color: "#94a3b8", fontSize: 16, fontWeight: "700" },
  emptySub: { color: "#475569", fontSize: 13, textAlign: "center" },
  runTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  runTabActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  runTabText: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  runTabTextActive: { color: "#fff" },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  runTitle: { color: "#f1f5f9", fontSize: 18, fontWeight: "800" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: "700" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  summaryCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 14, flex: 1, minWidth: "45%", borderWidth: 1, borderColor: "#334155" },
  summaryValue: { fontSize: 18, fontWeight: "800" },
  summaryLabel: { color: "#64748b", fontSize: 11, marginTop: 2, fontWeight: "600" },
  sectionTitle: { color: "#94a3b8", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  entryCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  entryAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center" },
  entryAvatarText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  entryName: { color: "#f1f5f9", fontSize: 13, fontWeight: "700" },
  entryDept: { color: "#64748b", fontSize: 11, marginTop: 1 },
  entryBreakdown: { flexDirection: "row", gap: 8, marginTop: 6 },
  entrySmall: { color: "#94a3b8", fontSize: 10 },
  entryNet: { color: "#10b981", fontSize: 16, fontWeight: "800" },
  entryNetLabel: { color: "#64748b", fontSize: 10, marginTop: 2 },
});
