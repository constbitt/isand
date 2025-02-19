import { Box, Typography } from "@mui/material";
import { FC } from "react";
import RadarComponent from "../Chart/RadarChart/Radarchart";
import TabsComponent from "./TabsComponent";

interface PublOverviewTabProps {
    data: {
        annotation: string;
        publ_type: string;
        collect_type: string;
        collect_name: string;
        storageId: number;
    };
}

const PublOverviewTab: FC<PublOverviewTabProps> = ({ data }) => {

    const tabs: { label: string, component: React.ReactNode }[] = [
        { 
            label: 'Факторы', 
            component: <RadarComponent 
                level={1} 
                id={data.storageId ? [data.storageId] : [-1]} 
                include_common_terms={0} 
                object_type='publications' 
            /> 
        },
        { 
            label: 'Подфакторы', 
            component: <RadarComponent 
                level={2} 
                id={data.storageId ? [data.storageId] : [-1]} 
                include_common_terms={0} 
                object_type='publications' 
            /> 
        },
        { 
            label: 'Термины', 
            component: <RadarComponent 
                level={3} 
                id={data.storageId ? [data.storageId] : [-1]} 
                include_common_terms={0} 
                object_type='publications' 
            /> 
        },
    ];

    return (
        <Box 
            sx={{
                height: 'calc(100vh - 300px)',
                overflow: 'auto',
                paddingLeft: 2,   
                paddingRight: 2,  
                paddingBottom: 10,
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
            {data.storageId && <TabsComponent tabs={tabs} variant='fullWidth' />}
        </Box>
    );
};

export default PublOverviewTab;
