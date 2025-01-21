import { Box, Typography } from "@mui/material";
import { FC } from "react";

interface PublOverviewTabProps {
    data: {
        annotation: string;
        publ_type: string;
        collect_type: string;
        collect_name: string;
    };
}

const PublOverviewTab: FC<PublOverviewTabProps> = ({ data }) => {
    return (
        <Box sx={{ padding: 2, paddingLeft: 15, paddingRight: 15, maxHeight: '600px', overflowY: 'auto', paddingBottom: 30 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
                
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Аннотация
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
                {data.annotation}
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
                Тип публикации:
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
                {data.publ_type}
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
                Тип издания:
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
                {data.collect_type}
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
                Название издания:
            </Typography>
            <Typography variant="body1">
                {data.collect_name}
            </Typography>
        </Box>
    );
};

export default PublOverviewTab;
