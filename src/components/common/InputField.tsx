import React from 'react';
import {View, Text, TextInput, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import theme from '../../theme';

interface InputFieldProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    helper?: string;
    secureTextEntry?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    disabled?: boolean;
    maxLength?: number;
    style?: ViewStyle;
    inputStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;

}

const InputField: React.FC<InputFieldProps> = ({
                                                   label,
                                                   placeholder,
                                                   value,
                                                   onChangeText,
                                                   error,
                                                   helper,
                                                   secureTextEntry = false,
                                                   multiline = false,
                                                   numberOfLines = 1,
                                                   keyboardType = 'default',
                                                   autoCapitalize = 'none',
                                                   autoCorrect = false,
                                                   disabled = false,
                                                   maxLength,
                                                   style,
                                                   inputStyle,
                                                   leftIcon,
                                                   rightIcon,
                                               }) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                error ? styles.inputError : null,
                disabled ? styles.inputDisabled : null,
            ]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multilineInput,
                        leftIcon && styles.inputWithLeftIcon,
                        rightIcon && styles.inputWithRightIcon,
                        inputStyle,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textDisabled}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : undefined}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    editable={!disabled}
                    maxLength={maxLength}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {(error || helper) && (
                <Text style={[styles.helperText, error ? styles.errorText : null]}>
                    {error || helper}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: theme.spacing.md,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textPrimary,
    },
    multilineInput: {
        height: 'auto',
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        textAlignVertical: 'top',
    },
    inputWithLeftIcon: {
        paddingLeft: 0,
    },
    inputWithRightIcon: {
        paddingRight: 0,
    },
    leftIcon: {
        paddingLeft: theme.spacing.md,
    },
    rightIcon: {
        paddingRight: theme.spacing.md,
    },
    helperText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    errorText: {
        color: theme.colors.error,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    inputDisabled: {
        backgroundColor: theme.colors.divider,
        borderColor: theme.colors.border,
    },
});

export default InputField;
