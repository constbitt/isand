import { Stack, TextField, Button } from "@mui/material"
import PasswordTextField from "../TextField/PasswordTextField"
import { useTypedDispatch } from "@/src/hooks/useTypedDispatch"
import { setAlert } from "@/src/store/slices/alertationSlice"
import { useState, useEffect } from "react"

interface PasswordChangeProps {
    onResetPassword: (fn: () => void) => void;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({ onResetPassword }): React.ReactElement => {
    const dispatch = useTypedDispatch()
    const [code, setCode] = useState<string>('')
    const [isCodeVerified, setIsCodeVerified] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [newPassword, setNewPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [passwordError, setPasswordError] = useState<boolean>(false)
    const [lenError, setLenError] = useState<boolean>(false)
    const [nonePassword, setNonePassword] = useState<boolean>(false)

    const clearFields = () => {
        setCode('')
        setIsCodeVerified(false)
        setEmail('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError(false)
        setLenError(false)
        setNonePassword(false)
    }

    const handleSendCode = () => {
        if (!email) {
            dispatch(setAlert({
                message: 'Введите email',
                severity: 'error',
                open: true,
                autoHideDuration: 3000
            }))
            return
        }

        if (email === 'admin@ipu.ru') {
            dispatch(setAlert({
                message: 'Код отправлен',
                severity: 'success',
                open: true,
                autoHideDuration: 3000
            }))
        } else {
            dispatch(setAlert({
                message: 'Пользователь не зарегистрирован',
                severity: 'error',
                open: true,
                autoHideDuration: 3000
            }))
        }
    }

    const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newCode = event.target.value
        setCode(newCode)
        
        if (newCode === '1234') {
            setIsCodeVerified(true)
            dispatch(setAlert({
                message: 'Почта подтверждена',
                severity: 'success',
                open: true,
                autoHideDuration: 3000
            }))
        } else if (newCode.length === 4) {
            setIsCodeVerified(false)
            dispatch(setAlert({
                message: 'Неверный код',
                severity: 'error',
                open: true,
                autoHideDuration: 3000
            }))
        }
    }

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setNewPassword(value)
        setNonePassword(false)
        setPasswordError(false)
        
        if (value.length > 0 && value.length < 8) {
            setLenError(true)
        } else {
            setLenError(false)
            if (value !== confirmPassword && confirmPassword.length > 0) {
                setPasswordError(true)
            }
        }
    }

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setConfirmPassword(value)
        setPasswordError(value !== newPassword)
    }

    const handleResetPassword = () => {
        if (!isCodeVerified) return

        let hasError = false

        if (!newPassword) {
            setNonePassword(true)
            hasError = true
        }

        if (newPassword.length < 8) {
            setLenError(true)
            hasError = true
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(true)
            hasError = true
        }

        if (hasError) {
            dispatch(setAlert({
                message: nonePassword ? 'Пароль не может быть пустым' : 
                         lenError ? 'Пароль должен быть не менее 8 символов' :
                         'Пароли не совпадают',
                severity: 'error',
                open: true,
                autoHideDuration: 3000
            }))
            return
        }

        dispatch(setAlert({
            message: 'Пароль восстановлен',
            severity: 'success',
            open: true,
            autoHideDuration: 3000
        }))
        clearFields()
    }

    useEffect(() => {
        onResetPassword(handleResetPassword)
    }, [onResetPassword, newPassword, confirmPassword, isCodeVerified, nonePassword, lenError, passwordError])

    return (
        <Stack spacing={1}>
            <Stack direction="column" spacing={1}>
                <TextField 
                    sx={{ flexGrow: 1 }}
                    label='Электронная почта' 
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    variant="contained"
                    style={{ backgroundColor: '#1B4596' }}
                    onClick={handleSendCode}
                >
                    Отправить код
                </Button>
            </Stack>
            <PasswordTextField 
                label="Код с почты"
                onChange={handleCodeChange}
                value={code}
                error={code.length === 4 && !isCodeVerified}
                error_text={code.length === 4 && !isCodeVerified ? "Неверный код" : ""}
            />
            <PasswordTextField 
                label="Новый пароль"
                onChange={handlePasswordChange}
                value={newPassword}
                error={nonePassword || lenError}
                error_text={nonePassword ? "Пароль не может быть пустым" : (lenError ? "Пароль должен быть не менее 8 символов" : "")}
                disabled={!isCodeVerified}
            />
            <PasswordTextField 
                label="Подтвердите пароль"
                onChange={handleConfirmPasswordChange}
                value={confirmPassword}
                error={passwordError}
                error_text={passwordError ? "Пароли не совпадают" : ""}
                disabled={!isCodeVerified}
            />
        </Stack>
    )
}

export default PasswordChange; 