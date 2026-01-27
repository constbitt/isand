// @ts-nocheck
import { FC } from 'react';
import { Card, CardContent, Stack, Typography, CircularProgress } from '@mui/material';
import { useGetPublInfoQuery } from '@/src/store/api/serverApiV2_5';

export const formatAuthorName = (authorString: string | undefined): string => {
    if (!authorString) return '';
    
    try {
        const authors = authorString.split(';').map(author => {
            const trimmedAuthor = author.trim();
            if (!trimmedAuthor) return '';
            
            const parts = trimmedAuthor.split(' ');
            if (parts.length < 2) return trimmedAuthor;
            
            const lastName = parts[0];
            const initials = parts.slice(1)
                .map(part => `${part.charAt(0)}.`)
                .join('');
            
            return `${lastName} ${initials}`;
        });
        
        return authors.filter(author => author).join(', ');
    } catch (error) {
        console.error('Error formatting author name:', error);
        return authorString || '';
    }
};

interface PublicationCardProps {
  post: {
    id: string | number;
    name: string;
  };
}

export const PublicationCard: FC<PublicationCardProps> = ({ post }) => {
  if (!post.id) {
    return <Typography>Ошибка: ID публикации не найден.</Typography>;
  }
// eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: publicationInfo, isLoading, error } = useGetPublInfoQuery(post.id.toString(), {
    skip: !post.id
  });

  if (isLoading) {
    return (
      <Card sx={{ m: '5px', p: 2 }}>
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ m: '5px', p: 2 }}>
        <Typography color="error">Ошибка при загрузке данных публикации</Typography>
      </Card>
    );
  }

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