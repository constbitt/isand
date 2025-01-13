import { MenuItem, Select, SelectChangeEvent, Stack, SxProps, Theme, Typography } from "@mui/material";

interface SettingSelectProps {
    label: string
    value: string;
    options: string[];
    onChange: (e: SelectChangeEvent<string>) => void;
    disabled?: boolean;
    sx?: SxProps<Theme>;
}

const SettingSelect: React.FC<SettingSelectProps> = ({
    label,
    value,
    options,
    onChange,
    disabled,
    sx,
}) => (
    <Stack sx={sx} spacing={2} direction="row">
        <Typography sx={{ minWidth: 140, textAlign: 'end' }}>{label}</Typography>
        <Select
            size="medium"
            value={value}
            onChange={onChange}
            disabled={disabled}
            sx={{
                width: '100%',
                '& .MuiSelect-select': {
                    borderRadius: '12px',
                },
                '& .MuiSelect-icon': {
                    display: disabled ? 'none' : 'inline-block',
                }
            }}
        >
            {options.map((item, index) => (
                <MenuItem value={item} key={index}>
                    {item}
                </MenuItem>
            ))}
        </Select>
    </Stack>
);

export default SettingSelect;