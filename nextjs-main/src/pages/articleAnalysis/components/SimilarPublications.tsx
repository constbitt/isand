import { FC, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

interface SimilarPublicationsProps {
  publications: Array<{
    title: string;
    authors: string;
    year: number;
    reason: string;
    similarity: number;
  }>;
}

export const SimilarPublications: FC<SimilarPublicationsProps> = ({ publications }) => {
  const [visiblePublications, setVisiblePublications] = useState(3);

  const handleShowMore = () => {
    setVisiblePublications(prev => prev + 3);
  };

  if (!publications.length) return null;

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h6" gutterBottom>
        Похожие публикации
      </Typography>

      {publications.slice(0, visiblePublications).map((pub) => (
        <Paper
          key={pub.title}
          variant="outlined"
          sx={{ p: 2, mb: 2 }}
        >
          <Typography fontWeight={600}>
            {pub.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {pub.authors}, {pub.year}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {pub.reason}
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">
                Similarity score
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ color: '#1B4596' }}>
                {(pub.similarity * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Box
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#E0E0E0',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${pub.similarity * 100}%`,
                  backgroundColor: '#1B4596'
                }}
              />
            </Box>
          </Box>
        </Paper>
      ))}

      {visiblePublications < publications.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleShowMore}
            sx={{
              borderColor: '#1B4596',
              color: '#1B4596',
              textTransform: 'none',
              fontSize: '16px',
              '&:hover': {
                borderColor: '#1B4596',
                backgroundColor: 'rgba(27,69,150,0.05)',
              }
            }}
          >
            Показать еще
          </Button>
        </Box>
      )}
    </Box>
  );
};