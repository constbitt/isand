import { Stack, TextField, Button } from "@mui/material"
import PasswordTextField from "../TextField/PasswordTextField"

const PasswordChange: React.FC = (): React.ReactElement => {
    return (
        <Stack spacing={1}>
            <Stack direction="column" spacing={1}>
                <TextField 
                    sx={{ flexGrow: 1 }}
                    label='Электронная почта' 
                    variant="outlined"
                />
                <Button
                    variant="contained"
                    style={{ backgroundColor: '#1B4596' }}
                >
                    Отправить код
                </Button>
            </Stack>
            <PasswordTextField 
                label="Код с почты"
                onChange={() => {}}
                error={false}
                error_text=""
            />
            <PasswordTextField 
                label="Новый пароль"
                onChange={() => {}}
                error={false}
                error_text=""
            />
            <PasswordTextField 
                label="Подтвердите пароль"
                onChange={() => {}}
                error={false}
                error_text=""
            />
        </Stack>
    )
}

export default PasswordChange; 