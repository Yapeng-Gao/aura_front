import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';

const MembershipUpgradeScreen: React.FC = () => {
  const membershipPlans = [
    {
      id: 'monthly',
      name: '月度会员',
      price: '¥29.9',
      period: '月',
      features: [
        '无限次AI对话',
        '高级场景模板',
        '设备联动规则',
        '专属客服支持',
      ],
      popular: false,
    },
    {
      id: 'yearly',
      name: '年度会员',
      price: '¥299',
      period: '年',
      features: [
        '无限次AI对话',
        '高级场景模板',
        '设备联动规则',
        '专属客服支持',
        '优先体验新功能',
        '会员专属主题',
      ],
      popular: true,
      savings: '节省 17%',
    },
    {
      id: 'lifetime',
      name: '终身会员',
      price: '¥999',
      period: '永久',
      features: [
        '无限次AI对话',
        '高级场景模板',
        '设备联动规则',
        '专属客服支持',
        '优先体验新功能',
        '会员专属主题',
        '终身免费更新',
        '专属定制服务',
      ],
      popular: false,
      savings: '最超值',
    },
  ];

  const handleUpgrade = (planId: string) => {
    // TODO: 实现支付逻辑
    console.log('选择升级方案:', planId);
  };

  return (
    <ScreenContainer
      title="会员升级"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>选择会员方案</Text>
          <Text style={styles.subtitle}>解锁更多高级功能，享受更好的智能家居体验</Text>
        </View>

        {membershipPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              plan.popular && styles.popularPlan,
            ]}
            onPress={() => handleUpgrade(plan.id)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>最受欢迎</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>/{plan.period}</Text>
              </View>
              {plan.savings && (
                <Text style={styles.savings}>{plan.savings}</Text>
              )}
            </View>
            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureText}>✓ {feature}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[
                styles.upgradeButton,
                plan.popular && styles.popularButton,
              ]}
              onPress={() => handleUpgrade(plan.id)}
            >
              <Text style={[
                styles.upgradeButtonText,
                plan.popular && styles.popularButtonText,
              ]}>
                立即开通
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            开通即表示同意
            <Text style={styles.footerLink}>《会员服务协议》</Text>
            和
            <Text style={styles.footerLink}>《隐私政策》</Text>
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  popularPlan: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  popularBadgeText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
  },
  planHeader: {
    marginBottom: theme.spacing.lg,
  },
  planName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  period: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  savings: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
  },
  featuresList: {
    marginBottom: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  upgradeButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  popularButton: {
    backgroundColor: theme.colors.primary,
  },
  upgradeButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  popularButtonText: {
    color: theme.colors.onPrimary,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  footerLink: {
    color: theme.colors.primary,
  },
});

export default MembershipUpgradeScreen; 