import { FC, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import AuthorCard from '@/src/components/Cards/AuthorCard';
import AuthorModal from '@/src/components/Modals/AuthorModal'; 


interface AuthorsListProps {
  authors: Array<{ a_fio: string }>;
}

const AUTHOR_IDS = [260, 40, 5, 847, 14];

export const AuthorsList: FC<AuthorsListProps> = ({ authors }) => {
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAuthorClick = (index: number) => {
    const authorId = AUTHOR_IDS[index] || AUTHOR_IDS[AUTHOR_IDS.length - 1];
    setSelectedAuthorId(authorId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAuthorId(null);
  };

  if (!authors.length) return null;

  return (
    <>
      <Stack sx={{ width: '50%', minWidth: '200px' }} spacing={2}>
        <Typography variant='h5'>Авторы ({authors.length})</Typography>
        <Stack 
          sx={{ 
            maxHeight: '400px', 
            overflowY: 'auto', 
            overflowX: 'hidden',
            pr: 1 
          }} 
          spacing={1} 
          py={0.5}
        >
          {authors.map((author: { a_fio: string }, index: number) => {
            return (
              <div 
                key={index}
                onClick={() => handleAuthorClick(index)}
                style={{ cursor: 'pointer' }}
              >
                <AuthorCard author={author} />
              </div>
            );
          })}
        </Stack>
      </Stack>

      <AuthorModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        id={selectedAuthorId || AUTHOR_IDS[0]} 
      />
    </>
  );
};