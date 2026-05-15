import { FC } from 'react';
import { Box, Typography } from '@mui/material';

interface CategoriesChartProps {
  categories: Array<{ name: string; value: number }>;
}

export const CategoriesChart: FC<CategoriesChartProps> = ({ categories }) => {
  if (!categories.length) return null;

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Распределение терминов по категориям
      </Typography>

      {categories.map((c) => (
        <Box key={c.name} sx={{ mb: 2 }}>
          <Typography>
            {c.name} — {c.value}%
          </Typography>
          <Box
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: '#E0E0E0',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${c.value}%`,
                backgroundColor: '#1B4596'
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};