import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import theme from '../../theme';

interface Scene {
  id: string;
  name: string;
  icon: string;
  description: string;
  devices: {
    id: string;
    name: string;
    type: string;
    action: string;
    value?: number;
  }[];
  isActive: boolean;
  isCustom: boolean;
  createdAt: string;
}

const SceneManagementScreen: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([
    // 初始化场景数据...
  ]);

  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectScene = (scene: Scene) => {
    setSelectedScene(scene);
    setIsEditing(false);
  };

  const handleActivateScene = (sceneId: string) => {
    setScenes(scenes.map(scene => ({
      ...scene,
      isActive: scene.id === sceneId,
    })));

    if (selectedScene && selectedScene.id === sceneId) {
      setSelectedScene({
        ...selectedScene,
        isActive: true,
      });
    }
  };

  const handleEditScene = () => {
    if (selectedScene) {
      setEditName(selectedScene.name);
      setEditIcon(selectedScene.icon);
      setEditDescription(selectedScene.description);
      setIsEditing(true);
    }
  };

  const handleSaveScene = () => {
    if (selectedScene && editName.trim()) {
      const updatedScene: Scene = {
        ...selectedScene,
        name: editName,
        icon: editIcon,
        description: editDescription,
      };

      setScenes(scenes.map(scene =>
          scene.id === selectedScene.id ? updatedScene : scene
      ));

      setSelectedScene(updatedScene);
      setIsEditing(false);
    }
  };

  const handleDeleteScene = () => {
    if (selectedScene) {
      setScenes(scenes.filter(scene => scene.id !== selectedScene.id));
      setSelectedScene(null);
    }
  };

  const handleCreateScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      name: '新场景',
      icon: '📱',
      description: '描述这个场景的用途和效果',
      devices: [],
      isActive: false,
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setScenes([...scenes, newScene]);
    setSelectedScene(newScene);
    setEditName(newScene.name);
    setEditIcon(newScene.icon);
    setEditDescription(newScene.description);
    setIsEditing(true);
  };

  const filteredScenes = scenes.filter(scene => {
    if (searchQuery && !scene.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (filterType === 'system' && scene.isCustom) {
      return false;
    }
    if (filterType === 'custom' && !scene.isCustom) {
      return false;
    }

    return true;
  });

  const renderScenesList = () => (
      <View style={styles.scenesListContainer}>
        <View style={styles.searchContainer}>
          <TextInput
              style={styles.searchInput}
              placeholder="搜索场景..."
              value={searchQuery}
              onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
              style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
              onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>全部</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.filterButton, filterType === 'system' && styles.activeFilter]}
              onPress={() => setFilterType('system')}
          >
            <Text style={[styles.filterText, filterType === 'system' && styles.activeFilterText]}>系统场景</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.filterButton, filterType === 'custom' && styles.activeFilter]}
              onPress={() => setFilterType('custom')}
          >
            <Text style={[styles.filterText, filterType === 'custom' && styles.activeFilterText]}>自定义场景</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scenesList}>
          {filteredScenes.length > 0 ? (
              filteredScenes.map((scene) => (
                  <TouchableOpacity
                      key={scene.id}
                      style={[
                        styles.sceneItem,
                        selectedScene?.id === scene.id && styles.selectedSceneItem,
                        scene.isActive && styles.activeSceneItem
                      ]}
                      onPress={() => handleSelectScene(scene)}
                  >
                    <View style={styles.sceneItemHeader}>
                      <Text style={styles.sceneIcon}>{scene.icon}</Text>

                      <View style={styles.sceneInfo}>
                        <Text style={styles.sceneName}>{scene.name}</Text>
                        <Text style={styles.sceneDevices} numberOfLines={1}>
                          {scene.devices.length} 个设备
                        </Text>
                      </View>

                      {scene.isCustom && (
                          <View style={styles.customBadge}>
                            <Text style={styles.customBadgeText}>自定义</Text>
                          </View>
                      )}
                    </View>

                    <Text style={styles.sceneDescription} numberOfLines={2}>
                      {scene.description}
                    </Text>

                    <View style={styles.sceneActions}>
                      <Button
                          title={scene.isActive ? "已激活" : "激活"}
                          variant={scene.isActive ? "outline" : "primary"}
                          size="small"
                          onPress={() => handleActivateScene(scene.id)}
                          disabled={scene.isActive}
                          style={styles.activateButton}
                      />
                    </View>
                  </TouchableOpacity>
              ))
          ) : (
              <Text style={styles.emptyListText}>没有找到匹配的场景</Text>
          )}
        </ScrollView>

        <Button
            title="创建新场景"
            variant="primary"
            size="medium"
            onPress={handleCreateScene}
            style={styles.createButton}
            fullWidth
        />
      </View>
  );

  const renderSceneDetail = () => {
    if (!selectedScene) {
      return (
          <View style={styles.emptyDetailContainer}>
            <Text style={styles.emptyDetailText}>选择一个场景查看详情</Text>
          </View>
      );
    }

    if (isEditing) {
      return (
          <View style={styles.sceneDetailContainer}>
            <View style={styles.sceneDetailHeader}>
              <View style={styles.editIconContainer}>
                <Text style={styles.currentIconLabel}>当前图标:</Text>
                <Text style={styles.currentIcon}>{editIcon}</Text>

                <Text style={styles.iconOptionsLabel}>选择图标:</Text>
                <View style={styles.iconOptions}>
                  {['🏠', '🌙', '🎬', '💼', '🌞', '🍽️', '🛀', '🎮', '📱', '🎵'].map((icon) => (
                      <TouchableOpacity
                          key={icon}
                          style={[styles.iconOption, editIcon === icon && styles.selectedIconOption]}
                          onPress={() => setEditIcon(icon)}
                      >
                        <Text style={styles.iconOptionText}>{icon}</Text>
                      </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.editNameContainer}>
                <TextInput
                    style={styles.editNameInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="场景名称"
                />

                <View style={styles.sceneDetailActions}>
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
                      onPress={handleSaveScene}
                      disabled={!editName.trim()}
                      style={styles.actionButton}
                  />
                </View>
              </View>
            </View>

            <TextInput
                style={styles.editDescriptionInput}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="场景描述"
                multiline
            />

            <Card title="设备配置" style={styles.devicesCard}>
              <Text style={styles.editDevicesText}>
                设备配置编辑功能即将推出...
              </Text>
            </Card>
          </View>
      );
    }

    return (
        <View style={styles.sceneDetailContainer}>
          <View style={styles.sceneDetailHeader}>
            <View style={styles.sceneDetailTitle}>
              <Text style={styles.sceneDetailIcon}>{selectedScene.icon}</Text>
              <Text style={styles.sceneDetailName}>{selectedScene.name}</Text>
            </View>

            <View style={styles.sceneDetailActions}>
              {selectedScene.isCustom && (
                  <Button
                      title="编辑"
                      variant="outline"
                      size="small"
                      onPress={handleEditScene}
                      style={styles.actionButton}
                  />
              )}

              <Button
                  title={selectedScene.isActive ? "已激活" : "激活"}
                  variant={selectedScene.isActive ? "outline" : "primary"}
                  size="small"
                  onPress={() => handleActivateScene(selectedScene.id)}
                  disabled={selectedScene.isActive}
                  style={styles.actionButton}
              />

              {selectedScene.isCustom && (
                  <Button
                      title="删除"
                      variant="outline"
                      size="small"
                      onPress={handleDeleteScene}
                      style={[styles.actionButton, styles.deleteButton]}
                  />
              )}
            </View>
          </View>

          <ScrollView style={styles.sceneDetailContent}>
            <Card title="场景信息" style={styles.infoCard}>
              <Text style={styles.sceneDetailDescription}>
                {selectedScene.description}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>类型:</Text>
                <Text style={styles.infoValue}>
                  {selectedScene.isCustom ? '自定义场景' : '系统场景'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>创建时间:</Text>
                <Text style={styles.infoValue}>{selectedScene.createdAt}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>状态:</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusIndicator,
                    selectedScene.isActive ? styles.activeIndicator : styles.inactiveIndicator
                  ]} />
                  <Text style={styles.statusText}>
                    {selectedScene.isActive ? '已激活' : '未激活'}
                  </Text>
                </View>
              </View>
            </Card>

            <Card title="设备配置" style={styles.devicesCard}>
              {selectedScene.devices.length > 0 ? (
                  selectedScene.devices.map((device, index) => (
                      <View key={index} style={styles.deviceRow}>
                        <View style={styles.deviceInfo}>
                          <Text style={styles.deviceName}>{device.name}</Text>
                          <Text style={styles.deviceType}>
                            {device.type === 'light' ? '灯光' :
                                device.type === 'thermostat' ? '温控' :
                                    device.type === 'lock' ? '门锁' :
                                        device.type === 'camera' ? '摄像头' :
                                            device.type === 'speaker' ? '音箱' :
                                                device.type === 'curtain' ? '窗帘' :
                                                    device.type === 'tv' ? '电视' : '其他设备'}
                          </Text>
                        </View>

                        <View style={styles.deviceAction}>
                          <Text style={styles.deviceActionText}>
                            {device.action === 'on' ? '开启' :
                                device.action === 'off' ? '关闭' :
                                    device.action === 'locked' ? '锁定' :
                                        device.action === 'unlocked' ? '解锁' :
                                            device.action === 'open' ? '打开' :
                                                device.action === 'closed' ? '关闭' : device.action}
                            {device.value !== undefined ? ` (${device.value}°C)` : ''}
                          </Text>
                        </View>
                      </View>
                  ))
              ) : (
                  <Text style={styles.noDevicesText}>此场景未配置任何设备</Text>
              )}
            </Card>
          </ScrollView>
        </View>
    );
  };

  return (
      <ScreenContainer
          title="场景管理"
          backgroundColor={theme.colors.background}
      >
        <View style={styles.container}>
          <View style={styles.listContainer}>
            {renderScenesList()}
          </View>
          <View style={styles.detailContainer}>
            {renderSceneDetail()}
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
  listContainer: {
    flex: 1,
    maxWidth: 400,
    padding: theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  detailContainer: {
    flex: 2,
    padding: theme.spacing.md,
  },
  scenesListContainer: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: theme.spacing.sm,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  activeFilterText: {
    color: theme.colors.onPrimary,
  },
  scenesList: {
    flex: 1,
    marginBottom: theme.spacing.sm,
  },
  sceneItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  selectedSceneItem: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  activeSceneItem: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  sceneItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sceneIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  sceneInfo: {
    flex: 1,
  },
  sceneName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sceneDevices: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  customBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  customBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  sceneDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.lineHeight.md,
  },
  sceneActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  activateButton: {
    minWidth: 80,
  },
  emptyListText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    padding: theme.spacing.lg,
  },
  createButton: {
    marginBottom: theme.spacing.md,
  },
  emptyDetailContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  emptyDetailText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  sceneDetailContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  sceneDetailHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  editIconContainer: {
    width: 120,
    marginRight: theme.spacing.md,
  },
  currentIconLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  currentIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  iconOptionsLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  iconOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconOption: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.xs,
  },
  selectedIconOption: {
    backgroundColor: theme.colors.primary,
  },
  iconOptionText: {
    fontSize: 20,
  },
  editNameContainer: {
    flex: 1,
  },
  editNameInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  sceneDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  deleteButton: {
    borderColor: theme.colors.error,
  },
  editDescriptionInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.md,
  },
  devicesCard: {
    marginBottom: theme.spacing.md,
  },
  editDevicesText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
  },
  sceneDetailTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sceneDetailIcon: {
    fontSize: 30,
    marginRight: theme.spacing.md,
  },
  sceneDetailName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  sceneDetailContent: {
    flex: 1,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  sceneDetailDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.lineHeight.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  activeIndicator: {
    backgroundColor: theme.colors.success,
  },
  inactiveIndicator: {
    backgroundColor: theme.colors.error,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  deviceType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  deviceAction: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  deviceActionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  noDevicesText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
  },
});

export default SceneManagementScreen;