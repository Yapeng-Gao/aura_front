import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import theme from '../../theme';

const EditProfileScreen: React.FC = () => {
  const [username, setUsername] = useState('张明');
  const [email, setEmail] = useState('zhangming@example.com');
  const [phone, setPhone] = useState('13800138000');

  const handleSave = () => {
    // TODO: 实现保存逻辑
    console.log('保存个人资料');
  };

  return (
    <ScreenContainer
      title="编辑个人资料"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="请输入用户名"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>邮箱</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="请输入邮箱"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>手机号</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="请输入手机号"
            keyboardType="phone-pad"
          />
        </View>

        <Button
          title="保存"
          variant="primary"
          size="large"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 48,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
});

export default EditProfileScreen; 