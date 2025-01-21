import { Stack, SxProps, Theme, Typography } from "@mui/material";
import StyledAvatar from "../Avatar/StyledAvatar";
import CheckIcon from '@mui/icons-material/Check';
import { useGetOrgCardInfoQuery } from "@/src/store/api/serverApiV2_5";

const OrgPersonHatCard: React.FC<{ 
    id: number;
    sx?: SxProps<Theme>
}> = ({ id, sx }): React.ReactElement => {
    const { data, isLoading } = useGetOrgCardInfoQuery(id, { skip: id < 0 });

    if (isLoading) {
        return <Typography>Загрузка информации об организации...</Typography>;
    }

    if (!data || data.length === 0) {
        return <Typography>Организация не найдена.</Typography>;
    }

    const organization = data[0];

    return (
        <Stack direction={'row'} spacing={4} sx={{
            alignItems: 'center', 
            justifyContent: 'center',
            ...sx    
        }}>
            <StyledAvatar fio={organization.org_name} height={150} width={150} url={organization.avatar} />
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
                    {organization.org_name}
                </Typography>

                <Stack>
                    <Typography variant="body2" color={organization.representative ? "primary" : "textSecondary"} sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default OrgPersonHatCard;
