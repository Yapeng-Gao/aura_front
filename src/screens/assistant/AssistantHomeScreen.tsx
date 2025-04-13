import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AssistantStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';

type AssistantHomeScreenNavigationProp = StackNavigationProp<AssistantStackParamList, 'AssistantHome'>;

const AssistantHomeScreen = () => {
    const navigation = useNavigation<AssistantHomeScreenNavigationProp>();

    const assistants = [
        { name: 'AI助手', icon: 'chatbubble-ellipses', screen: 'AIAssistant' },
        { name: '会议助手', icon: 'videocam', screen: 'MeetingAssistant' },
        { name: '写作助手', icon: 'create', screen: 'WritingAssistant' },
        { name: '代码助手', icon: 'code', screen: 'CodeAssistant' },
        { name: '图像助手', icon: 'image', screen: 'ImageAssistant' },
        { name: '语音助手', icon: 'mic', screen: 'VoiceAssistant' },
    ];

    return (
        <ScreenContainer
            title=""
            hideHeader={false}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.textPrimary }]}>智能助手</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AISettings')}
                        style={styles.settingsButton}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.gridContainer}>
                    {assistants.map((assistant, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.card, { backgroundColor: theme.colors.surface }]}
                            onPress={() => navigation.navigate(assistant.screen as any)}
                        >
                            <Ionicons 
                                name={assistant.icon as any} 
                                size={32} 
                                color={theme.colors.primary} 
                                style={styles.icon}
                            />
                            <Text style={[styles.cardText, { color: theme.colors.textPrimary }]}>
                                {assistant.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </ScreenContainer>
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
        marginBottom: 24,
        paddingTop: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    settingsButton: {
        padding: 8,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 16,
    },
    card: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        marginBottom: 12,
    },
    cardText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default AssistantHomeScreen; 