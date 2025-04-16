import { selectAuthenticationData, selectConfirmError, selectLenError, selectNoneEmail, selectNoneLastName, selectNoneName, selectNonePassword, selectRegConfirmPassword, selectRegistrationData, setConfirmError, setExistEmailError, setHeaderInfo, setHeaderModalInitState, setNoneEmail, setNoneLastName, setNoneName, setNonePassword, setPassError } from "@/src/store/slices/headerModalSlice";
import { Box, Button, Modal, Stack, Typography } from "@mui/material";
import { FC, ReactElement, useState } from "react";
import RegistrationComponent from "../Header/Registration";
import AuthorizationComponent from "../Header/Authorization";
import PasswordChange from "../Header/PasswordChange";
import { useTypedDispatch } from "@/src/hooks/useTypedDispatch";
import { useTypedSelector } from "@/src/hooks/useTypedSelector";
import Cookies from 'js-cookie';
import { setAlert } from "@/src/store/slices/alertationSlice";
import { useRouter } from 'next/router';

type RegistrationState = 'registration' | 'authorization' | 'passwordChange' | 'state4';

interface AuthenticationModalProps {
    open: boolean
    handleClose: () => void
}

const AuthenticationModal: FC<AuthenticationModalProps> = ({open, handleClose}): ReactElement => {
    const dispatch = useTypedDispatch()
    const router = useRouter()

    const [registration, setRegistration] = useState<RegistrationState>('authorization');

    const len_error = useTypedSelector(selectLenError)
    const confirm_error = useTypedSelector(selectConfirmError)
    const none_email = useTypedSelector(selectNoneEmail)
    const none_lastname = useTypedSelector(selectNoneLastName)
    const none_name = useTypedSelector(selectNoneName)
    const none_password = useTypedSelector(selectNonePassword)
    const confirm_password = useTypedSelector(selectRegConfirmPassword)
    const regData = useTypedSelector(selectRegistrationData)
    const authData = useTypedSelector(selectAuthenticationData)

    const handleOnClickAuth = () => {
        console.log('Auth data:', authData)
        if (!authData.main_email || !authData.password) {
            dispatch(setPassError(true))
            return
        }
        
        if (authData.main_email === 'admin@ipu.ru' && authData.password === '12345678') {
            console.log('Successful auth')
            Cookies.set('token', 'demo-token', { expires: 7 })
            /*
            dispatch(setHeaderInfo({
                header_avatar_url: '',
                header_fio: 'Администратор',
                authorization: true
            }))
            */
            router.push('/account')
            handleClose()
        } else {
            console.log('Auth failed')
            dispatch(setPassError(true))
        }
    }

    const handleOnClickReg = () => {
        if (!regData.first_name) dispatch(setNoneName(true))
        if (!regData.last_name) dispatch(setNoneLastName(true))
        if (!regData.main_email) dispatch(setNoneEmail(true))
        if (!regData.password) dispatch(setNonePassword(true))
        if (!confirm_password.length) dispatch(setConfirmError(true))
        
        if (regData.password && regData.password.length < 8) {
            dispatch(setLenError(true))
            return
        }

        if (!none_email && !none_lastname && !none_name && !none_password && !!confirm_password.length) {
            if (regData.main_email === 'admin@ipu.ru' && regData.password === '12345678') {
                setRegistration('authorization')
                dispatch(setHeaderModalInitState())
                dispatch(setAlert({
                    message: 'Пользователь успешно зарегистрирован',
                    severity: 'success',
                    open: true
                }))
            } else {
                dispatch(setPassError(true))
            }
        }
    }

    const components: {
        key: RegistrationState
        component: React.ReactElement
        title: string
        buttonText: string
        style: string
    }[] = [
        { key: 'registration', component: <RegistrationComponent onKeyDown={handleOnClickReg} />, title: 'Регистрация', buttonText: 'Зарегистрироваться', style: 'center' },
        { key: 'authorization', component: <AuthorizationComponent onKeyDown={handleOnClickAuth} onForgotPassword={() => setRegistration('passwordChange')} />, title: 'Авторизация', buttonText: 'Войти', style: 'center' },
        { key: 'passwordChange', component: <PasswordChange />, title: 'Восстановление пароля', buttonText: 'Восстановить', style: 'center' },
    ];
    const currentComponent = components.find((c) => c.key === registration);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{
                display: 'flex',
                alignItems: currentComponent?.style,
                justifyContent: 'center',
                maxHeight: '100vh',
                overflow: 'auto',
                margin: '10px 0px',
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0, 21, 64, 0.75)',
                    },
                },
            }}
        >
            <Box sx={{
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 2,
                borderRadius: 2,
                width: '25%',
            }}>
                <Stack spacing={2}>
                    {currentComponent && (
                        <>
                            <Typography color={'rgba(27, 69, 150, 1)'} fontWeight={'bold'} id="modal-modal-title" variant="h6">
                                {currentComponent.title}
                            </Typography>
                            {currentComponent.component}
                            <Button
                                type="submit"
                                onClick={registration === 'registration' ? handleOnClickReg : handleOnClickAuth}
                                variant="contained"
                                style={{ backgroundColor: '#1B4596', height: '100%' }}
                            >
                                {currentComponent.buttonText}
                            </Button>
                        </>
                    )}
                    <Typography>
                        {registration === 'registration' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
                        <span
                            onClick={() => {
                                setRegistration(registration === 'registration' ? 'authorization' : 'registration');
                                dispatch(setHeaderModalInitState());
                            }}
                            style={{ color: 'rgba(27, 69, 150, 1)', cursor: 'pointer' }}
                        >
                            {registration === 'registration' ? ' Авторизация' : ' Регистрация'}
                        </span>
                    </Typography>
                </Stack>
            </Box>
        </Modal>
    )
}

export default AuthenticationModal;