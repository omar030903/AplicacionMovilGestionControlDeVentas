import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { CreditCard, Package, ChartBar as BarChart3, StickyNote } from 'lucide-react-native';

function LogoTitle() {
  return (
    <View style={styles.logoContainer}>
      <View style={styles.logoIcon}>
        <CreditCard color="#ffffff" size={20} />
      </View>
      <Text style={styles.logoText}>Finanzas</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1e40af',
        },
        headerTintColor: '#ffffff',
        headerTitle: () => <LogoTitle />,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter-SemiBold',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cuentas',
          tabBarIcon: ({ color, size }) => (
            <CreditCard color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <Package color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="registry"
        options={{
          title: 'Registro',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notas',
          tabBarIcon: ({ color, size }) => (
            <StickyNote color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
});