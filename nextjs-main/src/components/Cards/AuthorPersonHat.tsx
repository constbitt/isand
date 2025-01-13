import { Stack, SxProps, Theme, Typography } from "@mui/material";
import StyledAvatar from "../Avatar/StyledAvatar";
import CheckIcon from '@mui/icons-material/Check';


const AuthorPersonHatCard: React.FC<{ 
    author: { 
        a_fio: string,
        a_aff_org_name: string, 
        avatar: string,
        representative?: boolean
        size?: number
    }
    sx?: SxProps<Theme>
}> = ({ author, sx }): React.ReactElement => {
    return (
        <Stack direction={'row'} spacing={4} sx={{
            alignItems: 'center', 
            justifyContent: 'center',
            ...sx    
        }}>
            <StyledAvatar fio={author.a_fio} height={author.size ?? 150} width={author.size ?? 150} url={author.avatar} />
            <Stack spacing={4}>
            <Typography 
                color={'primary'} 
                variant="h4" 
                component="h2" 
                sx={{ 
                    whiteSpace: 'pre-line', 
                    wordBreak: 'break-word', 
                    alignSelf: 'flex-start' 
                }}
                className="fio-text"
                >
                {author.a_fio}
            </Typography>

                <Stack>
                    <Typography variant="body2" color={author.representative ? "primary" : "textSecondary"} sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                        {author.a_aff_org_name}
                        {author.representative && !!author.a_aff_org_name.length && <>
                            <span style={{color: 'gray'}}>{" - представитель "}</span>
                            <CheckIcon sx={{color: 'gray'}} fontSize="small" />
                        </>}
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default AuthorPersonHatCard;