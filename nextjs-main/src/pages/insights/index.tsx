import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Box, Stack, Typography } from '@mui/material';

type EntityType = 'authors' | 'journals' | 'conferences' | 'organizations' | 'cities';

const entityLabels: Record<EntityType, string> = {
  authors: 'Учёные',
  journals: 'Журналы',
  conferences: 'Конференции',
  organizations: 'Организации',
  cities: 'Города',
};

const InsightsSelectPage: React.FC = (): React.ReactElement => {
  const router = useRouter();
  const handleEntityClick = (entityType: EntityType) => {
    router.push(`/insights/select?entity=${entityType}`);
  };

  return (
    <>
      <Head>
        <title>Эволюция и прогноз интересов</title>
      </Head>
      <main className="flex flex-col items-center">
        <Stack spacing={3} sx={{ width: '67.5vw', mt: '32px', position: 'relative' }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={4}
            sx={{
              alignItems: { xs: 'stretch', lg: 'flex-start' },
              justifyContent: { lg: 'space-between' },
              position: 'relative',
            }}
          >
            <Stack spacing={3} sx={{ flex: { lg: '0 0 520px' }, width: { xs: '100%', lg: 520 }, minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontSize: '24px',
                  color: '#1b4596',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Выберите тип сущности
              </Typography>

              <Stack spacing={2}>
                {(['authors', 'journals', 'conferences', 'organizations', 'cities'] as EntityType[]).map((entityType) => (
                  <button
                    key={entityType}
                    onClick={() => handleEntityClick(entityType)}
                    style={{
                      width: '100%',
                      height: '56px',
                      borderRadius: '12px',
                      fontWeight: 500,
                      fontSize: '16px',
                      textTransform: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: '#1b4596',
                      color: '#FFFFFF',
                      opacity: 1,
                      pointerEvents: 'all',
                      outline: 'none',
                      boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#153d7a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1b4596';
                    }}
                  >
                    {entityLabels[entityType]}
                  </button>
                ))}
              </Stack>
            </Stack>

            <Box
              sx={{
                display: { xs: 'none', lg: 'block' },
                width: 440,
                height: 760,
                position: 'absolute',
                top: -90,
                right: -220,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <Image
                src="/images/presentation/1.jpg"
                alt="crystals"
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'left center',
                  opacity: 0.3,
                  transform: 'scale(1.1)',
                }}
                priority
              />
            </Box>
          </Stack>
        </Stack>
      </main>
    </>
  );
};

export default InsightsSelectPage;