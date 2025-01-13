import { Accordion, AccordionDetails, AccordionSummary, Box, Modal, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import { useRouter } from "next/router";
import { FC, ReactElement } from "react";
import {
    DeepSearchDiscrip,
    GlossaryDiscrip,
    GraphsDiscrip,
    HomeDiscrip,
    ProfilesDiscrip,
    RatingsDiscrip,
    ThesaurusDiscrip,
    HomeTech,
    DeepSearchTech,
    GlossaryTech,
    GraphsTech,
    ProfilesTech,
    ThesaurusTech,
    RatingsTech,
} from "../Helper/HelperComponents";

interface HelperModalProps {
    open: boolean
    handleClose: () => void
}

interface Helper {
    Discrip: FC
    Tech: FC
}

const HelperModal: FC<HelperModalProps> = ({ open, handleClose }): ReactElement => {
    const router = useRouter();
    const { pathname } = router;

    const getInstructionComponent = (path: string): Helper => {
        const instructionComponents: Record<string, Helper> = {
            'deepSearch': { Discrip: DeepSearchDiscrip, Tech: DeepSearchTech },
            'dResult': { Discrip: DeepSearchDiscrip, Tech: DeepSearchTech },
            'profiles': { Discrip: ProfilesDiscrip, Tech: ProfilesTech },
            'ratings': { Discrip: RatingsDiscrip, Tech: RatingsTech },
            'graphs': { Discrip: GraphsDiscrip, Tech: GraphsTech },
            'thesaurus': { Discrip: ThesaurusDiscrip, Tech: ThesaurusTech },
            'glossary': { Discrip: GlossaryDiscrip, Tech: GlossaryTech },
        };
        const pathKey = path.split('/').pop() || '';
        return instructionComponents[pathKey] || { Discrip: HomeDiscrip, Tech: HomeTech };
    };

    const { Discrip, Tech }: Helper = getInstructionComponent(pathname);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                maxHeight: '100vh',
                margin: '10px 0px',
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0, 21, 64, 0.75)',
                    },
                },
            }}
        >
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    py: 3,
                    px: 4,
                    borderRadius: 2,
                    width: '50%',
                }}
            >
                <Stack sx={{ overflow: 'auto', maxHeight: '100%', p: 2, gap: 2 }}>
                    <Box sx={{ pr: '17px' }}>
                        <Typography variant="h4" color={'primary'}>Руководство пользователя</Typography>
                    </Box>
                    <Accordion disableGutters sx={{ border: 'none', boxShadow: 'none', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <InfoIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" color={'primary'} fontWeight="bold">
                                Описание возможностей
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Discrip />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion disableGutters sx={{ border: 'none', boxShadow: 'none', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <BuildIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" color={'primary'} fontWeight="bold">
                                Техническая информация
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Tech />
                        </AccordionDetails>
                    </Accordion>
                </Stack>
            </Box>
        </Modal>
    )
}

export default HelperModal;
