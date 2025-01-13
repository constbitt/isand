import { useTypedDispatch } from "@/src/hooks/useTypedDispatch"
import { useTypedSelector } from "@/src/hooks/useTypedSelector"
import { selectPassError, setAuthEmail, setAuthPassword, setPassError } from "@/src/store/slices/headerModalSlice"
import { Stack, TextField, Typography } from "@mui/material"
import PasswordTextField from "../TextField/PasswordTextField"


const AuthorizationComponent: React.FC<{onKeyDown: () => void}> = ({onKeyDown}): React.ReactElement => {
    const dispatch = useTypedDispatch()    
    const pass_error = useTypedSelector(selectPassError)
    
    const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setPassError(false))
        dispatch(setAuthEmail(event.target.value))
    }

    const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setPassError(false))
        dispatch(setAuthPassword(event.target.value))
    }

    return (
        <Stack spacing={1}>
            <TextField 
                sx={{ flexGrow: 1 }}
                label='Электронная почта' 
                variant="outlined"
                onChange={handleChangeEmail}
                error={pass_error}
                helperText={pass_error && "Не верный логин или пароль"}
            />
            <PasswordTextField 
                label="Пароль" 
                onChange={handleChangePassword} 
                error={pass_error} 
                error_text={pass_error ? "Не верный логин или пароль" : ""}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        console.log('sex')
                        onKeyDown()
                    }
                }} 
            />
            <Typography color={'rgba(27, 69, 150, 1)'} sx={{alignSelf: 'flex-start', cursor: 'pointer'}}>Забыли пароль?</Typography>
        </Stack>
    )
}

export default AuthorizationComponent;