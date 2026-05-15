import { FC } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { TermsList } from './TermsList';
import { CategoriesChart } from './CategoriesChart';
import { SimilarPublications } from './SimilarPublications';
import { AuthorsList } from './AuthorsList';
import TabsComponent from '@/src/components/Tabs/TabsComponent';
import RadarComponent from '@/src/components/Chart/RadarChart/Radarchart';
import { generateMockReport } from '../utils/reportGenerator';

interface AnalysisResultProps {
  publicationInfo: any;
  authors: any[];
  terms: any[];
  categories: any[];
  similarPublications: any[];
  selectedFile: File | null;
  pdfUrl: string | null;
  onClearFile: () => void;
}

export const AnalysisResult: FC<AnalysisResultProps> = ({
  publicationInfo,
  authors,
  terms,
  categories,
  similarPublications,
  selectedFile,
  pdfUrl,
  onClearFile,
}) => {
  const handleDownloadReport = () => {
    if (selectedFile) {
      const link = document.createElement('a');
      link.href = pdfUrl || URL.createObjectURL(selectedFile);
      link.download = `report_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const reportContent = generateMockReport(terms, categories, similarPublications);
      const blob = new Blob([reportContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'analysis_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const tabs: { label: string, component: React.ReactNode }[] = [
    { label: 'Факторы', component: <RadarComponent level={1} id={[22390]} include_common_terms={0} object_type='publications' /> },
    { label: 'Подфакторы', component: <RadarComponent level={2} id={[22390]} include_common_terms={0} object_type='publications' /> },
    { label: 'Термины', component: <RadarComponent level={3} id={[22390]} include_common_terms={0} object_type='publications' /> },
  ];

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Результаты анализа
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Название публикации
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {publicationInfo?.title}
            </Typography>
          </Box>

          <AuthorsList authors={authors} />
        </Box>
      </Box>

      <TermsList terms={terms} />
      <CategoriesChart categories={categories} />
      
      <Box sx={{ mt: 5 }}>
        <TabsComponent tabs={tabs} variant='standard' />
      </Box>

      <SimilarPublications publications={similarPublications} />
      
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onClearFile}>
          Загрузить другой файл
        </Button>
        <Button
                  variant="contained"
                  component="label"
                  sx={{
                    backgroundColor: '#1B4596',
                    '&:hover': { backgroundColor: '#1B4596', opacity: 0.9 },
                    textTransform: 'none',
                    fontSize: '16px'
                  }}
                  onClick={handleDownloadReport}
                >
                  Загрузить отчет
        </Button>
      </Box>
    </>
  );
};