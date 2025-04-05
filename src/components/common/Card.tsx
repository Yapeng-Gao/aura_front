import React, { ReactNode } from 'react';
import {View, Text, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import theme from '../../theme';
import {Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface CardProps {
    title?: string;
    subtitle?: string;
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    contentStyle?: ViewStyle;
    elevation?: 'none' | 'small' | 'medium' | 'large';
    bordered?: boolean;
    headerRight?: React.ReactNode;
    isDarkMode?: boolean;
    icon?: string;
    rightContent?: ReactNode;
}

const Card: React.FC<CardProps> = ({
                                       title,
                                       subtitle,
                                       children,
                                       style,
                                       contentStyle,
                                       elevation = 'medium',
                                       bordered = false,
                                       headerRight,
                                       isDarkMode,
                                       icon,
                                       rightContent,
                                   }) => {
    // 获取阴影样式
    const getElevationStyle = () => {
        if (elevation === 'none') return {};
        if (elevation === 'small') return styles.elevationSmall;
        if (elevation === 'medium') return styles.elevationMedium;
        return styles.elevationLarge;
    };

    const elevationStyle = getElevationStyle();

    return (
        <View
            style={[
                styles.container,
                elevationStyle,
                bordered && styles.bordered,
                style,
                isDarkMode && { backgroundColor: theme.dark.colors.cardBackground }
            ]}
        >
            {(title || subtitle) && (
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        {title && (
                            <View style={styles.titleContainer}>
                                {icon && (
                                    <Icon 
                                        name={icon} 
                                        size={20} 
                                        color={isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary} 
                                        style={styles.titleIcon} 
                                    />
                                )}
                                <Text
                                    style={[
                                        styles.title,
                                        isDarkMode && { color: theme.dark.colors.textPrimary }
                                    ]}
                                >
                                    {title}
                                </Text>
                            </View>
                        )}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
                    {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
                </View>
            )}
            <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        marginVertical: theme.spacing.sm,
    },
    bordered: {
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    elevationSmall: Platform.OS === 'ios' 
        ? theme.shadows.ios.sm 
        : theme.shadows.android.sm,
    elevationMedium: Platform.OS === 'ios' 
        ? theme.shadows.ios.md 
        : theme.shadows.android.md,
    elevationLarge: Platform.OS === 'ios' 
        ? theme.shadows.ios.lg 
        : theme.shadows.android.lg,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerRight: {
        marginLeft: theme.spacing.sm,
    },
    rightContent: {
        marginLeft: theme.spacing.sm,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleIcon: {
        marginRight: 8,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.textVariants.caption, // 假设 caption 是卡片副标题的样式
        color: theme.colors.textSecondary,
    },
    content: {
        padding: theme.spacing.md,
    },
});

export default Card;
