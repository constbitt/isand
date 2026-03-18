// src/hooks/useFactorsData.ts
import { useState, useEffect } from 'react';

interface TopicYearData {
  year: number;
  topics: { [topic: string]: number };
  terms: { [topic: string]: number };
}

export const useFactorsData = (authorId: string) => {
  const [data, setData] = useState<TopicYearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topTopics, setTopTopics] = useState<string[]>([]);
  const [publicationCount, setPublicationCount] = useState(0);
  const [allYears, setAllYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Получаем ID публикаций автора через прокси
        const publIdsResponse = await fetch(`/api/proxy?endpoint=authors_publs&id_author=${authorId}`);
        if (!publIdsResponse.ok) {
          throw new Error(`Ошибка загрузки публикаций: ${publIdsResponse.status}`);
        }
        const allPublicationIds = await publIdsResponse.json();
        
        if (!allPublicationIds || allPublicationIds.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }
        
        console.log('Найдено публикаций:', allPublicationIds.length);
        setPublicationCount(allPublicationIds.length);
        
        // Ограничим для теста, чтобы не перегружать
        const testIds = allPublicationIds.slice(0, 100);
        
        // 2. Получаем метаданные для публикаций
        const metadataPromises = testIds.map(async (publId: number) => {
          try {
            const response = await fetch(`/api/proxy?endpoint=publs_metadata&id_publ=${publId}`);
            if (!response.ok) return null;
            return response.json();
          } catch (err) {
            console.error(`Ошибка метаданных для ${publId}:`, err);
            return null;
          }
        });
        
        const metadataList = await Promise.all(metadataPromises);
        const validMetadata = metadataList.filter(Boolean);
        console.log('Загружено метаданных:', validMetadata.length);
        
        // 3. Получаем факторы для публикаций (level=1)
        const factorsPromises = testIds.map(async (publId: number) => {
          try {
            const response = await fetch(`/api/proxy?endpoint=get_deltas&id_publ=${publId}&factor_level=1`);
            if (!response.ok) return null;
            const data = await response.json();
            
            // Проверяем структуру данных
            if (data && typeof data === 'object') {
              const keys = Object.keys(data);
              if (keys.length > 0) {
                const sampleKey = keys[0];
                console.log(`Публикация ${publId}: ${keys.length} факторов, пример: ${sampleKey}`);
              }
            }
            
            return data;
          } catch (err) {
            console.error(`Ошибка факторов для ${publId}:`, err);
            return null;
          }
        });
        
        const factorsList = await Promise.all(factorsPromises);
        const validFactors = factorsList.filter(Boolean);
        console.log('Загружено данных факторов:', validFactors.length);
        
        // 4. Анализируем данные
        const allTopicsData: { [topic: string]: number } = {};
        const yearData: { [year: number]: { [topic: string]: number } } = {};
        const yearsSet = new Set<number>();

        for (let i = 0; i < validMetadata.length; i++) {
          const metadata = validMetadata[i];
          const factors = validFactors[i];

          if (!metadata || !factors || typeof factors !== 'object') continue;

          const year = metadata['Publication year'];
          if (!year) continue;
          
          yearsSet.add(year);

          if (!yearData[year]) {
            yearData[year] = {};
          }

          for (const [topic, count] of Object.entries(factors)) {
            if (topic === 'Общенаучные термины') continue;
            if (typeof count !== 'number') continue;

            allTopicsData[topic] = (allTopicsData[topic] || 0) + count;
            yearData[year][topic] = (yearData[year][topic] || 0) + count;
          }
        }

        console.log('Уникальных тем/факторов:', Object.keys(allTopicsData).length);
        console.log('Охваченные годы:', Array.from(yearsSet).sort());
        
        // 5. Выбираем топ-5 факторов
        const sortedTopics = Object.entries(allTopicsData)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([topic]) => topic);

        console.log('Топ-5 факторов:', sortedTopics);
        setTopTopics(sortedTopics);
        
        // 6. Подготавливаем данные для графика
        const years = Array.from(yearsSet).sort((a, b) => a - b);
        setAllYears(years);

        const transformedData = years.map(year => ({
          year,
          topics: sortedTopics.reduce((acc, topic) => {
            acc[topic] = yearData[year]?.[topic] || 0;
            return acc;
          }, {} as { [topic: string]: number }),
          terms: sortedTopics.reduce((acc, topic) => {
            acc[topic] = yearData[year]?.[topic] || 0;
            return acc;
          }, {} as { [topic: string]: number }),
        }));

        setData(transformedData);
        console.log('Подготовлено данных для графика:', transformedData.length);
        
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError(`Ошибка загрузки: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchData();
    }
  }, [authorId]);

  return { data, loading, error, topTopics, publicationCount, allYears };
};