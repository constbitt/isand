import { FC } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { useGetPublInfoQuery } from '@/src/store/api/serverApiV2_5';

interface PublicationCardProps {
  post: {
    id: string | number;
    name: string;
  };
}

const formatAuthorName = (authorString: string) => {
  return authorString.split(';').map(author => {
    const words = author.trim().split(' ');
    const surname = words[0];
    const initials = words.slice(1)
      .map(word => `${word[0]}.`)
      .join(' ');
    
    return `${surname} ${initials}`;
  }).join(', ');
};

export const PublicationCard: FC<PublicationCardProps> = ({ post }) => {
  const { data: publicationInfo } = useGetPublInfoQuery(post.id.toString(), {
    skip: !post.id
  });

  return (
    <Card 
      sx={{ 
        m: '5px', 
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', 
        cursor: 'pointer',
        width: '100%'
      }}
    >
      <CardContent 
        sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px'
          }
        }}
      >
        <Stack 
          spacing={1} 
          sx={{ 
            width: '100%',
            alignItems: 'stretch'
          }}
        >
          <Typography 
            variant='h5' 
            sx={{
              textAlign: 'left',
              width: '100%'
            }}
          >
            {post.name}
          </Typography>
          {publicationInfo && publicationInfo[0] && (
            <>
              <Typography 
                variant='body1' 
                sx={{ 
                  color: '#1B4596',
                  fontFamily: 'Nunito Sans, sans-serif',
                  textAlign: 'left',
                  width: '100%',
                  fontWeight: 700
                }}
              >
                Авторы: {formatAuthorName(publicationInfo[0].author_fios)}
              </Typography>
              <Typography 
                variant='body2' 
                sx={{
                  color: 'text.secondary',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                Год: {publicationInfo[0].year}
              </Typography>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}; 