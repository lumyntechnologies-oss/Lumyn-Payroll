import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { apiFetch } from "@/constants/api";

interface ProfileData {
  name: string;
  role: string;
  employeeId: string;
  department: string;
}

interface DashboardData {
  kpi: {
    totalEmployees: number;
    pendingLeave: number;
    advancesOutstanding: number;
  };
}

interface MenuSection {
  title: string;
  items: { icon: string; label: string; subtitle?: string; danger?: boolean }[];
}

const SECTIONS: MenuSection[] = [
  {
    title: "Account",
    items: [
      { icon: "person-outline", label: "Profile Settings", subtitle: "Update your information" },
      { icon: "notifications-outline", label: "Notifications", subtitle: "Manage notification preferences" },
      { icon: "lock-closed-outline", label: "Security", subtitle: "Password and 2FA" },
    ],
  },
  {
    title: "Company",
    items: [
      { icon: "business-outline", label: "Organization Settings", subtitle: "Manage company info" },
      { icon: "people-outline", label: "HR Policies", subtitle: "Leave, attendance policies" },
      { icon: "document-text-outline", label: "Documents", subtitle: "Company documents" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle-outline", label: "Help & Support", subtitle: "FAQ and contact support" },
      { icon: "information-circle-outline", label: "About Lumyn Payroll", subtitle: "Version 1.0.0" },
      { icon: "log-out-outline", label: "Sign Out", danger: true },
    ],
  },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadData() {
    setError(false);
    try {
      const [profileRes, dashboardRes] = await Promise.all([
        apiFetch("/api/profile"),
        apiFetch("/api/dashboard"),
      ]);

      if (profileRes.success) {
        setProfile(profileRes.data);
      }

      if (dashboardRes.success) {
        // Map dashboard KPIs to stats (dynamic from DB)
        setStats([
          { label: "Total Employees", value: dashboardRes.data.kpi.totalEmployees.toString(), icon: "people" },
          { label: "Pending Leave", value: dashboardRes.data.kpi.pendingLeave.toString(), icon: "calendar" },
          { label: "Outstanding Advances", value: `KES ${(dashboardRes.data.kpi.advancesOutstanding / 1000).toFixed(0)}K`, icon: "wallet" },
        ]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return (names[0]?.[0] || "") + (names[1]?.[0] || "");
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: "#0f172a" }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.centered, { backgroundColor: "#0f172a" }]}>
        <Ionicons name="warning-outline" size={48} color="#f59e0b" />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryBtn}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
        </View>
        <View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.role}>{profile.role}</Text>
          <Text style={styles.department}>{profile.department} · {profile.employeeId}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map(stat => {
          const Icon = stat.icon as React.ComponentProps<typeof Ionicons>["name"];
          return (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={Icon} size={18} color="#3b82f6" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {SECTIONS.map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, idx) => {
              const Icon = item.icon as React.ComponentProps<typeof Ionicons>["name"];
              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => item.danger && Alert.alert("Sign Out", "Are you sure you want to sign out?", [{ text: "Cancel" }, { text: "Sign Out", style: "destructive" }])}
                  style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.danger ? "#ef444422" : "#1e293b" }]}>
                    <Ionicons name={Icon} size={18} color={item.danger ? "#ef4444" : "#3b82f6"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, item.danger && { color: "#ef4444" }]}>{item.label}</Text>
                    {item.subtitle && <Text style={styles.menuSub}>{item.subtitle}</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#334155" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <Text style={styles.version}>Lumyn Payroll v1.0.0 · Built for Kenyan SMBs</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  errorText: { color: "#f1f5f9", fontSize: 16, fontWeight: "700", textAlign: "center" },
  retryBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "#1e293b", borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#334155" },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  name: { color: "#f1f5f9", fontSize: 18, fontWeight: "800" },
  role: { color: "#3b82f6", fontSize: 13, fontWeight: "600", marginTop: 2 },
  department: { color: "#64748b", fontSize: 12, marginTop: 1 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#1e293b", borderRadius: 14, padding: 12, alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#334155" },
  statValue: { color: "#f1f5f9", fontSize: 20, fontWeight: "800" },
  statLabel: { color: "#64748b", fontSize: 10, fontWeight: "600", textAlign: "center" },
  section: { marginBottom: 16 },
  sectionTitle: { color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: "#1e293b", borderRadius: 18, borderWidth: 1, borderColor: "#334155", overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#334155" },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { color: "#f1f5f9", fontSize: 14, fontWeight: "600" },
  menuSub: { color: "#64748b", fontSize: 11, marginTop: 1 },
  version: { color: "#334155", fontSize: 11, textAlign: "center", marginTop: 8 },
});

