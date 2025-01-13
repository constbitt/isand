import { FC } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import StyledAvatar from '@/src/components/Avatar/StyledAvatar';

interface JournalCardProps {
  post: {
    id: string | number;
    name: string;
    avatar?: string;
  };
}

export const JournalCard: FC<JournalCardProps> = ({ post }) => {
  return (
    <Card 
      sx={{ 
        m: '5px', 
        boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.15)', 
        cursor: 'pointer',
        width: '100%',
        height: '100px'
      }}
    >
      <CardContent 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px'
          }
        }}
      >
        <StyledAvatar
          fio={post.name || "Без названия"}
          width={50}
          height={50}
          url={post.avatar || ""}
        />
        <Stack 
          spacing={1} 
          sx={{ 
            width: '100%',
            alignItems: 'stretch',
            marginLeft: 2
          }}
        >
          <Typography 
            variant='h5' 
            sx={{
              textAlign: 'left',
              width: '100%',
              color: '#1B4596',
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            {post.name}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}; 