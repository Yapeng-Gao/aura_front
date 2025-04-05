import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert} from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ListItem from '../../components/common/ListItem';
import theme from '../../theme';
import apiService from '../../services/api';

// 笔记类型定义 - 对齐后端 API
interface Note {
    note_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    tags: string[];
    is_pinned: boolean;
    folder?: string;
    metadata?: any;
}

// 本地显示用的类型
interface DisplayNote {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    isFavorite: boolean;
}

const NotesScreen: React.FC = () => {
    // 笔记状态
    const [notes, setNotes] = useState<DisplayNote[]>([]);
    const [loading, setLoading] = useState(false);

    // 当前选中的笔记
    const [selectedNote, setSelectedNote] = useState<DisplayNote | null>(null);

    // 编辑模式
    const [isEditing, setIsEditing] = useState(false);

    // 编辑状态
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editTags, setEditTags] = useState('');

    // 搜索状态
    const [searchQuery, setSearchQuery] = useState('');

    // 筛选状态
    const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');

    // 获取笔记列表
    useEffect(() => {
        fetchNotes();
    }, []);

    // 获取笔记列表
    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await apiService.productivity.getNotes();
            if (response && response.items) {
                // 转换为本地显示格式
                const displayNotes: DisplayNote[] = response.items.map((note: Note) => ({
                    id: note.note_id,
                    title: note.title,
                    content: note.content,
                    createdAt: note.created_at,
                    updatedAt: note.updated_at,
                    tags: note.tags,
                    isFavorite: note.is_pinned
                }));
                setNotes(displayNotes);
            }
        } catch (error) {
            console.error('获取笔记失败:', error);
            Alert.alert('错误', '获取笔记列表失败，请稍后重试');
            // 使用模拟数据
            setNotes([
                {
                    id: '1',
                    title: '产品会议记录',
                    content: '讨论了新功能的优先级和实施计划。\n\n主要决定：\n1. 首先实现AI助手功能\n2. 其次开发日程管理\n3. 最后添加智能家居集成',
                    createdAt: '2025-03-20',
                    updatedAt: '2025-03-20',
                    tags: ['工作', '会议'],
                    isFavorite: true,
                },
                {
                    id: '2',
                    title: '购物清单',
                    content: '- 牛奶\n- 鸡蛋\n- 面包\n- 水果\n- 蔬菜',
                    createdAt: '2025-03-22',
                    updatedAt: '2025-03-22',
                    tags: ['个人', '购物'],
                    isFavorite: false,
                },
                {
                    id: '3',
                    title: '学习计划',
                    content: '本周学习目标：\n- React Native高级组件\n- Redux状态管理\n- TypeScript类型系统\n\n每天至少学习2小时',
                    createdAt: '2025-03-25',
                    updatedAt: '2025-03-26',
                    tags: ['学习', '技术'],
                    isFavorite: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // 选择笔记
    const handleSelectNote = (note: DisplayNote) => {
        setSelectedNote(note);
        setIsEditing(false);
    };

    // 开始编辑笔记
    const handleEditNote = () => {
        if (selectedNote) {
            setEditTitle(selectedNote.title);
            setEditContent(selectedNote.content);
            setEditTags(selectedNote.tags.join(', '));
            setIsEditing(true);
        }
    };

    // 保存编辑的笔记
    const handleSaveNote = async () => {
        if (selectedNote && editTitle.trim()) {
            setLoading(true);
            try {
                const noteData = {
                    title: editTitle,
                    content: editContent,
                    tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    is_pinned: selectedNote.isFavorite
                };
                
                const response = await apiService.productivity.updateNote(selectedNote.id, noteData);
                
                if (response) {
                    // 更新本地笔记
                    const updatedDisplayNote: DisplayNote = {
                        id: response.note_id,
                        title: response.title,
                        content: response.content,
                        createdAt: response.created_at,
                        updatedAt: response.updated_at,
                        tags: response.tags,
                        isFavorite: response.is_pinned
                    };
                    
                    setNotes(notes.map(note =>
                        note.id === selectedNote.id ? updatedDisplayNote : note
                    ));
                    
                    setSelectedNote(updatedDisplayNote);
                    setIsEditing(false);
                }
            } catch (error) {
                console.error('保存笔记失败:', error);
                Alert.alert('错误', '保存笔记失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        }
    };

    // 创建新笔记
    const handleCreateNote = async () => {
        setLoading(true);
        try {
            const newNoteData = {
                title: '新笔记',
                content: '',
                tags: [],
                is_pinned: false
            };
            
            const response = await apiService.productivity.createNote(newNoteData);
            
            if (response) {
                const newDisplayNote: DisplayNote = {
                    id: response.note_id,
                    title: response.title,
                    content: response.content,
                    createdAt: response.created_at,
                    updatedAt: response.updated_at,
                    tags: response.tags,
                    isFavorite: response.is_pinned
                };
                
                setNotes([...notes, newDisplayNote]);
                setSelectedNote(newDisplayNote);
                setEditTitle(newDisplayNote.title);
                setEditContent(newDisplayNote.content);
                setEditTags('');
                setIsEditing(true);
            }
        } catch (error) {
            console.error('创建笔记失败:', error);
            Alert.alert('错误', '创建笔记失败，请稍后重试');
            
            // 创建本地笔记
            const newNote: DisplayNote = {
                id: Date.now().toString(),
                title: '新笔记',
                content: '',
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
                tags: [],
                isFavorite: false,
            };
            
            setNotes([...notes, newNote]);
            setSelectedNote(newNote);
            setEditTitle(newNote.title);
            setEditContent(newNote.content);
            setEditTags('');
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };

    // 删除笔记
    const handleDeleteNote = async () => {
        if (selectedNote) {
            setLoading(true);
            try {
                await apiService.productivity.deleteNote(selectedNote.id);
                setNotes(notes.filter(note => note.id !== selectedNote.id));
                setSelectedNote(null);
            } catch (error) {
                console.error('删除笔记失败:', error);
                Alert.alert('错误', '删除笔记失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        }
    };

    // 切换收藏状态
    const handleToggleFavorite = async () => {
        if (selectedNote) {
            setLoading(true);
            try {
                const updatedData = {
                    is_pinned: !selectedNote.isFavorite
                };
                
                const response = await apiService.productivity.updateNote(selectedNote.id, updatedData);
                
                if (response) {
                    const updatedDisplayNote: DisplayNote = {
                        ...selectedNote,
                        isFavorite: !selectedNote.isFavorite
                    };
                    
                    setNotes(notes.map(note =>
                        note.id === selectedNote.id ? updatedDisplayNote : note
                    ));
                    
                    setSelectedNote(updatedDisplayNote);
                }
            } catch (error) {
                console.error('更新笔记收藏状态失败:', error);
                Alert.alert('错误', '更新笔记收藏状态失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        }
    };

    // 筛选笔记
    const filteredNotes = notes.filter(note => {
        // 先按收藏筛选
        if (activeFilter === 'favorites' && !note.isFavorite) {
            return false;
        }

        // 再按搜索词筛选
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return true;
    });

    // 渲染笔记列表
    const renderNotesList = () => {
        return (
            <View style={styles.notesListContainer}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="搜索笔记..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
                        onPress={() => setActiveFilter('all')}
                    >
                        <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>全部</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, activeFilter === 'favorites' && styles.activeFilter]}
                        onPress={() => setActiveFilter('favorites')}
                    >
                        <Text
                            style={[styles.filterText, activeFilter === 'favorites' && styles.activeFilterText]}>收藏</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.notesList}>
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map((note) => (
                            <TouchableOpacity
                                key={note.id}
                                style={[
                                    styles.noteItem,
                                    selectedNote?.id === note.id && styles.selectedNoteItem
                                ]}
                                onPress={() => handleSelectNote(note)}
                            >
                                <View style={styles.noteItemHeader}>
                                    <Text style={styles.noteTitle} numberOfLines={1}>
                                        {note.title}
                                    </Text>
                                    {note.isFavorite && (
                                        <Text style={styles.favoriteIcon}>★</Text>
                                    )}
                                </View>

                                <Text style={styles.notePreview} numberOfLines={2}>
                                    {note.content}
                                </Text>

                                <View style={styles.noteItemFooter}>
                                    <Text style={styles.noteDate}>
                                        {note.updatedAt}
                                    </Text>

                                    <View style={styles.tagsContainer}>
                                        {note.tags.slice(0, 2).map((tag, index) => (
                                            <View key={index} style={styles.tagBadge}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                        {note.tags.length > 2 && (
                                            <Text style={styles.moreTagsText}>+{note.tags.length - 2}</Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.emptyListText}>
                            {searchQuery ? '没有找到匹配的笔记' : '没有笔记'}
                        </Text>
                    )}
                </ScrollView>

                <Button
                    title="新建笔记"
                    variant="primary"
                    size="medium"
                    onPress={handleCreateNote}
                    style={styles.createButton}
                    fullWidth
                />
            </View>
        );
    };

    // 渲染笔记详情
    const renderNoteDetail = () => {
        if (!selectedNote) {
            return (
                <View style={styles.emptyDetailContainer}>
                    <Text style={styles.emptyDetailText}>选择一个笔记查看详情</Text>
                </View>
            );
        }

        if (isEditing) {
            return (
                <View style={styles.noteDetailContainer}>
                    <View style={styles.noteDetailHeader}>
                        <TextInput
                            style={styles.editTitleInput}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            placeholder="笔记标题"
                        />

                        <View style={styles.noteDetailActions}>
                            <Button
                                title="取消"
                                variant="outline"
                                size="small"
                                onPress={() => setIsEditing(false)}
                                style={styles.actionButton}
                            />

                            <Button
                                title="保存"
                                variant="primary"
                                size="small"
                                onPress={handleSaveNote}
                                disabled={!editTitle.trim()}
                                style={styles.actionButton}
                            />
                        </View>
                    </View>

                    <TextInput
                        style={styles.editContentInput}
                        value={editContent}
                        onChangeText={setEditContent}
                        placeholder="开始输入笔记内容..."
                        multiline
                    />

                    <View style={styles.editTagsContainer}>
                        <Text style={styles.editTagsLabel}>标签（用逗号分隔）:</Text>
                        <TextInput
                            style={styles.editTagsInput}
                            value={editTags}
                            onChangeText={setEditTags}
                            placeholder="工作, 个人, 学习..."
                        />
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.noteDetailContainer}>
                <View style={styles.noteDetailHeader}>
                    <Text style={styles.noteDetailTitle}>{selectedNote.title}</Text>

                    <View style={styles.noteDetailActions}>
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={handleToggleFavorite}
                        >
                            <Text style={[styles.favoriteButtonIcon, selectedNote.isFavorite && styles.activeFavorite]}>
                                {selectedNote.isFavorite ? '★' : '☆'}
                            </Text>
                        </TouchableOpacity>

                        <Button
                            title="编辑"
                            variant="outline"
                            size="small"
                            onPress={handleEditNote}
                            style={styles.actionButton}
                        />

                        <Button
                            title="删除"
                            variant="outline"
                            size="small"
                            onPress={handleDeleteNote}
                            style={styles.actionButton}
                        />
                    </View>
                </View>

                <ScrollView style={styles.noteContentContainer}>
                    <Text style={styles.noteContent}>{selectedNote.content}</Text>

                    {selectedNote.tags.length > 0 && (
                        <View style={styles.detailTagsContainer}>
                            {selectedNote.tags.map((tag, index) => (
                                <View key={index} style={styles.detailTagBadge}>
                                    <Text style={styles.detailTagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text style={styles.noteDetailDate}>
                        创建于 {selectedNote.createdAt}
                        {selectedNote.createdAt !== selectedNote.updatedAt && ` · 更新于 ${selectedNote.updatedAt}`}
                    </Text>
                </ScrollView>
            </View>
        );
    };

    return (
        <ScreenContainer
            title="笔记"
            backgroundColor={theme.colors.background}
        >
            <View style={styles.container}>
                {/* 左侧笔记列表 */}
                <View style={styles.notesListContainer}>
                    {renderNotesList()}
                </View>

                {/* 右侧笔记详情 */}
                <View style={styles.noteDetailContainer}>
                    {renderNoteDetail()}
                </View>
            </View>
        </ScreenContainer>
    );
};
const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'row',
        },
        notesListContainer: {
            width: '35%',
            borderRightWidth: 1,
            borderRightColor: theme.colors.border,
            padding: theme.spacing.sm,
        },
        searchContainer: {
            marginBottom: theme.spacing.sm,
        },
        searchInput: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.textPrimary,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        filterContainer: {
            flexDirection: 'row',
            marginBottom: theme.spacing.sm,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            overflow: 'hidden',
        },
        filterButton: {
            flex: 1,
            paddingVertical: theme.spacing.sm,
            alignItems: 'center',
        },
        activeFilter: {
            backgroundColor: theme.colors.primary,
        },
        filterText: {
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.textPrimary,
        },
        activeFilterText: {
            color: theme.colors.onPrimary,
            fontWeight: '700',
        },
        notesList: {
            flex: 1,
        },
        noteItem: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
        },
        selectedNoteItem: {
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        noteItemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        noteTitle: {
            fontSize: theme.typography.fontSize.md,
            fontWeight: '700',
            color: theme.colors.textPrimary,
            flex: 1,
        },
        favoriteIcon: {
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.warning,
            marginLeft: theme.spacing.xs,
        },
        notePreview: {
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
            lineHeight: theme.typography.lineHeight.md,
        },
        noteItemFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        noteDate: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
        },
        tagsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        tagBadge: {
            backgroundColor: `${theme.colors.primary}20`,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 2,
            borderRadius: theme.borderRadius.sm,
            marginLeft: theme.spacing.xs,
        },
        tagText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.primary,
        },
        moreTagsText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.xs,
        },
        emptyListText: {
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: theme.spacing.xl,
        },
        createButton: {
            marginTop: theme.spacing.md,
        },
        noteDetailContainer: {
            flex: 1,
            padding: theme.spacing.md,
        },
        emptyDetailContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyDetailText: {
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        noteDetailHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        noteDetailTitle: {
            fontSize: theme.typography.fontSize.xl,
            fontWeight: '700',
            color: theme.colors.textPrimary,
            flex: 1,
        },
        editTitleInput: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: '700',
            color: theme.colors.textPrimary,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginRight: theme.spacing.md,
        },
        noteDetailActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        favoriteButton: {
            padding: theme.spacing.sm,
        },
        favoriteButtonIcon: {
            fontSize: 24,
            color: theme.colors.textSecondary,
        },
        activeFavorite: {
            color: theme.colors.warning,
        },
        actionButton: {
            marginLeft: theme.spacing.sm,
        },
        deleteButton: {
            borderColor: theme.colors.error,
        },
        noteContentContainer: {
            flex: 1,
        },
        noteContent: {
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.textPrimary,
            lineHeight: theme.typography.lineHeight.md,
            marginBottom: theme.spacing.lg,
        },
        editContentInput: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.textPrimary,
            borderWidth: 1,
            borderColor: theme.colors.border,
            minHeight: 200,
            textAlignVertical: 'top',
            marginBottom: theme.spacing.md,
        },
        detailTagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.md,
        },
        detailTagBadge: {
            backgroundColor: `${theme.colors.primary}20`,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.borderRadius.sm,
            marginRight: theme.spacing.sm,
            marginBottom: theme.spacing.sm,
        },
        detailTagText: {
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.primary,
        },
        editTagsContainer: {
            marginBottom: theme.spacing.md,
        },
        editTagsLabel: {
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
        },
        editTagsInput: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            fontSize: theme.typography.fontSize.md,
            color: theme.colors.textPrimary,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        noteDetailDate: {
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSecondary,
        },
        editingContainer: {
            flex: 1,
            padding: theme.spacing.md,
        },
        detailScrollView: {
            flex: 1,
        },
    });


export default NotesScreen;