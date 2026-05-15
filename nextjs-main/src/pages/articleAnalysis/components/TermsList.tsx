import { FC } from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface TermsListProps {
  terms: Array<{ term: string; freq: number }>;
}

export const TermsList: FC<TermsListProps> = ({ terms }) => {
  if (!terms.length) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Извлечённые термины
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {terms.map((t) => (
          <Paper
            key={t.term}
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              gap: 1,
              alignItems: 'center'
            }}
          >
            <Typography fontWeight={500}>
              {t.term}
            </Typography>
            <Typography color="text.secondary">
              {t.freq}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};