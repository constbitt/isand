import React, { useState } from 'react';
import { Avatar, Box, styled } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface StyledAvatarProps {
    fio: string;
    width: number;
    height: number;
    url: string;
    editable?: boolean;
}

const Overlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.common.white,
    borderRadius: '50%',
    opacity: 0,
    transition: 'opacity 0.3s',
    '&:hover': {
        opacity: 1,
    },
}));

const StyledAvatar: React.FC<StyledAvatarProps> = ({ fio, width, height, url, editable = false }) => {
    const [imgError, setImgError] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(url);

    function stringToColor(string: string): string {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    }

    function stringAvatar(name: string, width: number, height: number) {
        const initials = name.split(' ').map(word => word[0]).join('').slice(0, 2);
        return {
            sx: {
                bgcolor: stringToColor(name),
                width: `${width}px`,
                height: `${height}px`,
                fontSize: `${width / 2.5}px`,
            },
            children: initials,
        };
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && e.target.result) {
                    setAvatarUrl(e.target.result as string);
                    setImgError(false);
                }
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const handleClick = () => {
        document.getElementById(`avatar-file-input-${fio}`)?.click();
    };

    const avatarProps = avatarUrl && !imgError ? 
        { src: avatarUrl, onError: () => setImgError(true) } : 
        stringAvatar(fio, width, height);

    return (
        <>
            <Box position="relative" display="inline-block" width={width} height={height}>
                <Avatar
                    sx={{ width, height, ...('sx' in avatarProps ? avatarProps.sx : {}) }}
                    {...avatarProps}
                />
                {editable && (
                    <Overlay onClick={handleClick}>
                        <PhotoCameraIcon />
                    </Overlay>
                )}
            </Box>
            <input
                id={`avatar-file-input-${fio}`}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </>
    );
};

export default StyledAvatar;