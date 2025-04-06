import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MeetingAIService } from '../../services/meeting-ai-service';
import { AdvancedSummary } from '../../types/meeting';
import Toast from 'react-native-toast-message';

interface Props {
  meetingId: string;
  existingSummary?: AdvancedSummary;
}

export const AdvancedSummaryGenerator: React.FC<Props> = ({
  meetingId,
  existingSummary
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AdvancedSummary | undefined>(existingSummary);

  const generateSummary = async () => {
    try {
      setLoading(true);
      const result = await MeetingAIService.getInstance().generateAdvancedSummary(meetingId);
      setSummary(result);
      Toast.show({
        type: 'success',
        text1: '高级会议总结生成成功',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '生成高级会议总结失败',
      });
      console.error('生成高级会议总结失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>高级会议总结</Text>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={generateSummary}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>生成高级AI总结</Text>
          )}
        </TouchableOpacity>
      </View>

      {summary ? (
        <ScrollView style={styles.scrollView}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>会议主题分析</Text>
            <Text style={styles.cardContent}>{summary.theme_analysis}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>深度见解</Text>
            <Text style={styles.cardContent}>{summary.insights}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>隐含决策</Text>
            {summary.implied_decisions.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>智能建议</Text>
            {summary.recommendations.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>

          {summary.sentiment_analysis && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>情感分析</Text>
              <View style={styles.gridContainer}>
                {Object.entries(summary.sentiment_analysis).map(([key, value], index) => (
                  <View key={index} style={styles.gridItem}>
                    <Text style={styles.gridItemLabel}>{key}:</Text>
                    <Text style={styles.gridItemValue}>{value.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>关键话题</Text>
            <View style={styles.tagContainer}>
              {summary.key_topics.map((topic, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            点击上方按钮生成高级会议总结
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardContent: {
    fontSize: 14,
    color: '#333',
  },
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  gridItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  gridItemValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e6f7ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    margin: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1890ff',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  }
}); 