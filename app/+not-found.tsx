import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../theme/colors';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Feather name="alert-triangle" size={48} color={theme.accent} style={styles.icon} />
        <Text style={[styles.title, { color: theme.text }]}>Screen not found</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={[styles.linkText, { color: theme.primary }]}>Return to IdeaForge</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_800ExtraBold',
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
  },
  linkText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
