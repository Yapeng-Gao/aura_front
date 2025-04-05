import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import useTranslation from '../../hooks/useTranslation';
import theme from '../../theme';

interface Achievement {
  icon: string;
  title: string;
  progress: number;
  total: number;
  unlocked: boolean;
}

interface AchievementsCardProps {
  achievements: Achievement[];
  onSeeAll: () => void;
}

const AchievementsCard: React.FC<AchievementsCardProps> = ({ achievements, onSeeAll }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Card 
      title={t('profile.myAchievements')}
      headerRight={
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
        </TouchableOpacity>
      }
      style={styles.card}
    >
      <View style={styles.achievementsContainer}>
        {achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <View style={styles.achievementHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{achievement.icon}</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={[
                  styles.achievementTitle,
                  isDarkMode && styles.achievementTitleDark
                ]}>
                  {achievement.title}
                </Text>
                
                <View style={styles.progressTextContainer}>
                  <Text style={[
                    styles.progressText,
                    isDarkMode && styles.progressTextDark
                  ]}>
                    {achievement.progress}/{achievement.total} - {' '}
                    {achievement.unlocked ? 
                      t('profile.unlocked') : 
                      t('achievements.inProgress')}
                  </Text>
                  
                  {achievement.unlocked && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>🏆</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            
            <ProgressBar 
              progress={achievement.progress / achievement.total}
              color={achievement.unlocked ? theme.colors.success : theme.colors.primary}
              style={styles.progressBar}
            />
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
  },
  achievementsContainer: {
    padding: theme.spacing.sm,
  },
  achievementItem: {
    marginBottom: theme.spacing.md,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  achievementTitleDark: {
    color: theme.dark.colors.textPrimary,
  },
  progressTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressTextDark: {
    color: theme.dark.colors.textSecondary,
  },
  badge: {
    marginLeft: theme.spacing.xs,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.sm,
  },
  progressBar: {
    marginTop: theme.spacing.xs,
  },
});

export default AchievementsCard; 