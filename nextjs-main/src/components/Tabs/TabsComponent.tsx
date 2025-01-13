import React, { useEffect, useState, FC } from 'react';
import { Tabs, Tab, Box } from '@mui/material';


const TabPanel: React.FC<{ value: number; index: number; children: React.ReactNode }> = ({ value, index, children }) => {
    return (
        <div role="tabpanel" hidden={value !== index} style={{ height: '100%' }}>
            {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
        </div>
    );
};

type TabType = {
    label: string;
    component: React.ReactNode;
};

type TabsComponentProps = {
    tabs: TabType[];
    variant?: 'standard' | 'fullWidth' | 'scrollable'
    hatWidth?: string
    fontSize?: number
    propsValue?: number
    onChange?: (index: number) => void
};

const TabsComponent: FC<TabsComponentProps> = ({ tabs, variant='fullWidth', hatWidth='100%', fontSize, propsValue, onChange }) => {
    const [value, setValue] = useState<number>(0);

    useEffect(() => {
        if (propsValue) setValue(propsValue)
    }, [propsValue])

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Tabs 
                value={value} 
                onChange={(_: React.SyntheticEvent, value: number) => {
                    setValue(value)
                    if (onChange) onChange(value)
                }} 
                aria-label="basic tabs example" 
                sx={{ 
                    fontSize: fontSize,
                    '.MuiTabs-flexContainer': { width: hatWidth, justifyContent: 'space-between', }, 
                    '.MuiTabs-indicator': { display: 'none' },
                    '.Mui-selected': { fontWeight: 'bold' }, 
                    '.MuiTab-root': { fontSize: fontSize ? `${fontSize}px` : 'inherit', textTransform: 'none' },
                }} 
                variant={variant}
            >
                {tabs.map((tab, index) => (
                    <Tab key={index} label={tab.label} />
                ))}
            </Tabs>
            {tabs.map((tab, index) => (
                <TabPanel key={index} value={value} index={index}>
                    {tab.component}
                </TabPanel>
            ))}
        </Box>
    );
};

export default TabsComponent;