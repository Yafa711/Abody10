import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { ROUTES } from '../utils/constants';
import { CartContext } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = React.lazy(() => import('../screens/HomeScreen'));
const ProductListScreen = React.lazy(() => import('../screens/ProductListingScreen'));
const ProductDetailsScreen = React.lazy(() => import('../screens/ProductDetailScreen'));
const CartScreen = React.lazy(() => import('../screens/CartScreen'));
const ProfileScreen = React.lazy(() => import('../screens/ProfileScreen'));
const OrderScreen = React.lazy(() => import('../screens/orders/OrderScreen'));
const OrderDetailScreen = React.lazy(() => import('../screens/orders/OrderDetailScreen'));
const SettingsScreen = React.lazy(() => import('../screens/SettingsScreen'));
const FavoriesScreen = React.lazy(() => import('../screens/favorites/FavoritesScreen'));
const AddressScreen = React.lazy(() => import('../screens/addresses/AddressScreen'));
const PaymentScreen = React.lazy(() => import('../screens/payments/PaymentScreen'));
const SearchScreen = React.lazy(() => import('../screens/SearchScreen'));
const AdminDashboardScreen = React.lazy(() => import('../screens/admin/AdminDashboard'));
const ProductManagementScreen = React.lazy(() => import('../screens/admin/ProductManagement'));
const OrderManagementScreen = React.lazy(() => import('../screens/admin/OrderManagement'));
const ProductEditorScreen = React.lazy(() => import('../screens/admin/ProductEditorScreen'));
const CategoriesAdminScreen = React.lazy(() => import('../screens/admin/CategoriesAdminScreen'));
const CouponsAdminScreen = React.lazy(() => import('../screens/admin/CouponsAdminScreen'));
const CustomersAdminScreen = React.lazy(() => import('../screens/admin/CustomersAdminScreen'));
const ShippingAdminScreen = React.lazy(() => import('../screens/admin/ShippingAdminScreen'));

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Stack.Screen name={ROUTES.PRODUCT_LIST} component={ProductListScreen} />
      <Stack.Screen name={ROUTES.PRODUCT_DETAILS} component={ProductDetailsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

function CartStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.CART} component={CartScreen} />
      <Stack.Screen name={ROUTES.CHECKOUT} component={PaymentScreen} />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <Stack.Screen name={ROUTES.ORDER_HISTORY} component={OrderScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.ADDRESS} component={AddressScreen} />
      <Stack.Screen name={ROUTES.ADMIN_DASHBOARD} component={AdminDashboardScreen} />
      <Stack.Screen name={ROUTES.PRODUCT_MANAGEMENT} component={ProductManagementScreen} />
      <Stack.Screen name={ROUTES.ORDER_MANAGEMENT} component={OrderManagementScreen} />
      <Stack.Screen name={ROUTES.PRODUCT_EDITOR} component={ProductEditorScreen} />
      <Stack.Screen name={ROUTES.CATEGORIES_ADMIN} component={CategoriesAdminScreen} />
      <Stack.Screen name={ROUTES.COUPONS_ADMIN} component={CouponsAdminScreen} />
      <Stack.Screen name={ROUTES.CUSTOMERS_ADMIN} component={CustomersAdminScreen} />
      <Stack.Screen name={ROUTES.SHIPPING_ADMIN} component={ShippingAdminScreen} />
    </Stack.Navigator>
  );
}

function FavoritesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.FAVORITES} component={FavoriesScreen} />
      <Stack.Screen name={ROUTES.PRODUCT_DETAILS} component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAdmin } = useAuth();
  const { itemCount } = useContext(CartContext) || {};
  const badgeCount = itemCount || 0;

  const tabBarStyle = {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6D28D9',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: route.name === 'AdminTab' ? { ...tabBarStyle, display: isAdmin ? 'flex' : 'none' } : tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 11,
        },
        tabBarIconStyle: {
          width: 24,
          height: 24,
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.CART}
        component={CartStackNavigator}
        options={{
          tabBarLabel: 'العربة',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" color={color} size={size} />
          ),
          tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#D4A853',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      />
      <Tab.Screen
        name={ROUTES.FAVORITES}
        component={FavoritesStackNavigator}
        options={{
          tabBarLabel: 'المفضلة',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'الملف الشخصي',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={ProfileStackNavigator}
          options={{
            tabBarLabel: 'المشرف',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield-outline" color={color} size={size} />
            ),
            tabBarStyle: {
              ...tabBarStyle,
            },
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate(ROUTES.PROFILE, { screen: ROUTES.ADMIN_DASHBOARD });
            },
          })}
        />
      )}
    </Tab.Navigator>
  );
}
