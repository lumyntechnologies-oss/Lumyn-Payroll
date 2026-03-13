import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JN</Text>
        </View>
        <View>
          <Text style={styles.name}>Jane Njoroge</Text>
          <Text style={styles.role}>HR Manager</Text>
          <Text style={styles.company}>Lumyn Technologies Ltd</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Reports Today", value: "3", icon: "document" },
          { label: "Tasks Done", value: "12", icon: "checkmark-circle" },
          { label: "Pending", value: "5", icon: "hourglass" },
        ].map(stat => {
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
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "#1e293b", borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#334155" },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  name: { color: "#f1f5f9", fontSize: 18, fontWeight: "800" },
  role: { color: "#3b82f6", fontSize: 13, fontWeight: "600", marginTop: 2 },
  company: { color: "#64748b", fontSize: 12, marginTop: 1 },
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
