import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  Modal, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Platform,
  Dimensions
} from 'react-native';
import { Search, X, ChevronDown, Check, Sprout } from 'lucide-react-native';
import { cropCategories } from '../constants/crops';
import { FarmoraColors } from '../constants/colors';

interface CropSelectorProps {
  selectedCrop: string | null;
  onSelectCrop: (crop: string) => void;
}

const { height } = Dimensions.get('window');

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter crops based on search query
  const filteredCategories = cropCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.items.length > 0);

  return (
    <View>
      {/* Selection Field Trigger */}
      <TouchableOpacity
        onPress={() => {
          setSearchQuery('');
          setModalVisible(true);
        }}
        activeOpacity={0.7}
        style={styles.selectorTrigger}
      >
        <View style={styles.selectorContent}>
          <Sprout size={18} color={selectedCrop ? '#2E7D32' : '#94A3B8'} style={{ marginRight: 10 }} />
          <Text style={[styles.selectorText, !selectedCrop && styles.placeholderText]}>
            {selectedCrop || "Select Crop to Sell"}
          </Text>
        </View>
        <ChevronDown size={18} color="#94A3B8" />
      </TouchableOpacity>

      {/* Searchable Modal Bottom Sheet */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Crop</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Search Input Bar */}
            <View style={styles.searchBar}>
              <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search crop (e.g. Rice, Tomato)..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <X size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Scrollable Grouped Crop List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
            >
              {filteredCategories.length > 0 ? (
                filteredCategories.map((categoryObj) => (
                  <View key={categoryObj.category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{categoryObj.category}</Text>
                    
                    <View style={styles.itemsGrid}>
                      {categoryObj.items.map((crop) => {
                        const isSelected = selectedCrop === crop;
                        return (
                          <TouchableOpacity
                            key={crop}
                            onPress={() => {
                              onSelectCrop(crop);
                              setModalVisible(false);
                              setSearchQuery('');
                            }}
                            activeOpacity={0.7}
                            style={[
                              styles.cropItemRow,
                              isSelected && styles.cropItemRowSelected
                            ]}
                          >
                            <Text style={[
                              styles.cropItemText,
                              isSelected && styles.cropItemTextSelected
                            ]}>
                              {crop}
                            </Text>
                            {isSelected && <Check size={16} color="#2E7D32" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching crops found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: height * 0.75,
    paddingHorizontal: 24,
    paddingTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 16,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  categorySection: {
    marginBottom: 18,
  },
  categoryTitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '800',
    color: '#1B5E20',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  itemsGrid: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  cropItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  cropItemRowSelected: {
    backgroundColor: '#F0FDF4',
  },
  cropItemText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  cropItemTextSelected: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
