import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { CropSelector } from '../components/CropSelector';
import { PrimaryButton } from '../components/PrimaryButton';
import { marketStyles } from '../styles/marketStyles';
import { openGoogleMapsSearch, MapSearchCategory } from '../utils/maps';
import locationsData from '../data/locations.json';
import { MapPin, Landmark, Factory, Store } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import { HomeHeader } from '../components/HomeHeader';

export default function MarketSellersScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAppStore();

  const [selectedState, setSelectedState] = useState<string | null>(profile?.state || null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(profile?.district || null);
  const [selectedMandal, setSelectedMandal] = useState<string | null>(profile?.mandal || null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState<MapSearchCategory>('markets');

  // Sync profile when it loads
  useEffect(() => {
    if (profile) {
      if (profile.state) setSelectedState(profile.state);
      if (profile.district) setSelectedDistrict(profile.district);
      if (profile.mandal) setSelectedMandal(profile.mandal);
    }
  }, [profile]);

  // Extract list of states from locations hierarchy
  const states = useMemo(() => {
    if (!locationsData || !locationsData.states) return [];
    return locationsData.states.map((s) => s.name);
  }, []);

  // Compute districts dependent on state selection
  const districts = useMemo(() => {
    if (!selectedState || !locationsData || !locationsData.states) return [];
    const stateObj = locationsData.states.find((s) => s.name === selectedState);
    return stateObj ? stateObj.districts.map((d) => d.name) : [];
  }, [selectedState]);

  // Compute mandals dependent on district selection
  const mandals = useMemo(() => {
    if (!selectedState || !selectedDistrict || !locationsData || !locationsData.states) return [];
    const stateObj = locationsData.states.find((s) => s.name === selectedState);
    if (!stateObj) return [];
    const districtObj = stateObj.districts.find((d) => d.name === selectedDistrict);
    return districtObj ? districtObj.mandals.map((m) => m.name) : [];
  }, [selectedState, selectedDistrict]);

  // Handler for state dropdown selection changes
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedDistrict(null);
    setSelectedMandal(null);
  };

  // Handler for district dropdown selection changes
  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSelectedMandal(null);
  };

  const handleSearch = () => {
    openGoogleMapsSearch(selectedCrop, selectedMandal, selectedDistrict, selectedState, searchCategory);
  };

  const isFormComplete = !!(selectedState && selectedDistrict && selectedMandal && selectedCrop);

  return (
    <View style={marketStyles.container}>
      <HomeHeader />
      <ScrollView
        contentContainerStyle={marketStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Subtitle Block */}
        <View style={marketStyles.headerCard}>
          <Text style={marketStyles.headerTitle}>Find Crop Buyers</Text>
          <Text style={marketStyles.headerSubtitle}>
            Select your location and crop to find nearby wholesale markets and buyers on Google Maps.
          </Text>
        </View>

        {/* Dropdown selectors and crop tag block */}
        <View style={marketStyles.formCard}>
          {/* State selector */}
          <SearchableDropdown
            label="State"
            placeholder="Select State"
            data={states}
            value={selectedState}
            onChange={handleStateChange}
          />

          {/* District selector */}
          <SearchableDropdown
            label="District"
            placeholder={selectedState ? "Select District" : "First select State"}
            data={districts}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedState}
          />

          {/* Mandal selector */}
          <SearchableDropdown
            label="Mandal"
            placeholder={selectedDistrict ? "Select Mandal" : "First select District"}
            data={mandals}
            value={selectedMandal}
            onChange={setSelectedMandal}
            disabled={!selectedDistrict}
          />

          {/* Crop to sell selector */}
          <View style={marketStyles.fieldGroup}>
            <Text style={marketStyles.fieldLabel}>Crop to Sell</Text>
            <CropSelector selectedCrop={selectedCrop} onSelectCrop={setSelectedCrop} />
          </View>

          {/* Search Category Selector */}
          <View style={marketStyles.fieldGroup}>
            <Text style={marketStyles.fieldLabel}>Search Category</Text>
            <View style={marketStyles.toggleRow}>
              <TouchableOpacity
                style={[
                  marketStyles.toggleBtn,
                  searchCategory === 'markets' && marketStyles.toggleBtnActive,
                ]}
                onPress={() => setSearchCategory('markets')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Landmark size={15} color={searchCategory === 'markets' ? 'white' : '#666666'} />
                  <Text
                    style={[
                      marketStyles.toggleBtnText,
                      searchCategory === 'markets' && marketStyles.toggleBtnTextActive,
                    ]}
                  >
                    Markets
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  marketStyles.toggleBtn,
                  searchCategory === 'mills' && marketStyles.toggleBtnActive,
                ]}
                onPress={() => setSearchCategory('mills')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Factory size={15} color={searchCategory === 'mills' ? 'white' : '#666666'} />
                  <Text
                    style={[
                      marketStyles.toggleBtnText,
                      searchCategory === 'mills' && marketStyles.toggleBtnTextActive,
                    ]}
                  >
                    Mills
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  marketStyles.toggleBtn,
                  searchCategory === 'shops' && marketStyles.toggleBtnActive,
                ]}
                onPress={() => setSearchCategory('shops')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Store size={15} color={searchCategory === 'shops' ? 'white' : '#666666'} />
                  <Text
                    style={[
                      marketStyles.toggleBtnText,
                      searchCategory === 'shops' && marketStyles.toggleBtnTextActive,
                    ]}
                  >
                    Shops
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Maps search button */}
          <PrimaryButton
            title="Find Buyers on Maps"
            onPress={handleSearch}
            disabled={!isFormComplete}
            icon={<MapPin size={18} color="white" />}
          />
        </View>
      </ScrollView>
    </View>
  );
}
