import Autocomplete, {AutocompleteProps} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import Select from "react-select";



const StyledSelect = ({ value, onChange, multiple = false, options, placeholder, ...props }: {
  value: any,
  onChange: (newValue: any) => void,
  multiple?: boolean,
  options: readonly any[],
  placeholder: string,
}) => {

  const customStyles = {
    control: (base: any) => ({
      ...base,
      borderRadius: '7px',
      padding: '4px',
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: '#e4e4e4',
      borderRadius: '4px',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: '#000',
    }),
  };

  const getOptionLabel = (option: any) =>  option.name || option.label || option.value || "Unknown";
  const getOptionValue = (option: any) => option.id || option.value;

  return (
    <Select
      isMulti={multiple}
      value={value}
      onChange={onChange}
      options={options}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      placeholder={placeholder}
      styles={customStyles}
      {...props}
    />
  );
};

export default StyledSelect;
