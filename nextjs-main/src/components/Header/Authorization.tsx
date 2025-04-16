import { useTypedDispatch } from "@/src/hooks/useTypedDispatch"
import { useTypedSelector } from "@/src/hooks/useTypedSelector"
import { selectAuthEmail, selectAuthPassword, selectPassError, setAuthEmail, setAuthPassword, setPassError } from "@/src/store/slices/headerModalSlice"
import { Stack, TextField, Typography } from "@mui/material"
import PasswordTextField from "../TextField/PasswordTextField"
import { useRouter } from 'next/router'

const AuthorizationComponent: React.FC<{onKeyDown: () => void, onForgotPassword: () => void}> = ({onKeyDown, onForgotPassword}): React.ReactElement => {
    const dispatch = useTypedDispatch()    
    const pass_error = useTypedSelector(selectPassError)
    const email = useTypedSelector(selectAuthEmail)
    const password = useTypedSelector(selectAuthPassword)
    const router = useRouter()
    
    const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Email changed:', event.target.value)
        dispatch(setPassError(false))
        dispatch(setAuthEmail(event.target.value))
    }

    const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Password changed:', event.target.value)
        dispatch(setPassError(false))
        dispatch(setAuthPassword(event.target.value))
    }

    const handleKeyDown = () => {
        console.log('Login attempt:', { email, password })
        
        if (email === 'admin@ipu.ru' && password === '12345678') {
            console.log('Login successful')
            router.push('/account')
            onKeyDown()
        } else {
            console.log('Login failed')
            dispatch(setPassError(true))
        }
    }

    return (
        <Stack spacing={1}>
            <TextField 
                sx={{ flexGrow: 1 }}
                label='Электронная почта' 
                variant="outlined"
                value={email}
                onChange={handleChangeEmail}
                error={pass_error}
                helperText={pass_error && "Не верный логин или пароль"}
            />
            <PasswordTextField 
                label="Пароль" 
                value={password}
                onChange={handleChangePassword} 
                error={pass_error} 
                error_text={pass_error ? "Не верный логин или пароль" : ""}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        handleKeyDown()
                    }
                }} 
            />
            <Typography 
                onClick={onForgotPassword}
                color={'rgba(27, 69, 150, 1)'} 
                sx={{alignSelf: 'flex-start', cursor: 'pointer'}}
            >
                Забыли пароль?
            </Typography>
        </Stack>
    )
}

export default AuthorizationComponent;