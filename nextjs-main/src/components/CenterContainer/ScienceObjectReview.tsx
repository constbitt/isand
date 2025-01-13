import React, { useEffect, useState } from 'react'
import { Author } from "@/src/store/types/searchApiType"
import RadarComponent from "../Chart/RadarChart/Radarchart"
import TabsComponent from '@/src/components/Tabs/TabsComponent';
import {Typography, Stack} from "@mui/material"

type ScienceObjectReviewProps = Omit<Author, 'avatar' |'fio' | 'affiliation'> & { idAuthor: number, objectType: string }


const ScienceObjectReview: React.FC<ScienceObjectReviewProps> = ({description, geoposition, publications, citations, ids, idAuthor, objectType}): React.ReactElement => {

    const tabs: {label: string, component: React.ReactNode}[] = [
        // { label: 'Метафакторы', component: <RadarComponent level={0} id={[idAuthor]} include_common_terms={1} object_type={'authors'} /> },
        { label: 'Факторы', component: <RadarComponent level={1} id={[idAuthor]} include_common_terms={1} object_type={objectType} /> },
        { label: 'Подфакторы', component: <RadarComponent level={2} id={[idAuthor]} include_common_terms={1} object_type={objectType} /> },
        { label: 'Термины', component: <RadarComponent level={3} id={[idAuthor]} include_common_terms={1} object_type={objectType} /> },
    ]

    return (
        <Stack sx={{mt: '20px', width: '100%'}}>
            <Typography variant="h6" sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                    {description}
            </Typography>
            <Typography color={'primary'} variant="h6" sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                    {geoposition}
            </Typography>
            <Stack direction={'row'} sx={{mt: '40px', justifyContent: 'space-between', width: '100%'}}>
                <Stack>
                    <Typography variant="h6" sx={{ wordBreak: 'break-word', alignSelf: 'flex-start', mt: '4px'}}>
                            <span className='font-bold'>Публикаций: </span>{publications}
                    </Typography>
                    {/* <Typography variant="h6" sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                            <span className='font-bold'>Цитирований: </span>{citations}
                    </Typography> */}
                    <Stack sx={{mt: '10px'}}>
                        {ids.map((item, index) => <Typography key={index} variant="h6" sx={{ wordBreak: 'break-word', alignSelf: 'flex-start'}}>
                            <span className="font-semibold">{`${item.name}: `}</span>{item.id}
                        </Typography>)}
                    </Stack>
                </Stack>
                <Stack sx={{width: '70%'}}>
                    <TabsComponent tabs={tabs} />
                </Stack>
            </Stack>
        </Stack>
    )
}

export default ScienceObjectReview;