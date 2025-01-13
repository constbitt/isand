// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePostDeepSearchSearchMutation } from '@/src/store/api/serverApiV3';
import { DeepSearchRequest, Hits, Phrases } from '@/src/store/types/deepSearchTypes';
import { Card, CardContent, Stack, Typography, Button } from '@mui/material';
import Link from 'next/link';
import StyledAvatar from '@/src/components/Avatar/StyledAvatar';

const AuthorsResultPage = () => {
  const [creatures, setCreatures] = useState<Hits[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [postDeepSearchSearch, { isLoading, error, data }] = usePostDeepSearchSearchMutation();

  const router = useRouter();
  const name = 'authors';

  const deepSearchRequest: DeepSearchRequest = {
    phrases: [
      { name: 'Предметная область', id: 211, cut_off: [0, 1] },
      { name: 'Общенаучная проблематика', id: 1, cut_off: [0, 1] },
      { name: 'Математический аппарат', id: 2223, cut_off: [0, 1] },
      { name: 'Сфера применения', id: 1540, cut_off: [0, 1] },
    ],
    sort_by: 'desc',
    sort_type: 'relevance',
    time_range: [1997, 2024],
    offset: 0,
  };

  const getSessionStorageKey = (request: Omit<DeepSearchRequest, 'offset' | 'search_field'>, name: string) => {
    return `d_${name}_${JSON.stringify(request)}`;
  };

  const loadMoreData = async (deepSearchRequest: Omit<DeepSearchRequest, 'offset' | 'search_field'>, name: string) => {
    const sessionKey = getSessionStorageKey(deepSearchRequest, name);
    try {
      const result = await postDeepSearchSearch({
        ...deepSearchRequest,
        search_field: name,
        offset: creatures.length,
        phrases: deepSearchRequest.phrases as Phrases[],
      }).unwrap();

      setCreatures((prevCreatures) => {
        const newCreatures = [...prevCreatures, ...result.hits];
        if (totalHits < 0) setTotalHits(result.total_hits);
        if (newCreatures.length >= result.total_hits) {
          setHasMore(false);
        }
        setOffset(offset + result.hits.length);
        sessionStorage.setItem(sessionKey, JSON.stringify({
          results: newCreatures,
          totalHits: result.total_hits,
          offset: offset + result.hits.length,
        }));
        return newCreatures;
      });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  useEffect(() => {
    const sessionKey = getSessionStorageKey(deepSearchRequest, name);
    const cachedData = sessionStorage.getItem(sessionKey);
  
    if (cachedData) {
      const { results, totalHits, offset } = JSON.parse(cachedData);
      setCreatures(results);
      setTotalHits(totalHits);
      setOffset(offset);
      setHasMore(results.length < totalHits);
    } else {
      loadMoreData(deepSearchRequest, name);
    }
  }, []); // Use an empty dependency array to ensure this only runs once after the initial render
  

  const handleHref = (creatureId: number) => {
    return `/authors/author?creature_id=${creatureId}`;
  };

  if (isLoading) {
    return <p></p>;
  }

  if (error) {
    return <p>Произошла ошибка: {error}</p>;
  }

  return (
    <div>
      {creatures.length > 0 ? (
        <div>
          {creatures.map((creature, index) => (
            <Link key={index} href={handleHref(creature.id)}>
            <Card key={index} sx={{ m: '25px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'stretch' }}>
                <Stack direction="row" alignItems="center" sx={{ width: '100%' }} spacing={2}>
                  <StyledAvatar fio={creature.name} url='' height={120} width={120} />
                  <Stack spacing={1}>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{creature.name}</Typography>
                    {creature.add_info && (
                      <Typography sx={{ alignSelf: 'flex-start' }} color='primary' variant='h5'>
                        {creature.add_info.join(', ')}
                      </Typography>
                    )}
                    {creature.affiliation && <Typography>{creature.affiliation}</Typography>}
                    {creature.terms && (
                      <Stack>
                        <span className='text-xl mt-2 text-blue-main'>Количество терминов</span>
                        {creature.terms.map((item, idx) => (
                          <span key={idx}>{item.term}: {item.count}</span>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p>Нет результатов</p>
      )}
    </div>
  );
};

export default AuthorsResultPage;
