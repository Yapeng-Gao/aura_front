import React from 'react';
import {View, Text, StyleSheet, ViewStyle, useColorScheme} from 'react-native';
import theme from '../../theme';
import {Platform} from 'react-native';

interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    elevation?: 'none' | 'small' | 'medium' | 'large';
    bordered?: boolean;
    headerRight?: React.ReactNode;
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
                                   }) => {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    
    // 获取阴影样式
    const getElevationStyle = () => {
        switch (elevation) {
            case 'none':
                return {};
            case 'small':
                return styles.elevationSmall;
            case 'medium':
                return styles.elevationMedium;
            case 'large':
                return styles.elevationLarge;
            default:
                return styles.elevationMedium;
        }
    };

    const elevationStyle = getElevationStyle();

    return (
        <View
            style={[
                styles.container,
                elevationStyle,
                bordered && styles.bordered,
                isDarkMode && styles.containerDark,
                style,
            ]}
        >
            {(title || subtitle) && (
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        {title && <Text style={[styles.title, isDarkMode && styles.titleDark]}>{title}</Text>}
                        {subtitle && <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>{subtitle}</Text>}
                    </View>
                    {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
                </View>
            )}
            <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        marginVertical: theme.spacing.sm,
    },
    containerDark: {
        backgroundColor: theme.dark.colors.cardBackground,
    },
    bordered: {
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    elevationSmall: Platform.select({
        ios: theme.shadows.ios.sm,
        android: theme.shadows.android.sm,
        default: theme.shadows.android.sm,
    }),
    elevationMedium: Platform.select({
        ios: theme.shadows.ios.md,
        android: theme.shadows.android.md,
        default: theme.shadows.android.md,
    }),
    elevationLarge: Platform.select({
        ios: theme.shadows.ios.lg,
        android: theme.shadows.android.lg,
        default: theme.shadows.android.lg,
    }),
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
    title: {
        ...theme.typography.textVariants.subtitle1,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    titleDark: {
        color: theme.dark.colors.textPrimary,
    },
    subtitle: {
        ...theme.typography.textVariants.caption,
        color: theme.colors.textSecondary,
    },
    subtitleDark: {
        color: theme.dark.colors.textSecondary,
    },
    content: {
        padding: theme.spacing.md,
    },
});

export default Card;
