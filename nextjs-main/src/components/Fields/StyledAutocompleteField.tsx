import Autocomplete, {AutocompleteProps} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import React from "react";

const StyledAutocomplete = ({value, onChange, multiple = false, options, placeholder, ...props}:
                                {
                                    value: any,
                                    onChange: (event: React.SyntheticEvent, value: any | any[]) => void,
                                    multiple?: boolean,
                                    options: readonly any[],
                                    placeholder: string,
                                } & Omit<AutocompleteProps<any, any, any, any>, "renderInput">) => {

    return (
        <Autocomplete
            autoComplete={false}
            value={value}
            onChange={(event, newValue) => {
                onChange(event, newValue)
            }
            }
            multiple={multiple}
            options={options}
            getOptionLabel={option=>String(option)}

            size={"small"}
            renderInput={(params) => {
                return (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        sx={{
                            "& .MuiAutocomplete-inputRoot": {
                                borderRadius: "7px"
                            }
                        }}
                    />
                );
            }}
            {...props}
        />);
}

export default StyledAutocomplete