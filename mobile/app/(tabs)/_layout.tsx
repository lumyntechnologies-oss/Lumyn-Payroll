import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TABS: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: "index", title: "Dashboard", icon: "grid-outline", activeIcon: "grid" },
  { name: "employees", title: "Employees", icon: "people-outline", activeIcon: "people" },
  { name: "payroll", title: "Payroll", icon: "cash-outline", activeIcon: "cash" },
  { name: "leave", title: "Leave", icon: "calendar-outline", activeIcon: "calendar" },
  { name: "attendance", title: "Attendance", icon: "time-outline", activeIcon: "time" },
  { name: "wallet", title: "Wallet", icon: "wallet-outline", activeIcon: "wallet" },
  { name: "profile", title: "Profile", icon: "person-outline", activeIcon: "person" },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#1e293b" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" as const, fontSize: 17 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#475569",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" as const, letterSpacing: 0.2 },
        tabBarIcon: ({ color, size, focused }) => {
          const tab = TABS.find(t => t.name === route.name);
          const iconName = focused ? (tab?.activeIcon ?? "grid") : (tab?.icon ?? "grid-outline");
          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      {TABS.map(tab => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
