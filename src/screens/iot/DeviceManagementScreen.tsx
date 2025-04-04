import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Platform} from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import theme from '../../theme';

interface Device {
    id: string;
    name: string;
    type: 'light' | 'thermostat' | 'lock' | 'camera' | 'speaker' | 'curtain' | 'tv' | 'other';
    room: string;
    status: 'on' | 'off' | 'locked' | 'unlocked' | string;
    isConnected: boolean;
    batteryLevel?: number;
    lastUpdated: string;
    manufacturer: string;
    model: string;
}

const DeviceManagementScreen: React.FC = () => {
    // 预定义的房间列表
    const predefinedRooms = [
        '客厅', '卧室', '厨房', '浴室', '书房', '阳台', '餐厅', '门厅'
    ];

    // 预定义的设备类型列表
    const predefinedTypes = [
        { id: 'light', name: '灯光' },
        { id: 'thermostat', name: '温控器' },
        { id: 'lock', name: '智能锁' },
        { id: 'camera', name: '摄像头' },
        { id: 'speaker', name: '音箱' },
        { id: 'curtain', name: '窗帘' },
        { id: 'tv', name: '电视' },
        { id: 'other', name: '其他设备' }
    ];

    const [devices, setDevices] = useState<Device[]>([
        {
            id: '101',
            name: '客厅主灯',
            type: 'light',
            room: '客厅',
            status: 'on',
            isConnected: true,
            batteryLevel: 100,
            lastUpdated: '2025-03-27 14:30',
            manufacturer: 'Philips',
            model: 'Hue Color',
        },
        // 其他设备数据...
    ]);

    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editRoom, setEditRoom] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRoom, setFilterRoom] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [isRoomExpanded, setIsRoomExpanded] = useState(false);
    const [isTypeExpanded, setIsTypeExpanded] = useState(false);
    const [isStatusExpanded, setIsStatusExpanded] = useState(false);

    const allRooms = Array.from(new Set(devices.map(device => device.room)));
    const allTypes = Array.from(new Set(devices.map(device => device.type)));

    const handleSelectDevice = (device: Device) => {
        setSelectedDevice(device);
        setIsEditing(false);
        setEditName(device.name);
        setEditRoom(device.room);
    };

    const handleEditDevice = () => setIsEditing(true);

    const handleSaveDevice = () => {
        if (selectedDevice && editName.trim()) {
            const updatedDevice = {
                ...selectedDevice,
                name: editName,
                room: editRoom,
                lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
            };

            setDevices(devices.map(d => d.id === selectedDevice.id ? updatedDevice : d));
            setSelectedDevice(updatedDevice);
            setIsEditing(false);
        }
    };

    const handleToggleConnection = () => {
        if (selectedDevice) {
            const updatedDevice = {
                ...selectedDevice,
                isConnected: !selectedDevice.isConnected,
                lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
            };

            setDevices(devices.map(d => d.id === selectedDevice.id ? updatedDevice : d));
            setSelectedDevice(updatedDevice);
        }
    };

    const handleToggleStatus = () => {
        if (!selectedDevice) return;

        let newStatus: string;
        switch (selectedDevice.type) {
            case 'light':
            case 'tv':
            case 'speaker':
            case 'camera':
                newStatus = selectedDevice.status === 'on' ? 'off' : 'on';
                break;
            case 'lock':
                newStatus = selectedDevice.status === 'locked' ? 'unlocked' : 'locked';
                break;
            case 'curtain':
                newStatus = selectedDevice.status === 'open' ? 'closed' : 'open';
                break;
            default:
                newStatus = selectedDevice.status === 'on' ? 'off' : 'on';
        }

        const updatedDevice = {
            ...selectedDevice,
            status: newStatus,
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };

        setDevices(devices.map(d => d.id === selectedDevice.id ? updatedDevice : d));
        setSelectedDevice(updatedDevice);
    };

    const handleDeleteDevice = () => {
        if (selectedDevice) {
            setDevices(devices.filter(d => d.id !== selectedDevice.id));
            setSelectedDevice(null);
        }
    };

    const handleAddDevice = () => {
        const newDevice: Device = {
            id: Date.now().toString(),
            name: '新设备',
            type: 'other',
            room: '客厅',
            status: 'off',
            isConnected: false,
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
            manufacturer: '未知',
            model: '未知',
        };

        setDevices([newDevice, ...devices]);
        handleSelectDevice(newDevice);
        setIsEditing(true);
    };

    const getDeviceIcon = (type: string, status: string) => {
        switch (type) {
            case 'light':
                return status === 'on' ? '💡' : '🔦';
            case 'thermostat':
                return status === 'on' ? '🌡️' : '❄️';
            case 'lock':
                return status === 'locked' ? '🔒' : '🔓';
            case 'camera':
                return status === 'on' ? '📹' : '📷';
            case 'speaker':
                return status === 'on' ? '🔊' : '🔈';
            case 'curtain':
                return status === 'open' ? '🪟' : '🎦';
            case 'tv':
                return status === 'on' ? '📺' : '📴';
            default:
                return '📱';
        }
    };

    const getDeviceStatusText = (device: Device) => {
        switch (device.type) {
            case 'light':
            case 'tv':
            case 'speaker':
            case 'camera':
                return device.status === 'on' ? '开启' : '关闭';
            case 'lock':
                return device.status === 'locked' ? '已锁定' : '已解锁';
            case 'curtain':
                return device.status === 'open' ? '已打开' : '已关闭';
            case 'thermostat':
                return device.status === 'on' ? '开启' : '关闭';
            default:
                return device.status;
        }
    };

    const filteredDevices = devices.filter(device => {
        if (searchQuery && !device.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterRoom && device.room !== filterRoom) return false;
        if (filterType && device.type !== filterType) return false;
        if (filterStatus === 'connected' && !device.isConnected) return false;
        if (filterStatus === 'disconnected' && device.isConnected) return false;
        return true;
    });

    const renderRoomFilters = () => (
        <View style={styles.filterGroup}>
            <TouchableOpacity 
                style={styles.filterHeader}
                onPress={() => setIsRoomExpanded(!isRoomExpanded)}
            >
                <Text style={styles.filterLabel}>房间:</Text>
                <Text style={styles.expandIcon}>{isRoomExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {isRoomExpanded && (
                <View style={styles.filterOptions}>
                    <TouchableOpacity
                        style={[styles.filterOption, !filterRoom && styles.activeFilterOption]}
                        onPress={() => setFilterRoom(null)}
                    >
                        <Text style={[styles.filterOptionText, !filterRoom && styles.activeFilterOptionText]}>全部</Text>
                    </TouchableOpacity>
                    {predefinedRooms.map(room => (
                        <TouchableOpacity
                            key={room}
                            style={[styles.filterOption, filterRoom === room && styles.activeFilterOption]}
                            onPress={() => setFilterRoom(room)}
                        >
                            <Text style={[styles.filterOptionText, filterRoom === room && styles.activeFilterOptionText]}>
                                {room}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const renderTypeFilters = () => (
        <View style={styles.filterGroup}>
            <TouchableOpacity 
                style={styles.filterHeader}
                onPress={() => setIsTypeExpanded(!isTypeExpanded)}
            >
                <Text style={styles.filterLabel}>类型:</Text>
                <Text style={styles.expandIcon}>{isTypeExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {isTypeExpanded && (
                <View style={styles.filterOptions}>
                    <TouchableOpacity
                        style={[styles.filterOption, !filterType && styles.activeFilterOption]}
                        onPress={() => setFilterType(null)}
                    >
                        <Text style={[styles.filterOptionText, !filterType && styles.activeFilterOptionText]}>全部</Text>
                    </TouchableOpacity>
                    {predefinedTypes.map(type => (
                        <TouchableOpacity
                            key={type.id}
                            style={[styles.filterOption, filterType === type.id && styles.activeFilterOption]}
                            onPress={() => setFilterType(type.id)}
                        >
                            <Text style={[styles.filterOptionText, filterType === type.id && styles.activeFilterOptionText]}>
                                {type.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    const renderStatusFilters = () => (
        <View style={styles.filterGroup}>
            <TouchableOpacity 
                style={styles.filterHeader}
                onPress={() => setIsStatusExpanded(!isStatusExpanded)}
            >
                <Text style={styles.filterLabel}>状态:</Text>
                <Text style={styles.expandIcon}>{isStatusExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {isStatusExpanded && (
                <View style={styles.filterOptions}>
                    <TouchableOpacity
                        style={[styles.filterOption, !filterStatus && styles.activeFilterOption]}
                        onPress={() => setFilterStatus(null)}
                    >
                        <Text style={[styles.filterOptionText, !filterStatus && styles.activeFilterOptionText]}>全部</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterOption, filterStatus === 'connected' && styles.activeFilterOption]}
                        onPress={() => setFilterStatus('connected')}
                    >
                        <Text style={[styles.filterOptionText, filterStatus === 'connected' && styles.activeFilterOptionText]}>已连接</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterOption, filterStatus === 'disconnected' && styles.activeFilterOption]}
                        onPress={() => setFilterStatus('disconnected')}
                    >
                        <Text style={[styles.filterOptionText, filterStatus === 'disconnected' && styles.activeFilterOptionText]}>未连接</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="搜索设备..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {renderRoomFilters()}
            {renderTypeFilters()}
            {renderStatusFilters()}
        </View>
    );

    const renderDevicesList = () => (
        <View style={styles.devicesListContainer}>
            {renderFilters()}
            <ScrollView style={styles.devicesList}>
                {filteredDevices.length > 0 ? (
                    filteredDevices.map(device => (
                        <TouchableOpacity
                            key={device.id}
                            style={[
                                styles.deviceItem,
                                selectedDevice?.id === device.id && styles.selectedDeviceItem,
                                !device.isConnected && styles.disconnectedDeviceItem
                            ]}
                            onPress={() => handleSelectDevice(device)}
                        >
                            <View style={styles.deviceItemHeader}>
                                <Text style={styles.deviceIcon}>{getDeviceIcon(device.type, device.status)}</Text>
                                <View style={styles.deviceInfo}>
                                    <Text style={styles.deviceName}>{device.name}</Text>
                                    <Text style={styles.deviceRoom}>{device.room}</Text>
                                </View>
                                <View style={styles.deviceStatus}>
                                    <View style={[
                                        styles.statusIndicator,
                                        device.isConnected ? styles.connectedIndicator : styles.disconnectedIndicator
                                    ]}/>
                                    <Text style={styles.statusText}>
                                        {device.isConnected ? getDeviceStatusText(device) : '未连接'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyListText}>没有找到匹配的设备</Text>
                )}
            </ScrollView>
            <Button
                title="添加新设备"
                variant="primary"
                size="medium"
                onPress={handleAddDevice}
                style={styles.addButton}
                fullWidth
            />
        </View>
    );

    const renderDeviceDetail = () => {
        if (!selectedDevice) {
            return (
                <View style={styles.emptyDetailContainer}>
                    <Text style={styles.emptyDetailText}>请选择一个设备查看详情</Text>
                </View>
            );
        }

        return (
            <View style={styles.deviceDetailContainer}>
                <View style={styles.deviceDetailHeader}>
                    {isEditing ? (
                        <TextInput
                            style={styles.editNameInput}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="设备名称"
                        />
                    ) : (
                        <Text style={styles.deviceNameText}>{selectedDevice.name}</Text>
                    )}

                    <View style={styles.deviceStatusBadge}>
                        <View style={[
                            styles.statusIndicator,
                            selectedDevice.isConnected ? styles.connectedIndicator : styles.disconnectedIndicator
                        ]}/>
                        <Text style={styles.statusText}>
                            {selectedDevice.isConnected ? getDeviceStatusText(selectedDevice) : '未连接'}
                        </Text>
                    </View>
                </View>

                {isEditing ? (
                    <View style={styles.editFormGroup}>
                        <Text style={styles.editFormLabel}>房间:</Text>
                        <TextInput
                            style={styles.editRoomInput}
                            value={editRoom}
                            onChangeText={setEditRoom}
                            placeholder="设备所在房间"
                        />
                    </View>
                ) : (
                    <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>设备信息</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>房间</Text>
                            <Text style={styles.detailValue}>{selectedDevice.room}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>类型</Text>
                            <Text style={styles.detailValue}>
                                {selectedDevice.type === 'light' ? '灯光' :
                                    selectedDevice.type === 'thermostat' ? '温控器' :
                                        selectedDevice.type === 'lock' ? '智能锁' :
                                            selectedDevice.type === 'camera' ? '摄像头' :
                                                selectedDevice.type === 'speaker' ? '音箱' :
                                                    selectedDevice.type === 'curtain' ? '窗帘' :
                                                        selectedDevice.type === 'tv' ? '电视' : '其他设备'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>制造商</Text>
                            <Text style={styles.detailValue}>{selectedDevice.manufacturer}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>型号</Text>
                            <Text style={styles.detailValue}>{selectedDevice.model}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>最后更新</Text>
                            <Text style={styles.detailValue}>{selectedDevice.lastUpdated}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>设备控制</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>连接状态</Text>
                        <Switch
                            value={selectedDevice.isConnected}
                            onValueChange={handleToggleConnection}
                            trackColor={{false: theme.colors.error, true: theme.colors.success}}
                        />
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>设备状态</Text>
                        <Switch
                            value={selectedDevice.status === 'on' || selectedDevice.status === 'locked'}
                            onValueChange={handleToggleStatus}
                            disabled={!selectedDevice.isConnected}
                        />
                    </View>
                    {selectedDevice.batteryLevel !== undefined && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>电池电量</Text>
                            <View style={styles.batteryContainer}>
                                <View style={styles.batteryLevel}>
                                    <View
                                        style={[
                                            styles.batteryFill,
                                            {
                                                width: `${selectedDevice.batteryLevel}%`,
                                                backgroundColor: selectedDevice.batteryLevel > 20
                                                    ? theme.colors.success
                                                    : theme.colors.error
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.detailValue}>{selectedDevice.batteryLevel}%</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.detailActions}>
                    {isEditing ? (
                        <>
                            <Button
                                title="取消"
                                variant="outline"
                                size="medium"
                                onPress={() => setIsEditing(false)}
                                style={styles.actionButton}
                            />
                            <Button
                                title="保存"
                                variant="primary"
                                size="medium"
                                onPress={handleSaveDevice}
                                disabled={!editName.trim()}
                                style={styles.actionButton}
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                title="删除设备"
                                variant="outline"
                                size="medium"
                                onPress={handleDeleteDevice}
                                style={styles.actionButton}
                                textStyle={{ color: theme.colors.error }}
                            />
                            <Button
                                title="编辑设备"
                                variant="primary"
                                size="medium"
                                onPress={handleEditDevice}
                                style={styles.actionButton}
                            />
                        </>
                    )}
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer
            title="设备管理"
            backgroundColor={theme.colors.background}
        >
            <View style={styles.container}>
                <View style={styles.listContainer}>
                    {renderDevicesList()}
                </View>
                <View style={styles.detailContainer}>
                    {renderDeviceDetail()}
                </View>
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
    },
    listContainer: {
        flex: 1,
        maxWidth: 400,
        padding: theme.spacing.md,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    detailContainer: {
        flex: 2,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    filtersContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.18,
                shadowRadius: 1.0,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    searchInput: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 40,
    },
    filterGroup: {
        marginRight: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    filterLabel: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
        fontWeight: '500',
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    filterOption: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minWidth: 80,
        alignItems: 'center',
    },
    activeFilterOption: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterOptionText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textPrimary,
    },
    activeFilterOptionText: {
        color: theme.colors.onPrimary,
        fontWeight: '500',
    },
    devicesListContainer: {
        flex: 1,
    },
    devicesList: {
        flex: 1,
        marginBottom: theme.spacing.md,
    },
    deviceItem: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.18,
                shadowRadius: 1.0,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    selectedDeviceItem: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}10`,
    },
    disconnectedDeviceItem: {
        opacity: 0.7,
    },
    deviceItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deviceIcon: {
        fontSize: 32,
        marginRight: theme.spacing.md,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    deviceRoom: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    deviceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing.xs,
    },
    connectedIndicator: {
        backgroundColor: theme.colors.success,
    },
    disconnectedIndicator: {
        backgroundColor: theme.colors.error,
    },
    statusText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textPrimary,
    },
    emptyListText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        padding: theme.spacing.lg,
        fontSize: theme.typography.fontSize.md,
    },
    addButton: {
        marginBottom: theme.spacing.md,
        height: 48,
        paddingHorizontal: theme.spacing.md,
    },
    emptyDetailContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.18,
                shadowRadius: 1.0,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    emptyDetailText: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    deviceDetailContainer: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        maxWidth: '100%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.18,
                shadowRadius: 1.0,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    deviceDetailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    deviceNameText: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        flex: 1,
    },
    editNameInput: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.xl,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginRight: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 56,
    },
    deviceStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    editFormGroup: {
        marginBottom: theme.spacing.lg,
    },
    editFormLabel: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
        fontWeight: '500',
    },
    editRoomInput: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 48,
    },
    detailSection: {
        marginBottom: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    detailSectionTitle: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    detailLabel: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textPrimary,
    },
    batteryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    batteryLevel: {
        width: 120,
        height: 8,
        backgroundColor: theme.colors.background,
        borderRadius: 4,
        overflow: 'hidden',
    },
    batteryFill: {
        height: '100%',
        borderRadius: 4,
    },
    detailActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.lg,
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        height: 48,
        minWidth: 100,
        maxWidth: '45%',
        paddingHorizontal: theme.spacing.sm,
    },
    deleteButton: {
        borderColor: theme.colors.error,
        backgroundColor: 'transparent',
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    expandIcon: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
});

export default DeviceManagementScreen;