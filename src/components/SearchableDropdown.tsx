import React from 'react';
import { View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { marketStyles } from '../styles/marketStyles';

interface SearchableDropdownProps {
  label: string;
  data: string[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  data,
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  // Convert standard string array to structure expected by react-native-element-dropdown
  const dropdownData = data.map((item) => ({ label: item, value: item }));

  return (
    <View style={marketStyles.fieldGroup}>
      <Text style={marketStyles.fieldLabel}>{label}</Text>
      <Dropdown
        style={[
          marketStyles.dropdownContainer,
          value ? marketStyles.dropdownActive : null,
          disabled && marketStyles.dropdownDisabled,
        ]}
        placeholderStyle={marketStyles.dropdownPlaceholder}
        selectedTextStyle={marketStyles.dropdownText}
        inputSearchStyle={marketStyles.dropdownSearchInput}
        data={dropdownData}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder="Search..."
        value={value}
        disable={disabled}
        onChange={(item) => {
          onChange(item.value);
        }}
      />
    </View>
  );
};
