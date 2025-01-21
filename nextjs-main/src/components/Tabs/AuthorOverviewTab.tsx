import { Box, Typography } from "@mui/material";
import ScienceObjectReview from "../CenterContainer/ScienceObjectReview";
import { FC } from "react";

interface AuthorOverviewTabProps {
    prndAuthor: any;
    matchingAuthorId: number | null;
    prndAuthorLoading: boolean;
}

const AuthorOverviewTab: FC<AuthorOverviewTabProps> = ({ prndAuthor, matchingAuthorId, prndAuthorLoading }) => {
    return (
        <Box sx={{ padding: 2, paddingLeft: 20, maxHeight: '500px', overflowY: 'auto', paddingBottom: 30 }}>
            {prndAuthorLoading ? (
                <Typography></Typography>
            ) : prndAuthor ? (
                <ScienceObjectReview
                    idAuthor={matchingAuthorId || 0}
                    citations={prndAuthor.citations || []}
                    publications={prndAuthor.publications || []}
                    description={prndAuthor.description || ""}
                    geoposition={prndAuthor.geoposition || ""}
                    ids={prndAuthor.ids || []}
                    objectType="authors"
                />
            ) : (
                <Typography>Автор не найден</Typography>
            )}
        </Box>
    );
};

export default AuthorOverviewTab;
