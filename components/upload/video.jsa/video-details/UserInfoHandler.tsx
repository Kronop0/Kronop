import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../../constants/theme';

interface UserInfoHandlerProps {
  userName?: string;
  userAvatar?: string;
  userId?: string;
}

export function UserInfoHandler({ userName, userAvatar, userId }: UserInfoHandlerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        <MaterialIcons name="person" size={16} color={theme.colors.primary.main} />
        {' '}User Information
      </Text>

      <View style={styles.userInfoCard}>
        <View style={styles.userDetail}>
          <Text style={styles.detailLabel}>Name:</Text>
          <Text style={styles.detailValue}>{userName || 'Not provided'}</Text>
        </View>

        <View style={styles.userDetail}>
          <Text style={styles.detailLabel}>User ID:</Text>
          <Text style={styles.detailValue}>{userId || 'Not provided'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  userInfoCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
  },
  userDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
