import { Visibility, VisibilityOff } from "@mui/icons-material"
import { IconButton, InputAdornment, TextField } from "@mui/material"
import { useState } from "react"

interface IPasswordTextField {
    label: string
    value?: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    error: boolean
    error_text: string
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    disabled?: boolean
}

const PasswordTextField: React.FC<IPasswordTextField> = ({ label, value, onChange, error, error_text, onKeyDown, disabled }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <TextField
            label={label}
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            value={value}
            sx={{flexGrow: 1,}}
            onChange={onChange}
            error={error}
            helperText={error_text}
            onKeyDown={onKeyDown}
            disabled={disabled}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            disabled={disabled}
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default PasswordTextField;