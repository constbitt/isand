import React, { useRef, useState } from "react";
import Logo from "@/src/assets/images/home/logo.svg"
import LoginIcon from "@/src/assets/images/header/login_icon.svg"
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Image from "next/image"
import NextBreadcrumbs from "@/src/components/Breadcrumbs/NextBreadcrumbs";
import {breadcrumbs} from "@/src/configs/breadcrumbsConfig"
import Link from "next/link";
import { Stack, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { useTypedDispatch } from "@/src/hooks/useTypedDispatch";
import { setHeaderModalInitState, selectHeaderFio, selectHeaderAvaterUrl, setHeaderInfo, selectAuthorization } from "@/src/store/slices/headerModalSlice";
import { useTypedSelector } from "@/src/hooks/useTypedSelector";
import ErrorSnakeBar from "../../Snakebar/errorsnakebar";
import Cookies from 'js-cookie';
import StyledAvatar from "../../Avatar/StyledAvatar";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useGetAccountApiAuthTokenQuery } from "@/src/store/api/serverApiV6";
import AuthenticationModal from "../../Modals/AuthenticationModal";
import HelperModal from "../../Modals/HelperModal";





// const PasswordChange: React.FC = (): React.ReactElement => {
//     return (
//         <></>
//     )
// }

export default function Header(): React.ReactElement {
    const dispatch = useTypedDispatch()

    const [openAuthentification, setOpenAuthentification] = useState<boolean>(false)
    const [openHelper, setOpenHelper] = useState<boolean>(false)
    const [openMenu, setOpenMenu] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const stackRef = useRef<HTMLDivElement>(null);
    
    const header_fio = useTypedSelector(selectHeaderFio)
    const header_avatar_url = useTypedSelector(selectHeaderAvaterUrl)
    const authorization = useTypedSelector(selectAuthorization)
    

    useGetAccountApiAuthTokenQuery()

    const handleCloseAuthentification = () => {
        dispatch(setHeaderModalInitState())
        setOpenAuthentification(false)
    };


    const getDefaultTextGenerator = React.useCallback((subpath: string) => {
        return {
            ...breadcrumbs
        }[subpath] || ""
    }, [])

    
    
    const options: {name: string, url: string, disabled: boolean}[] = [
        { name: 'Уведомления', url: '/', disabled: true },
        { name: 'Изменение страниц', url: '/personality/setting', disabled: false },
        { name: 'Настройки аккаунта', url: '/', disabled: true },
        { name: 'Меню администратора', url: '/', disabled: true },
    ];

    return (
        <header className="flex h-[100px] w-full items-end">
            <Image src={Logo} priority alt={""} className={"mr-4"}/>
            <Stack direction={'row'} sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
            }} spacing={4}>
                <NextBreadcrumbs
                    getDefaultTextGenerator={getDefaultTextGenerator}
                />
                {!authorization ?
                    <Stack direction={'row'} spacing={1} sx={{alignItems: 'center', height: '60px'}}>
{/*
<Image src={LoginIcon} className="cursor-pointer" onClick={() => setOpenAuthentification(true)} alt={""} />
<Typography onClick={() => setOpenAuthentification(true)} className="cursor-pointer" variant="h5">Войти</Typography>
*/}

                        <IconButton color="primary" onClick={() => setOpenHelper(true)}>
                            <HelpOutlineIcon />
                        </IconButton>
                    </Stack>
                :
                    <Stack direction={'row'} spacing={1} sx={{alignItems: 'center', height: '60px'}}>
                        <Stack direction={'row'} spacing={1} ref={stackRef} sx={{alignItems: 'center', width: '100%',}}>
                            <StyledAvatar url={header_avatar_url} fio={header_fio} width={48} height={48} />
                            <Link href='/personality'>
                                <Typography 
                                    onClick={undefined} 
                                    sx={{
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}
                                    variant="h5"
                                >{header_fio.length > 15 ? header_fio.slice(0, 15) + '...' : header_fio}</Typography>
                            </Link>
                            <IconButton onClick={(e) => {
                                if (!openMenu) {
                                    setAnchorEl(e.currentTarget);
                                }
                                setOpenMenu(!openMenu)
                            }}>
                                <KeyboardArrowDownIcon sx={{ cursor: 'pointer' }} color="primary" />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={openMenu}
                                onClose={() => setOpenMenu(false)}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                PaperProps={{
                                    style: {
                                        width: stackRef.current ? stackRef.current.clientWidth : undefined,
                                    },
                                }}
                                sx={{
                                    mt: 1,
                                    '& .MuiPaper-root': {
                                        borderRadius: '20px',
                                    }
                                }}
                            >
                                {options.map((option, index) => option.disabled 
                                    ? <MenuItem key={index} onClick={undefined} disabled>{option.name}</MenuItem>
                                    : <Link key={index} href={option.url} passHref>
                                        <MenuItem onClick={() => setOpenMenu(false)}>{option.name}</MenuItem>
                                    </Link>
                                )}
                                <MenuItem style={{color: 'red'}} onClick={() => {
                                    dispatch(setHeaderInfo({header_avatar_url: '', header_fio: '', authorization: false}))
                                    setOpenMenu(false)
                                    Cookies.remove('token')
                                }}>Выход</MenuItem>
                            </Menu>
                        </Stack>
                        <IconButton color="primary" onClick={() => setOpenHelper(true)}>
                            <HelpOutlineIcon />
                        </IconButton>
                    </Stack>
                }
            </Stack>
            <AuthenticationModal handleClose={handleCloseAuthentification} open={openAuthentification} />
            <HelperModal open={openHelper} handleClose={() => setOpenHelper(false)} />
            <ErrorSnakeBar />
        </header>
    )
}