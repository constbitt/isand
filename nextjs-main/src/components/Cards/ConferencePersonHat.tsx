import { Stack, SxProps, Theme, Typography } from "@mui/material";
import StyledAvatar from "../Avatar/StyledAvatar";
import CheckIcon from '@mui/icons-material/Check';
import { useGetConferenceInfoQuery } from "@/src/store/api/serverApiV2_5";

const ConferencePersonHatCard: React.FC<{ 
    id: number;
    sx?: SxProps<Theme>
}> = ({ id, sx }): React.ReactElement => {
    const { data, isLoading } = useGetConferenceInfoQuery(id, { skip: id < 0 });

    if (isLoading) {
        return <Typography>Загрузка информации о конференции...</Typography>;
    }

    if (!data || data.length === 0) {
        return <Typography>Конференция не найдена.</Typography>;
    }

    const conference = data[0];

    return (
        <Stack direction={'row'} spacing={4} sx={{
            alignItems: 'center', 
            justifyContent: 'center',
            ...sx    
        }}>
            <StyledAvatar fio={conference.conf_name} height={150} width={150} url={conference.avatar} />
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
