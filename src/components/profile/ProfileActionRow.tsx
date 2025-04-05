import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import theme from '../../theme';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ActionItem {
  icon: string;
  label: string;
  screen: keyof RootStackParamList;
  color?: string;
}

interface ProfileActionRowProps {
  actions: ActionItem[];
}

const ProfileActionRow: React.FC<ProfileActionRowProps> = ({ actions }) => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // 确保显示的操作不超过4个
  const displayActions = actions.slice(0, 4);
  
  // 处理导航
  const handleNavigation = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };
  
  return (
    <View style={styles.container}>
      {displayActions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionItem}
          onPress={() => handleNavigation(action.screen)}
        >
          <View 
            style={[
              styles.iconContainer, 
              { backgroundColor: action.color || theme.colors.primary }
            ]}
          >
            <Text style={styles.icon}>{action.icon}</Text>
          </View>
          <Text 
            style={[
              styles.actionLabel,
              isDarkMode && styles.actionLabelDark
            ]}
            numberOfLines={1}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  icon: {
    fontSize: 22,
    color: theme.colors.onPrimary,
  },
  actionLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  actionLabelDark: {
    color: theme.dark.colors.textPrimary,
  }
});

export default ProfileActionRow; 