import { Stack, SxProps, Theme, Typography } from "@mui/material";
import StyledAvatar from "../Avatar/StyledAvatar";
import CheckIcon from '@mui/icons-material/Check';

interface ConferenceData {
    conf_name: string;
    avatar?: string;
    representative?: boolean;
}

const ConferencePersonHatCard: React.FC<{ 
    conference: ConferenceData;
    sx?: SxProps<Theme>
}> = ({ conference, sx }): React.ReactElement => {
    return (
        <Stack direction={'row'} spacing={4} sx={{
            alignItems: 'center', 
            justifyContent: 'center',
            ...sx    
        }}>
            <StyledAvatar fio={conference.conf_name} height={150} width={150} url={conference.avatar || ''} />
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
                    className="org-name-text"
                >
                    {conference.conf_name}
                </Typography>

                <Stack>
                    <Typography variant="body2" color={conference.representative ? "primary" : "textSecondary"} sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default ConferencePersonHatCard;
