import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  dropdownStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  selectedOptionStyle?: ViewStyle;
  selectedOptionTextStyle?: TextStyle;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onValueChange,
  placeholder = '请选择',
  style,
  textStyle,
  disabled = false,
  dropdownStyle,
  optionTextStyle,
  selectedOptionStyle,
  selectedOptionTextStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          disabled && styles.dropdownButtonDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text
          style={[
            styles.selectedValueText,
            !selectedOption && styles.placeholderText,
            textStyle,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={disabled ? theme.colors.textSecondary : theme.colors.textPrimary}
        />
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.dropdown, dropdownStyle]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.selectedOption,
                    item.value === value && selectedOptionStyle,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      optionTextStyle,
                      item.value === value && styles.selectedOptionText,
                      item.value === value && selectedOptionTextStyle,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  dropdownButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  selectedValueText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  dropdown: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    maxWidth: '90%',
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedOption: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  optionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default Dropdown; 