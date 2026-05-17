import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { token, setToken, setUser, isAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(!token);

  useEffect(() => {
    if (token) { setChecking(false); return; }
    const restore = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('vuka_token');
        const storedUser = await AsyncStorage.getItem('vuka_user');
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } catch {
        // ignore
      } finally {
        setChecking(false);
      }
    };
    restore();
  }, []);

  if (checking) {
    return <View style={{ flex: 1, backgroundColor: colors.bg.primary }} />;
  }

  return isAuthenticated ? <Redirect href="/(main)" /> : <Redirect href="/(auth)" />;
}
