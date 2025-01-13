import { Card, CardContent, Container, Stack, Typography } from "@mui/material";
import StyledAvatar from "../Avatar/StyledAvatar";

const AuthorCard: React.FC<{ author: { a_fio: string; a_aff_org_name: string[] } }> = ({ author }) => {

    return (
        <Container>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                    <Stack direction={'row'} spacing={1} sx={{alignItems: 'center'}}>
                        <StyledAvatar fio={author.a_fio} url="" width={60} height={60} />
                        <Stack sx={{justifyContent: 'center'}}>
                            <Typography variant="h5" component="h2">
                                {author.a_fio}
                            </Typography>
                            {author.a_aff_org_name && author.a_aff_org_name.map((affiliation, index) => (
                                <Typography key={index} variant="body2" color="textSecondary">
                                    {affiliation}
                                </Typography>
                            ))}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};

export default AuthorCard;