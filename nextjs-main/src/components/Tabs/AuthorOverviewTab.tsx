import { Box, Typography } from "@mui/material";
import ScienceObjectReview from "../CenterContainer/ScienceObjectReview";
import { FC } from "react";
import { useGetAuthorByPrndQuery, useGetAuthorsActivityQuery } from '@/src/store/api/serverApiV2_5';
import { calculateAllCount } from '@/src/tools/calculateAllCount';

interface AuthorOverviewTabProps {
    prndAuthor: any;
    matchingAuthorId: number | null;
    prndAuthorLoading: boolean;
}

const AuthorOverviewTab: FC<AuthorOverviewTabProps> = ({ prndAuthor, matchingAuthorId, prndAuthorLoading }) => {
    const { data: authorByPrnd } = useGetAuthorByPrndQuery(prndAuthor?.id, { skip: prndAuthor < 0 });
    const authorIsandId = authorByPrnd ? authorByPrnd[0]?.author_isand_id : null;
    const {data: authorActivity } = useGetAuthorsActivityQuery(authorIsandId, {skip: authorIsandId < 0});
    const publicationsCount = authorActivity ? calculateAllCount(authorActivity) : null;
    
    return (
        <Box             
            sx={{
                height: 'calc(100vh - 300px)',
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                },
            }}
        >
            {prndAuthorLoading ? (
                <Typography></Typography>
            ) : prndAuthor ? (
                <ScienceObjectReview
                    idAuthor={matchingAuthorId || 0}
                    citations={prndAuthor.citations || []}
                    publications={publicationsCount || prndAuthor.publications || []}
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
