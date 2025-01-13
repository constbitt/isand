import { Container, Stack, Typography } from "@mui/material";
import StyledAvatar from "../Avatar/StyledAvatar";


const AllPersonHat: React.FC<{ 
    name: string,
    geoposition?: string, 
    avatar: string 
}> = ({ name, avatar, geoposition }): React.ReactElement => {
    return (
        <Container sx={{display: 'flex', justifyContent: 'center'}}>
            <Stack direction={'row'} spacing={4} sx={{alignItems: 'center', justifyContent: 'center', maxWidth: '80%'}}>
                <StyledAvatar fio={name} height={150} url="" width={150} />
                <Stack spacing={4}>
                    <Typography color={'primary'} variant="h4" component="h2" sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                        {name}
                    </Typography>
                    <Typography variant="body2" color={'primary'} sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                        {geoposition}
                    </Typography>
                </Stack>
            </Stack>
        </Container>
    );
};

export default AllPersonHat;