import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "@/constants/api";

interface WalletBalance {
  walletId: string;
  balance: number;
  currency: string;
  lastTopupAt?: string;
}

interface Transaction {
  id: string;
  type: "TOPUP" | "WITHDRAWAL" | "DISBURSEMENT" | "REFUND" | "ADJUSTMENT";
  amount: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  description?: string;
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
}

const TRANSACTION_ICONS: Record<string, string> = {
  TOPUP: "arrow-up",
  WITHDRAWAL: "arrow-down",
  DISBURSEMENT: "arrow-down",
  REFUND: "refresh",
  ADJUSTMENT: "create",
};

const TRANSACTION_COLORS: Record<string, string> = {
  TOPUP: "#10b981",
  WITHDRAWAL: "#ef4444",
  DISBURSEMENT: "#ef4444",
  REFUND: "#3b82f6",
  ADJUSTMENT: "#8b5cf6",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PROCESSING: "#3b82f6",
  SUCCESS: "#10b981",
  FAILED: "#ef4444",
};

export default function WalletScreen() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

  async function loadData() {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        apiFetch("/api/wallet/balance"),
        apiFetch("/api/wallet/transactions?limit=10"),
      ]);

      if (balanceRes.success) setBalance(balanceRes.data);
      if (transactionsRes.success) setTransactions(transactionsRes.data?.transactions || []);
    } catch (error) {
      console.error("Failed to load wallet:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) return;

    try {
      setTopupLoading(true);
      const res = await apiFetch("/api/wallet/topup", {
        method: "POST",
        body: JSON.stringify({ amount: parseFloat(topupAmount) }),
      });

      if (res.success && res.data?.url) {
        // In a real app, you'd open the URL in a browser
        console.log("Redirect to:", res.data.url);
        setTopupAmount("");
        loadData();
      }
    } catch (error) {
      console.error("Topup failed:", error);
    } finally {
      setTopupLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
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
        <Text style={styles.headerTitle}>My Wallet</Text>
        <Text style={styles.headerSub}>Manage your funds</Text>
      </View>

      {/* Balance Card */}
      {balance && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Ionicons name="wallet" size={24} color="rgba(255,255,255,0.3)" />
          </View>
          <Text style={styles.balanceValue}>
            {balance.currency} {balance.balance.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          {balance.lastTopupAt && (
            <Text style={styles.balanceSub}>
              Last top-up: {new Date(balance.lastTopupAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Top-up Section */}
      <View style={styles.topupCard}>
        <Text style={styles.topupTitle}>Add Money</Text>
        <Text style={styles.topupSub}>Fund your wallet via Pesapal</Text>
        
        <View style={styles.topupInputContainer}>
          <Text style={styles.topupCurrency}>KES</Text>
          <TextInput
            style={styles.topupInput}
            value={topupAmount}
            onChangeText={setTopupAmount}
            placeholder="Enter amount"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
          />
        </View>
        
        <Text style={styles.topupHint}>Min: 100 KES | Max: 1,000,000 KES</Text>
        
        <TouchableOpacity style={styles.topupButton} onPress={handleTopup} disabled={topupLoading || !topupAmount}>
          {topupLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.topupButtonText}>Top-up with Pesapal</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#334155" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((txn) => (
            <View key={txn.id} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: (TRANSACTION_COLORS[txn.type] || "#64748b") + "22" }]}>
                  <Ionicons name={TRANSACTION_ICONS[txn.type] as any} size={20} color={TRANSACTION_COLORS[txn.type] || "#64748b"} />
                </View>
                <View>
                  <Text style={styles.transactionType}>{txn.type}</Text>
                  <Text style={styles.transactionDate}>{formatDate(txn.createdAt)}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: txn.type === "TOPUP" || txn.type === "REFUND" ? "#10b981" : "#ef4444" }]}>
                  {txn.type === "TOPUP" || txn.type === "REFUND" ? "+" : "-"}
                  {txn.amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[txn.status] || "#64748b") + "22" }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[txn.status] || "#64748b" }]}>{txn.status}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: "card", label: "Top Up", color: "#3b82f6" },
            { icon: "send", label: "Transfer", color: "#10b981" },
            { icon: "receipt", label: "Statement", color: "#8b5cf6" },
            { icon: "help-circle", label: "Support", color: "#f59e0b" },
          ].map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + "22" }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
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
  balanceCard: { backgroundColor: "#3b82f6", borderRadius: 20, padding: 20, marginBottom: 16 },
  balanceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  balanceValue: { color: "#fff", fontSize: 32, fontWeight: "900", marginBottom: 4 },
  balanceSub: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  topupCard: { backgroundColor: "#1e293b", borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#334155" },
  topupTitle: { color: "#f1f5f9", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  topupSub: { color: "#64748b", fontSize: 12, marginBottom: 16 },
  topupInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 12, paddingHorizontal: 12, marginBottom: 8 },
  topupCurrency: { color: "#64748b", fontSize: 16, fontWeight: "600", marginRight: 8 },
  topupInput: { flex: 1, color: "#f1f5f9", fontSize: 16, paddingVertical: 12 },
  topupHint: { color: "#64748b", fontSize: 11, marginBottom: 12 },
  topupButton: { backgroundColor: "#3b82f6", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  topupButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  section: { marginBottom: 20 },
  sectionTitle: { color: "#94a3b8", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  emptyContainer: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyText: { color: "#64748b", fontSize: 14, marginTop: 8 },
  transactionCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  transactionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  transactionType: { color: "#f1f5f9", fontSize: 14, fontWeight: "600", textTransform: "capitalize" },
  transactionDate: { color: "#64748b", fontSize: 12, marginTop: 2 },
  transactionRight: { alignItems: "flex-end" },
  transactionAmount: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: "700" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionButton: { flex: 1, minWidth: "45%", backgroundColor: "#1e293b", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  actionLabel: { color: "#f1f5f9", fontSize: 12, fontWeight: "600" },
});
