import { useRouter, NextRouter } from 'next/router';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import StyledAvatar from '../Avatar/StyledAvatar';

interface Creature {
    id: number;
    name: string;
    add_info?: string[];
    affiliation?: string;
    terms?: { term: string; count: number }[];
}

interface UniversalCardProps {
    creature: Creature;
    type: string;
    searchType: 'search/sResult' | 'deepSearch/dResult';
    disabled?: boolean;
}

const UniversalCard: React.FC<UniversalCardProps> = ({ creature, type, searchType, disabled = false }) => {
    const router: NextRouter = useRouter();

    const handleHref = (option: string) => {
        const fields: Record<string, string> = {
            'publications': `/${searchType}/publication`,
            'journals': `/${searchType}/journal`,
            'geopositions': `/${searchType}`,
            'authors': `/${searchType}/author`,
            'conferences': `/${searchType}/conference`,
            'organizations': `/${searchType}`,
        };
        return fields[option] || `/${searchType}`;
    };

    const cardContent = (
        <Card sx={{ m: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'stretch' }}>
                <Stack direction="row" alignItems="center" sx={{ width: '100%' }} spacing={2}>
                    {type !== 'publications' && <StyledAvatar fio={creature.name} url='' height={120} width={120} />}
                    <Stack spacing={1}>
                        <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{creature.name}</Typography>
                        {creature.add_info && <Typography sx={{ alignSelf: 'flex-start' }} color='primary' variant='h5'>{creature.add_info.join(', ')}</Typography>}
                        {creature.affiliation && <Typography>{creature.affiliation}</Typography>}
                        {creature.terms && (
                            <Stack>
                                <span className='text-xl mt-2 text-blue-main'>Количество терминов</span>
                                {creature.terms.map((item, index) => (
                                    <span key={index}>{item.term}: {item.count}</span>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );

    return disabled ? (
        <div style={{ cursor: 'not-allowed' }}>
            {cardContent}
        </div>
    ) : (
        <Link href={{
            pathname: handleHref(type),
            query: {
                ...router.query,
                creature_id: creature.id,
            },
        }}>
            {cardContent}
        </Link>
    );
};

export default UniversalCard;