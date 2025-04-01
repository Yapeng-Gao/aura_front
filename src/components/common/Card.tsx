import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
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
                style,
            ]}
        >
            {(title || subtitle) && (
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        marginVertical: theme.spacing.sm,
    },
    bordered: {
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    elevationSmall: {
        ...Platform.select({
            ios: theme.shadows.ios.sm,
            android: theme.shadows.android.sm,
        }),
    },
    elevationMedium: {
        ...Platform.select({
            ios: theme.shadows.ios.md,
            android: theme.shadows.android.md,
        }),
    },
    elevationLarge: {
        ...Platform.select({
            ios: theme.shadows.ios.lg,
            android: theme.shadows.android.lg,
        }),
    },
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
        ...theme.typography.textVariants.subtitle1, // 假设 subtitle1 是卡片标题的样式
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs, // 保留或调整 margin
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
