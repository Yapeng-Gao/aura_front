import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface InsightItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
}

interface AnalyticsInsightCardProps {
  insights: InsightItem[];
  title?: string;
  style?: ViewStyle;
}

const AnalyticsInsightCard: React.FC<AnalyticsInsightCardProps> = ({
  insights,
  title = '分析洞察',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <View style={[
      styles.container,
      isDarkMode && styles.containerDark,
      style
    ]}>
      {title && (
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          {title}
        </Text>
      )}
      
      {insights.map((insight) => (
        <View key={insight.id} style={styles.insightItem}>
          <View 
            style={[
              styles.iconContainer, 
              { backgroundColor: (insight.color || theme.colors.primary) + '20' }
            ]}
          >
            <Ionicons 
              name={insight.icon as any} 
              size={20} 
              color={insight.color || theme.colors.primary} 
            />
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={[styles.insightTitle, isDarkMode && styles.insightTitleDark]}>
              {insight.title}
            </Text>
            <Text style={[styles.insightDescription, isDarkMode && styles.insightDescriptionDark]}>
              {insight.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...(Platform.OS === 'ios' ? theme.shadows.ios.sm :
       Platform.OS === 'android' ? theme.shadows.android.sm :
       { elevation: 2 }),
  },
  containerDark: {
    backgroundColor: theme.dark.colors.cardBackground,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  titleDark: {
    color: theme.dark.colors.textPrimary,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  contentContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  insightTitleDark: {
    color: theme.dark.colors.textPrimary,
  },
  insightDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  insightDescriptionDark: {
    color: theme.dark.colors.textSecondary,
  },
});

export default AnalyticsInsightCard;