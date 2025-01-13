import { Stack, SxProps, TextField, Theme, Typography } from "@mui/material";

interface SettingTextFieldProps {
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    blueBackGraund?: boolean
    sx?: SxProps<Theme>;
}

const SettingTextField: React.FC<SettingTextFieldProps> = ({
    label,
    value,
    onChange,
    disabled,
    blueBackGraund,
    sx,
}) => (
    <Stack sx={sx} spacing={2} direction="row">
        <Typography sx={{ minWidth: 140, textAlign: 'end' }}>{label}</Typography>
        <TextField
            value={value}
            disabled={disabled}
            onChange={onChange}
            sx={{
                width: '100%',
                '.MuiOutlinedInput-root': {
                    '&.Mui-disabled': {
                        backgroundColor: blueBackGraund ? 'rgba(215, 232, 255, 1)' : 'inherit',
                    },
                },
            }}
        />
    </Stack>
);

export default SettingTextField;