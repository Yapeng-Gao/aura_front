import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator} from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ListItem from '../../components/common/ListItem';
import theme from '../../theme';
import apiService from '../../services/api';

// 会议类型定义
interface Meeting {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    participants: string[];
    agenda: string[];
    notes: string;
    isRecording: boolean;
    status: 'upcoming' | 'ongoing' | 'completed';
}

const MeetingAssistantScreen: React.FC = () => {
    // 会议状态
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(false);

    // 当前选中的会议
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

    // 会议笔记
    const [meetingNotes, setMeetingNotes] = useState('');

    // 录音状态
    const [isRecording, setIsRecording] = useState(false);

    // 会议状态
    const [activeMeetingFilter, setActiveMeetingFilter] = useState<'upcoming' | 'completed'>('upcoming');

    // 获取会议列表
    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            try {
                const response = await apiService.productivity.getMeetings();
                if (response && Array.isArray(response)) {
                    setMeetings(response);
                } else {
                    // 使用模拟数据
                    setMeetings([
                        {
                            id: '1',
                            title: '产品开发周会',
                            date: '2025-03-27',
                            startTime: '10:00',
                            endTime: '11:00',
                            participants: ['张明', '李华', '王芳', '刘强'],
                            agenda: [
                                '上周工作回顾',
                                '本周工作计划',
                                '问题讨论',
                                '任务分配'
                            ],
                            notes: '',
                            isRecording: false,
                            status: 'upcoming',
                        },
                        {
                            id: '2',
                            title: '客户需求讨论',
                            date: '2025-03-27',
                            startTime: '14:30',
                            endTime: '15:30',
                            participants: ['张明', '客户A', '客户B'],
                            agenda: [
                                '需求确认',
                                '功能演示',
                                '反馈收集',
                                '后续计划'
                            ],
                            notes: '',
                            isRecording: false,
                            status: 'upcoming',
                        },
                        {
                            id: '3',
                            title: '团队建设会议',
                            date: '2025-03-26',
                            startTime: '16:00',
                            endTime: '17:00',
                            participants: ['张明', '李华', '王芳', '刘强', '赵伟', '孙丽'],
                            agenda: [
                                '团队氛围讨论',
                                '问题解决',
                                '活动计划'
                            ],
                            notes: '决定下个月组织一次团队建设活动，地点待定。每个人提出了自己的想法和建议，大家一致认为应该选择一个户外活动。',
                            isRecording: false,
                            status: 'completed',
                        },
                    ]);
                }
            } catch (error) {
                console.error('获取会议失败:', error);
                Alert.alert('错误', '获取会议列表失败，请稍后重试');
                // 使用模拟数据
                setMeetings([
                    {
                        id: '1',
                        title: '产品开发周会',
                        date: '2025-03-27',
                        startTime: '10:00',
                        endTime: '11:00',
                        participants: ['张明', '李华', '王芳', '刘强'],
                        agenda: [
                            '上周工作回顾',
                            '本周工作计划',
                            '问题讨论',
                            '任务分配'
                        ],
                        notes: '',
                        isRecording: false,
                        status: 'upcoming',
                    },
                    {
                        id: '2',
                        title: '客户需求讨论',
                        date: '2025-03-27',
                        startTime: '14:30',
                        endTime: '15:30',
                        participants: ['张明', '客户A', '客户B'],
                        agenda: [
                            '需求确认',
                            '功能演示',
                            '反馈收集',
                            '后续计划'
                        ],
                        notes: '',
                        isRecording: false,
                        status: 'upcoming',
                    },
                    {
                        id: '3',
                        title: '团队建设会议',
                        date: '2025-03-26',
                        startTime: '16:00',
                        endTime: '17:00',
                        participants: ['张明', '李华', '王芳', '刘强', '赵伟', '孙丽'],
                        agenda: [
                            '团队氛围讨论',
                            '问题解决',
                            '活动计划'
                        ],
                        notes: '决定下个月组织一次团队建设活动，地点待定。每个人提出了自己的想法和建议，大家一致认为应该选择一个户外活动。',
                        isRecording: false,
                        status: 'completed',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    // 选择会议
    const handleSelectMeeting = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setMeetingNotes(meeting.notes);
    };

    // 开始会议
    const handleStartMeeting = async () => {
        if (selectedMeeting) {
            try {
                const meetingData = {
                    meetingId: selectedMeeting.id,
                    startTime: new Date().toISOString()
                };
                
                await apiService.productivity.startMeeting(meetingData);
                
                const updatedMeeting = {
                    ...selectedMeeting,
                    status: 'ongoing' as const,
                };

                setMeetings(meetings.map(meeting =>
                    meeting.id === selectedMeeting.id ? updatedMeeting : meeting
                ));

                setSelectedMeeting(updatedMeeting);
            } catch (error) {
                console.error('开始会议失败:', error);
                Alert.alert('错误', '开始会议失败，请稍后重试');
            }
        }
    };

    // 结束会议
    const handleEndMeeting = async () => {
        if (selectedMeeting) {
            try {
                await apiService.productivity.endMeeting(selectedMeeting.id);
                
                const updatedMeeting = {
                    ...selectedMeeting,
                    status: 'completed' as const,
                    notes: meetingNotes,
                    isRecording: false,
                };

                setMeetings(meetings.map(meeting =>
                    meeting.id === selectedMeeting.id ? updatedMeeting : meeting
                ));

                setSelectedMeeting(updatedMeeting);
                setIsRecording(false);
            } catch (error) {
                console.error('结束会议失败:', error);
                Alert.alert('错误', '结束会议失败，请稍后重试');
            }
        }
    };

    // 切换录音状态
    const handleToggleRecording = () => {
        if (selectedMeeting && selectedMeeting.status === 'ongoing') {
            setIsRecording(!isRecording);

            // 模拟录音转文字
            if (!isRecording) {
                // 开始录音
                console.log('开始录音');
            } else {
                // 结束录音，添加转写文本
                console.log('结束录音');

                setTimeout(() => {
                    setMeetingNotes(prev =>
                        prev + (prev ? '\n\n' : '') + '【语音转文字】团队成员讨论了项目进度，并决定下周开始实施新功能。'
                    );
                }, 1000);
            }
        }
    };

    // 生成会议纪要
    const handleGenerateSummary = async () => {
        if (selectedMeeting && selectedMeeting.status === 'completed') {
            try {
                setLoading(true);
                const response = await apiService.productivity.getMeetingSummary(selectedMeeting.id);
                
                if (response && response.summary) {
                    setMeetingNotes(response.summary);
                } else {
                    // 模拟AI生成会议纪要（备用）
                    setTimeout(() => {
                        const summary = `# ${selectedMeeting.title} 会议纪要\n\n` +
                            `日期：${selectedMeeting.date}\n` +
                            `时间：${selectedMeeting.startTime} - ${selectedMeeting.endTime}\n\n` +
                            `## 参会人员\n` +
                            selectedMeeting.participants.map(p => `- ${p}`).join('\n') + '\n\n' +
                            `## 议程\n` +
                            selectedMeeting.agenda.map(a => `- ${a}`).join('\n') + '\n\n' +
                            `## 会议记录\n` +
                            meetingNotes + '\n\n' +
                            `## 决定事项\n` +
                            `1. 下周开始实施新功能\n` +
                            `2. 每日进行进度更新\n` +
                            `3. 下次会议安排在下周一\n\n` +
                            `## 行动项\n` +
                            `- 张明：准备项目计划\n` +
                            `- 李华：联系客户确认需求\n` +
                            `- 王芳：准备设计方案\n` +
                            `- 刘强：评估技术可行性`;

                        setMeetingNotes(summary);
                    }, 1500);
                }
            } catch (error) {
                console.error('获取会议摘要失败:', error);
                Alert.alert('错误', '生成会议纪要失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        }
    };

    // 创建新会议
    const handleCreateMeeting = () => {
        // 这里将来会导航到创建会议页面
        console.log('创建新会议');
        // TODO: 导航到创建会议页面
    };

    // 筛选会议
    const filteredMeetings = meetings.filter(meeting => {
        if (activeMeetingFilter === 'upcoming') {
            return meeting.status === 'upcoming' || meeting.status === 'ongoing';
        } else {
            return meeting.status === 'completed';
        }
    });

    // 渲染会议列表
    const renderMeetingsList = () => {
        return (
            <View style={styles.meetingsListContainer}>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, activeMeetingFilter === 'upcoming' && styles.activeFilter]}
                        onPress={() => setActiveMeetingFilter('upcoming')}
                    >
                        <Text
                            style={[styles.filterText, activeMeetingFilter === 'upcoming' && styles.activeFilterText]}>
                            即将进行
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, activeMeetingFilter === 'completed' && styles.activeFilter]}
                        onPress={() => setActiveMeetingFilter('completed')}
                    >
                        <Text
                            style={[styles.filterText, activeMeetingFilter === 'completed' && styles.activeFilterText]}>
                            已完成
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.meetingsList}>
                    {filteredMeetings.length > 0 ? (
                        filteredMeetings.map((meeting) => (
                            <TouchableOpacity
                                key={meeting.id}
                                style={[
                                    styles.meetingItem,
                                    selectedMeeting?.id === meeting.id && styles.selectedMeetingItem,
                                    meeting.status === 'ongoing' && styles.ongoingMeetingItem,
                                ]}
                                onPress={() => handleSelectMeeting(meeting)}
                            >
                                <View style={styles.meetingItemHeader}>
                                    <Text style={styles.meetingTitle} numberOfLines={1}>
                                        {meeting.title}
                                    </Text>

                                    {meeting.status === 'ongoing' && (
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusText}>进行中</Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.meetingTime}>
                                    {meeting.date} {meeting.startTime} - {meeting.endTime}
                                </Text>

                                <View style={styles.participantsContainer}>
                                    <Text style={styles.participantsLabel}>
                                        参会人员:
                                    </Text>
                                    <Text style={styles.participantsText} numberOfLines={1}>
                                        {meeting.participants.join(', ')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.emptyListText}>
                            {activeMeetingFilter === 'upcoming' ? '没有即将进行的会议' : '没有已完成的会议'}
                        </Text>
                    )}
                </ScrollView>

                <Button
                    title="创建会议"
                    variant="primary"
                    size="medium"
                    onPress={handleCreateMeeting}
                    style={styles.createButton}
                    fullWidth
                />
            </View>
        );
    };

    // 渲染会议详情
    const renderMeetingDetail = () => {
        if (!selectedMeeting) {
            return (
                <View style={styles.emptyDetailContainer}>
                    <Text style={styles.emptyDetailText}>选择一个会议查看详情</Text>
                </View>
            );
        }

        return (
            <View style={styles.meetingDetailContainer}>
                <View style={styles.meetingDetailHeader}>
                    <Text style={styles.meetingDetailTitle}>{selectedMeeting.title}</Text>

                    <View style={styles.meetingDetailStatus}>
                        {selectedMeeting.status === 'upcoming' && (
                            <Button
                                title="开始会议"
                                variant="primary"
                                size="small"
                                onPress={handleStartMeeting}
                            />
                        )}

                        {selectedMeeting.status === 'ongoing' && (
                            <View style={styles.ongoingActions}>
                                <Button
                                    title={isRecording ? "停止录音" : "开始录音"}
                                    variant={isRecording ? "outline" : "primary"}
                                    size="small"
                                    onPress={handleToggleRecording}
                                    style={styles.recordButton}
                                />

                                <Button
                                    title="结束会议"
                                    variant="outline"
                                    size="small"
                                    onPress={handleEndMeeting}
                                />
                            </View>
                        )}

                        {selectedMeeting.status === 'completed' && (
                            <Button
                                title="生成会议纪要"
                                variant="primary"
                                size="small"
                                onPress={handleGenerateSummary}
                            />
                        )}
                    </View>
                </View>

                <ScrollView style={styles.meetingDetailContent}>
                    <Card title="会议信息" style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>日期:</Text>
                            <Text style={styles.infoValue}>{selectedMeeting.date}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>时间:</Text>
                            <Text
                                style={styles.infoValue}>{selectedMeeting.startTime} - {selectedMeeting.endTime}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>状态:</Text>
                            <Text style={styles.infoValue}>
                                {selectedMeeting.status === 'upcoming' ? '即将进行' :
                                    selectedMeeting.status === 'ongoing' ? '进行中' : '已完成'}
                            </Text>
                        </View>
                    </Card>

                    <Card title="参会人员" style={styles.infoCard}>
                        <View style={styles.participantsList}>
                            {selectedMeeting.participants.map((participant, index) => (
                                <View key={index} style={styles.participantItem}>
                                    <View style={styles.participantAvatar}>
                                        <Text style={styles.participantInitial}>
                                            {participant.charAt(0)}
                                        </Text>
                                    </View>
                                    <Text style={styles.participantName}>{participant}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>

                    <Card title="会议议程" style={styles.infoCard}>
                        {selectedMeeting.agenda.map((item, index) => (
                            <View key={index} style={styles.agendaItem}>
                                <Text style={styles.agendaNumber}>{index + 1}.</Text>
                                <Text style={styles.agendaText}>{item}</Text>
                            </View>
                        ))}
                    </Card>

                    <Card title="会议记录" style={styles.infoCard}>
                        {selectedMeeting.status === 'ongoing' ? (
                            <View>
                                <TextInput
                                    style={styles.notesInput}
                                    value={meetingNotes}
                                    onChangeText={setMeetingNotes}
                                    placeholder="在此记录会议内容..."
                                    multiline
                                />

                                {isRecording && (
                                    <View style={styles.recordingIndicator}>
                                        <View style={styles.recordingDot}/>
                                        <Text style={styles.recordingText}>正在录音...</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View>
                                {meetingNotes ? (
                                    <Text style={styles.notesText}>{meetingNotes}</Text>
                                ) : (
                                    <Text style={styles.emptyNotesText}>
                                        {selectedMeeting.status === 'upcoming' ?
                                            '会议尚未开始，无会议记录' :
                                            '没有会议记录'}
                                    </Text>
                                )}
                            </View>
                        )}
                    </Card>
                </ScrollView>
            </View>
        );
    };

    // 渲染加载指示器
    const renderLoading = () => {
        if (!loading) return null;
        
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>加载中...</Text>
            </View>
        );
    };

    return (
        <ScreenContainer
            title="会议助手"
            backgroundColor={theme.colors.background}
        >
            <View style={styles.container}>
                {renderMeetingsList()}
                {renderMeetingDetail()}
                {renderLoading()}
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    meetingsListContainer: {
        width: '30%',
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
        padding: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    filterButton: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeFilter: {
        borderBottomColor: theme.colors.primary,
    },
    filterText: {
        color: theme.colors.textPrimary,
        fontWeight: '400',
    },
    activeFilterText: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    meetingsList: {
        flex: 1,
    },
    meetingItem: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
        marginBottom: 8,
    },
    selectedMeetingItem: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    ongoingMeetingItem: {
        backgroundColor: theme.colors.secondary + '20',
    },
    meetingItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    meetingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        flex: 1,
    },
    statusBadge: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    meetingTime: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    participantsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    participantsLabel: {
        fontSize: 14,
        color: theme.colors.textPrimary,
        marginRight: 4,
    },
    participantsText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    emptyListText: {
        textAlign: 'center',
        padding: 20,
        color: theme.colors.textSecondary,
    },
    createButton: {
        marginTop: 16,
    },
    emptyDetailContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyDetailText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
    },
    meetingDetailContainer: {
        flex: 1,
        padding: 20,
    },
    meetingDetailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    meetingDetailTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    meetingDetailStatus: {
        flexDirection: 'row',
    },
    ongoingActions: {
        flexDirection: 'row',
    },
    recordButton: {
        marginRight: 8,
    },
    meetingDetailContent: {
        flex: 1,
    },
    infoCard: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    infoLabel: {
        width: 80,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    infoValue: {
        flex: 1,
        color: theme.colors.textPrimary,
    },
    participantsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    participantAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    participantInitial: {
        color: 'white',
        fontWeight: '500',
    },
    participantName: {
        color: theme.colors.textPrimary,
    },
    agendaItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    agendaNumber: {
        width: 24,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    agendaText: {
        flex: 1,
        color: theme.colors.textPrimary,
    },
    notesInput: {
        height: 150,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        padding: 10,
        color: theme.colors.textPrimary,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    recordingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        marginRight: 8,
    },
    recordingText: {
        color: 'red',
        fontWeight: '500',
    },
    notesText: {
        color: theme.colors.textPrimary,
        lineHeight: 20,
    },
    emptyNotesText: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
});

export default MeetingAssistantScreen;