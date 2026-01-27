import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ApiResponse } from '@/src/store/types/apiTypes';
import { Author } from '@/src/store/types/authorTypes';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// ========== TYPES ==========
interface PublicationMetadata {
  id: number;
  Title: string;
  Abstract: string;
  'Publication year': number;
}

interface TopicYearData {
  year: number;
  topics: {
    [topic: string]: number;
  };
  terms: {
    [topic: string]: number;
  };
  publicationCounts?: {
    [topic: string]: number;
  };
  totalPublications?: number;
}

type EntityType = 'authors' | 'journals' | 'conferences' | 'organizations' | 'cities';
type AnalysisMode = 'factors_terms' | 'subfactors_terms' | 'factors_publs' | 'subfactors_publs' | 'unique_terms_publs' | 'terms_occurrences';

// ========== КЕШИРОВАНИЕ ==========
const createCache = () => {
  const cache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

  return {
    get: (key: string) => {
      const cached = cache.get(key);
      if (!cached) return null;
      
      const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
      if (isExpired) {
        cache.delete(key);
        return null;
      }
      
      return cached.data;
    },
    
    set: (key: string, data: any) => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    
    clear: () => {
      cache.clear();
    }
  };
};

const apiCache = createCache();

// ========== HOOK ДЛЯ ДВУХ СУЩНОСТЕЙ ==========
const useTwoEntitiesData = (
  entityType: EntityType, 
  entityId1: string, 
  entityId2: string, 
  limit: number = 5,
  analysisMode: AnalysisMode = 'factors_terms'
) => {
  const [data1, setData1] = useState<TopicYearData[]>([]);
  const [data2, setData2] = useState<TopicYearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topTopics, setTopTopics] = useState<string[]>([]);
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [publicationCount1, setPublicationCount1] = useState(0);
  const [publicationCount2, setPublicationCount2] = useState(0);

  // Хардкодированный список факторов
  const FACTORS_LIST = [
    'Авиация',
    'Автоматизация проектирования',
    'АИУС – Автоматизированные информационно-управляющие системы',
    'Алгебра и теория чисел',
    'Военное дело',
    'Вычислительная техника, программирование',
    'Вычислительные и коммуникационные системы и сети',
    'Геоинформационные системы',
    'Геометрия и топология',
    'Дифференциальные и интегральные уравнения',
    'Информатика и теория информации',
    'Информационная безопасность и кибербезопасность',
    'Искусственный интеллект и интеллектуальное управление',
    'Исследование операций',
    'Кибернетика и системный анализ',
    'Комбинаторика',
    'Космос',
    'Математическая логика',
    'Математический и комплексный анализ',
    'Мехатроника',
    'Морские подвижные объекты',
    'Навигация и управление движением',
    'Обработка фото- и видеоданных',
    'Образование',
    'Общенаучные термины',
    'Общественное и индивидуальное здоровье, контроль заболевания, медицинские вмешательства',
    'Передача и обработка сигналов',
    'Прикладная лингвистика',
    'Робототехника',
    'Сельское хозяйство и агропромышленный комплекс (АПК)',
    'Сетевые мультиагентные системы',
    'Социально-экономические системы',
    'Социальные системы',
    'Теория автоматического управления',
    'Теория алгоритмов и формальных систем',
    'Теория вероятностей и математическая статистика',
    'Теория выбора и принятия решений',
    'Теория графов',
    'Теория игр',
    'Теория множеств и отношений',
    'Теория оптимизации',
    'Теория управления в организационных системах',
    'Теория техническая диагностика, надежность и безопасность',
    'Теория технические средства управления',
    'Теория технологические процессы',
    'Транспорт',
    'Управление в медико-биологических системах',
    'Управление в экологических системах',
    'Физика',
    'Финансы',
    'Функциональный анализ',
    'Энергетика'
  ];

  const fetchViaProxy = async (endpoint: string, params: Record<string, string> = {}) => {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log(`Используем кеш для ${endpoint}`);
      return cached;
    }

    const searchParams = new URLSearchParams({ endpoint, ...params }).toString();
    const url = `/api/proxy?${searchParams}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    apiCache.set(cacheKey, data);
    return data;
  };

  const getPublicationIds = async (entityType: EntityType, entityId: string): Promise<number[]> => {
    const endpointMap = {
      authors: { endpoint: 'authors_publs', param: 'id_author' },
      journals: { endpoint: 'journals_publs', param: 'id_journal' },
      conferences: { endpoint: 'conferences_publs', param: 'id_conference' },
      organizations: { endpoint: 'organizations_publs', param: 'id_organization' },
      cities: { endpoint: 'cities_publs', param: 'id_city' },
    };

    const config = endpointMap[entityType];
    if (!config) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    return await fetchViaProxy(config.endpoint, { [config.param]: entityId });
  };

  // Параллельная загрузка метаданных
  const fetchMetadataBatch = async (publicationIds: number[], setProgress: (value: number) => void) => {
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < publicationIds.length; i += batchSize) {
      const batch = publicationIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    const allMetadata = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchPromises = batch.map(async (publId) => {
        try {
          return await fetchViaProxy('publs_metadata', { id_publ: publId.toString() });
        } catch (err) {
          console.error(`Ошибка метаданных ${publId}:`, err);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      allMetadata.push(...batchResults.filter(Boolean));
      
      setProgress(Math.round(((i + 1) / batches.length) * 50));
    }
    
    return allMetadata;
  };

  // Параллельная загрузка данных (факторов/терминов)
  const fetchDataBatch = async (publicationIds: number[], level: '1' | '2' | '3', setProgress: (value: number) => void, startProgress: number = 50) => {
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < publicationIds.length; i += batchSize) {
      const batch = publicationIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    const allData = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchPromises = batch.map(async (publId) => {
        try {
          return await fetchViaProxy('get_deltas', {
            id_publ: publId.toString(),
            factor_level: level
          });
        } catch (err) {
          console.error(`Ошибка данных ${publId}:`, err);
          return {};
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      allData.push(...batchResults);
      
      setProgress(startProgress + Math.round(((i + 1) / batches.length) * 50));
    }
    
    return allData;
  };

  // ========== АЛГОРИТМЫ АНАЛИЗА ==========
  
  // 1. Факторы (вхождения)
  const analyzeFactorsByTerms = (
    metadataList: any[],
    topicsList: any[],
    allPublicationIds: number[]
  ) => {
    const allTopicsData: { [topic: string]: number } = {};
    const yearData: { [year: number]: { [topic: string]: number } } = {};
    const yearPublicationCount: { [year: number]: number } = {};

    for (let i = 0; i < allPublicationIds.length; i++) {
      const metadata = metadataList[i];
      const topics = topicsList[i];

      if (!metadata || !topics) continue;

      const year = metadata['Publication year'];
      yearPublicationCount[year] = (yearPublicationCount[year] || 0) + 1;

      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [topic, count] of Object.entries(topics)) {
        if (topic === 'Общенаучные термины') continue;

        const topicCount = count as number;
        allTopicsData[topic] = (allTopicsData[topic] || 0) + topicCount;
        yearData[year][topic] = (yearData[year][topic] || 0) + topicCount;
      }
    }

    return { allTopicsData, yearData, yearPublicationCount };
  };

  // 2. Подфакторы (вхождения)
  const analyzeSubfactorsByTerms = (
    metadataList: any[],
    topicsList: any[],
    allPublicationIds: number[]
  ) => {
    const allTopicsData: { [topic: string]: number } = {};
    const yearData: { [year: number]: { [topic: string]: number } } = {};
    const yearPublicationCount: { [year: number]: number } = {};

    for (let i = 0; i < allPublicationIds.length; i++) {
      const metadata = metadataList[i];
      const topics = topicsList[i];

      if (!metadata || !topics) continue;

      const year = metadata['Publication year'];
      yearPublicationCount[year] = (yearPublicationCount[year] || 0) + 1;

      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [topic, count] of Object.entries(topics)) {
        if (topic === 'Общенаучные термины') continue;
        if (FACTORS_LIST.includes(topic)) continue; // Исключаем факторы для подфакторов

        const topicCount = count as number;
        allTopicsData[topic] = (allTopicsData[topic] || 0) + topicCount;
        yearData[year][topic] = (yearData[year][topic] || 0) + topicCount;
      }
    }

    return { allTopicsData, yearData, yearPublicationCount };
  };

  // 3. Факторы (публикации)
  const analyzeFactorsByPublications = (
    metadataList: any[],
    topicsList: any[],
    allPublicationIds: number[]
  ) => {
    const topicPublications: { [topic: string]: number } = {};
    const yearTopicPublications: { [year: number]: { [topic: string]: number } } = {};
    const yearTotalPublications: { [year: number]: number } = {};

    for (let i = 0; i < allPublicationIds.length; i++) {
      const metadata = metadataList[i];
      const topics = topicsList[i];

      if (!metadata || !topics) continue;

      const year = metadata['Publication year'];
      yearTotalPublications[year] = (yearTotalPublications[year] || 0) + 1;

      if (!yearTopicPublications[year]) {
        yearTopicPublications[year] = {};
      }

      // Исключаем "Общенаучные термины"
      const filteredTopics = Object.entries(topics)
        .filter(([topic, count]) => topic !== 'Общенаучные термины');

      if (filteredTopics.length === 0) continue;

      // Находим максимальное значение в публикации
      const maxCount = Math.max(...filteredTopics.map(([, count]) => count as number));
      
      // Берем все темы с максимальным значением
      const topTopicsForPublication = filteredTopics
        .filter(([, count]) => count === maxCount)
        .map(([topic]) => topic);

      // Учитываем каждую топ-тему публикации
      topTopicsForPublication.forEach(topic => {
        topicPublications[topic] = (topicPublications[topic] || 0) + 1;
        yearTopicPublications[year][topic] = (yearTopicPublications[year][topic] || 0) + 1;
      });
    }

    return { 
      topicPublications, 
      yearTopicPublications, 
      yearTotalPublications
    };
  };

  // 4. Подфакторы (публикации)
  const analyzeSubfactorsByPublications = (
    metadataList: any[],
    topicsList: any[],
    allPublicationIds: number[]
  ) => {
    const topicPublications: { [topic: string]: number } = {};
    const yearTopicPublications: { [year: number]: { [topic: string]: number } } = {};
    const yearTotalPublications: { [year: number]: number } = {};

    for (let i = 0; i < allPublicationIds.length; i++) {
      const metadata = metadataList[i];
      const topics = topicsList[i];

      if (!metadata || !topics) continue;

      const year = metadata['Publication year'];
      yearTotalPublications[year] = (yearTotalPublications[year] || 0) + 1;

      if (!yearTopicPublications[year]) {
        yearTopicPublications[year] = {};
      }

      // Исключаем "Общенаучные термины" и факторы
      const filteredTopics = Object.entries(topics)
        .filter(([topic, count]) => {
          if (topic === 'Общенаучные термины') return false;
          if (FACTORS_LIST.includes(topic)) return false;
          return true;
        });

      if (filteredTopics.length === 0) continue;

      // Находим максимальное значение в публикации
      const maxCount = Math.max(...filteredTopics.map(([, count]) => count as number));
      
      // Берем все темы с максимальным значением
      const topTopicsForPublication = filteredTopics
        .filter(([, count]) => count === maxCount)
        .map(([topic]) => topic);

      // Учитываем каждую топ-тему публикации
      topTopicsForPublication.forEach(topic => {
        topicPublications[topic] = (topicPublications[topic] || 0) + 1;
        yearTopicPublications[year][topic] = (yearTopicPublications[year][topic] || 0) + 1;
      });
    }

    return { 
      topicPublications, 
      yearTopicPublications, 
      yearTotalPublications
    };
  };

  // 5. Уникальные термины на публикацию (1 раз на публикацию)
  const analyzeUniqueTermsPerPublication = (
    metadataList: any[],
    termsList: any[],
    allPublicationIds: number[]
  ) => {
    const allTopicsData: { [topic: string]: number } = {};
    const yearData: { [year: number]: { [topic: string]: number } } = {};

    for (let i = 0; i < allPublicationIds.length; i++) {
      const metadata = metadataList[i];
      const terms = termsList[i]; // Термины с level=3

      if (!metadata || !terms) continue;

      const year = metadata['Publication year'];

      if (!yearData[year]) {
        yearData[year] = {};
      }

      // Считаем каждый термин как уникальный для этой публикации (1 раз на публикацию)
      Object.keys(terms).forEach(term => {
        if (term === 'Общенаучные термины') return;
        
        // Только 1 за публикацию, независимо от количества вхождений
        allTopicsData[term] = (allTopicsData[term] || 0) + 1;
        yearData[year][term] = (yearData[year][term] || 0) + 1;
      });
    }
    return { allTopicsData, yearData };
  };

  // 6. Общее количество вхождений терминов (сумма всех вхождений)
  const analyzeTermsOccurrences = (
    metadataList: any[],
    termsList: any[],
    allPublicationIds: number[]
  ) => {
    const allTopicsData: { [topic: string]: number } = {};
    const yearData: { [year: number]: { [topic: string]: number } } = {};
    const yearPublicationCount: { [year: number]: number } = {};

    for (let i = 0; i < allPublicationIds.length; i++) {
      const metadata = metadataList[i];
      const terms = termsList[i]; // Термины с level=3

      if (!metadata || !terms) continue;

      const year = metadata['Publication year'];
      yearPublicationCount[year] = (yearPublicationCount[year] || 0) + 1;

      if (!yearData[year]) {
        yearData[year] = {};
      }

      // Считаем сумму всех вхождений каждого термина
      for (const [term, count] of Object.entries(terms)) {
        if (term === 'Общенаучные термины') continue;
        
        const termCount = count as number;
        allTopicsData[term] = (allTopicsData[term] || 0) + termCount;
        yearData[year][term] = (yearData[year][term] || 0) + termCount;
      }
    }
    
    return { allTopicsData, yearData, yearPublicationCount };
  };

  const getEntityData = async (
    entityId: string, 
    setProgress: (value: number) => void, 
    setPublicationCount: (count: number) => void
  ): Promise<TopicYearData[]> => {
    console.log(`Начинаем загрузку данных для сущности:`, entityId);
    
    const publicationIds = await getPublicationIds(entityType, entityId);
    console.log(`Найдено публикаций для сущности ${entityId}:`, publicationIds.length);
    
    if (!publicationIds || publicationIds.length === 0) {
      console.log(`Нет публикаций для сущности ${entityId}`);
      return [];
    }
    
    setPublicationCount(publicationIds.length);
    
    // Выбираем правильный уровень данных в зависимости от режима анализа
    let dataLevel: '1' | '2' | '3' = '1';
    
    switch (analysisMode) {
      case 'factors_terms':
      case 'factors_publs':
        dataLevel = '1';
        break;
      case 'subfactors_terms':
      case 'subfactors_publs':
        dataLevel = '2';
        break;
      case 'unique_terms_publs':
      case 'terms_occurrences':
        dataLevel = '3';
        break;
    }
    
    // 1. ПАРАЛЛЕЛЬНО загружаем метаданные ВСЕХ публикаций
    console.log(`Загружаем метаданные`);
    const metadataList = await fetchMetadataBatch(publicationIds, setProgress);
    
    // 2. ПАРАЛЛЕЛЬНО загружаем данные ВСЕХ публикаций
    console.log(`Загружаем тематики/термины`);
    const topicsList = await fetchDataBatch(publicationIds, dataLevel, setProgress, 50);

    // 3. Обрабатываем данные ВСЕХ публикаций
    console.log(`Обрабатываем данные`);
    
    let allTopicsData: { [topic: string]: number } = {};
    let yearData: { [year: number]: { [topic: string]: number } } = {};
    let publicationCountsData: { [year: number]: { [topic: string]: number } } = {};
    let totalPublicationsData: { [year: number]: number } = {};

    // Выбираем алгоритм анализа
    switch (analysisMode) {
      case 'factors_terms':
        const result1 = analyzeFactorsByTerms(metadataList, topicsList, publicationIds);
        allTopicsData = result1.allTopicsData;
        yearData = result1.yearData;
        totalPublicationsData = result1.yearPublicationCount;
        break;
        
      case 'subfactors_terms':
        const result2 = analyzeSubfactorsByTerms(metadataList, topicsList, publicationIds);
        allTopicsData = result2.allTopicsData;
        yearData = result2.yearData;
        totalPublicationsData = result2.yearPublicationCount;
        break;
        
      case 'factors_publs':
        const result3 = analyzeFactorsByPublications(metadataList, topicsList, publicationIds);
        allTopicsData = result3.topicPublications;
        yearData = result3.yearTopicPublications;
        publicationCountsData = result3.yearTopicPublications;
        totalPublicationsData = result3.yearTotalPublications;
        break;
        
      case 'subfactors_publs':
        const result4 = analyzeSubfactorsByPublications(metadataList, topicsList, publicationIds);
        allTopicsData = result4.topicPublications;
        yearData = result4.yearTopicPublications;
        publicationCountsData = result4.yearTopicPublications;
        totalPublicationsData = result4.yearTotalPublications;
        break;
        
      case 'unique_terms_publs':
        const result5 = analyzeUniqueTermsPerPublication(metadataList, topicsList, publicationIds);
        allTopicsData = result5.allTopicsData;
        yearData = result5.yearData;
        break;
        
      case 'terms_occurrences':
        const result6 = analyzeTermsOccurrences(metadataList, topicsList, publicationIds);
        allTopicsData = result6.allTopicsData;
        yearData = result6.yearData;
        totalPublicationsData = result6.yearPublicationCount;
        break;
    }
    
    console.log(`Статистика для сущности ${entityId}:`);
    console.log('Всего публикаций:', publicationIds.length);
    console.log('Года с данными:', Object.keys(yearData).length);
    console.log('Уникальных тем:', Object.keys(allTopicsData).length);
    
    // 4. Определяем топ-5 тем
    const sortedTopics = Object.entries(allTopicsData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([topic]) => topic);
    
    console.log(`Топ-${sortedTopics.length} тем:`, sortedTopics);
    
    // 5. Подготавливаем данные для графика
    const allYears = Object.keys(yearData)
      .map(y => parseInt(y))
      .filter(y => !isNaN(y))
      .sort((a, b) => a - b);
    
    console.log(`Все года для графика:`, allYears);
    
    const transformedData: TopicYearData[] = allYears.map(year => {
      const yearTopics = yearData[year] || {};
      const yearPublicationCounts = publicationCountsData[year] || {};
      const totalPubs = totalPublicationsData[year] || 0;
      
      return {
        year,
        topics: sortedTopics.reduce((acc, topic) => {
          acc[topic] = yearTopics[topic] || 0;
          return acc;
        }, {} as { [topic: string]: number }),
        terms: sortedTopics.reduce((acc, topic) => {
          acc[topic] = yearTopics[topic] || 0;
          return acc;
        }, {} as { [topic: string]: number }),
        publicationCounts: analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs' ? 
          sortedTopics.reduce((acc, topic) => {
            acc[topic] = yearPublicationCounts[topic] || 0;
            return acc;
          }, {} as { [topic: string]: number }) : undefined,
        totalPublications: analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs' ? totalPubs : undefined
      };
    });
    
    setProgress(100);
    console.log(`Данные для сущности ${entityId} загружены!`);
    return transformedData;
  };

  useEffect(() => {
    const fetchBothEntitiesData = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress1(0);
        setProgress2(0);
        setPublicationCount1(0);
        setPublicationCount2(0);
        
        console.log('Начинаем загрузку данных для двух сущностей:', entityId1, entityId2);
        console.log('Режим анализа:', analysisMode);
        
        // Загружаем данные для обоих сущностей параллельно
        const [entity1Data, entity2Data] = await Promise.all([
          getEntityData(entityId1, setProgress1, setPublicationCount1),
          getEntityData(entityId2, setProgress2, setPublicationCount2)
        ]);
        
        console.log('Данные сущности 1:', entity1Data);
        console.log('Данные сущности 2:', entity2Data);
        
        setData1(entity1Data);
        setData2(entity2Data);
        
        // Определяем общие топ-темы для сравнения
        const allTopics = new Set<string>();
        
        // Собираем все темы из обоих сущностей
        entity1Data.forEach(yearData => {
          Object.keys(yearData.topics).forEach(topic => {
            if (topic !== 'Общенаучные термины') {
              allTopics.add(topic);
            }
          });
        });
        
        entity2Data.forEach(yearData => {
          Object.keys(yearData.topics).forEach(topic => {
            if (topic !== 'Общенаучные термины') {
              allTopics.add(topic);
            }
          });
        });
        
        // Берем топ-5 самых частых тем из объединенного списка
        const topicsArray = Array.from(allTopics);
        setTopTopics(topicsArray.slice(0, 5));
        
        console.log('Общие топ-темы для сравнения:', topicsArray.slice(0, 5));
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError(`Ошибка загрузки: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    
    if (entityId1 && entityId2) {
      fetchBothEntitiesData();
    }
  }, [entityType, entityId1, entityId2, limit, analysisMode]);
  
  const getChartData1 = useMemo(() => {
    if (!data1.length) return [];
    
    return data1.map(item => {
      const flatData: any = { year: item.year };
      
      topTopics.forEach(topic => {
        flatData[`topics.${topic}`] = item.topics[topic] || 0;
        if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
          flatData[`counts.${topic}`] = item.publicationCounts?.[topic] || 0;
        }
      });
      
      if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
        flatData.totalPublications = item.totalPublications || 0;
      }
      
      return flatData;
    });
  }, [data1, topTopics, analysisMode]);
  
  const getChartData2 = useMemo(() => {
    if (!data2.length) return [];
    
    return data2.map(item => {
      const flatData: any = { year: item.year };
      
      topTopics.forEach(topic => {
        flatData[`topics.${topic}`] = item.topics[topic] || 0;
        if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
          flatData[`counts.${topic}`] = item.publicationCounts?.[topic] || 0;
        }
      });
      
      if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
        flatData.totalPublications = item.totalPublications || 0;
      }
      
      return flatData;
    });
  }, [data2, topTopics, analysisMode]);
  
  return { 
    data1, 
    data2, 
    loading, 
    error, 
    topTopics,
    getChartData1,
    getChartData2,
    progress1,
    progress2,
    publicationCount1,
    publicationCount2
  };
};

// ========== MAIN COMPONENT ==========
const entityLabels: Record<EntityType, { singular: string; plural: string; defaultName: string; defaultName1: string; defaultName2: string }> = {
  authors: { singular: 'автора', plural: 'Авторы', defaultName: 'Автор', defaultName1: 'Автор 1', defaultName2: 'Автор 2' },
  journals: { singular: 'журнала', plural: 'Журналы', defaultName: 'Журнал', defaultName1: 'Журнал 1', defaultName2: 'Журнал 2' },
  conferences: { singular: 'конференции', plural: 'Конференции', defaultName: 'Конференция', defaultName1: 'Конференция 1', defaultName2: 'Конференция 2' },
  organizations: { singular: 'организации', plural: 'Организации', defaultName: 'Организация', defaultName1: 'Организация 1', defaultName2: 'Организация 2' },
  cities: { singular: 'города', plural: 'Города', defaultName: 'Город', defaultName1: 'Город 1', defaultName2: 'Город 2' },
};

interface InsightsTwoPageProps {
  entityIds?: string[];
  entitiesResponse?: ApiResponse<Author[]>;
  entityType?: EntityType;
}

type TabType = 'evolution' | 'statistics' | 'forecast';

const InsightsTwoPage: React.FC<InsightsTwoPageProps> = ({ entityIds = [], entitiesResponse, entityType = 'authors' }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('evolution');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('factors_terms');
  const [showAlgorithm, setShowAlgorithm] = useState(false);

  const labels = entityLabels[entityType];
  const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'];
  
  // Функция для возврата к странице выбора сущности
  const handleBackToSelection = () => {
    router.push(`/insights/select?entity=${entityType}`);
  };
  
  const handleModeChange = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    setSelectedTopicIndex(null);
    setShowAlgorithm(false); // Скрываем алгоритм при смене режима
  };
  
  // Загружаем реальные данные для двух сущностей
  const { 
    data1: evolutionData1, 
    data2: evolutionData2, 
    loading: evolutionLoading, 
    error: evolutionError, 
    topTopics,
    getChartData1,
    getChartData2,
    progress1,
    progress2,
    publicationCount1,
    publicationCount2
  } = useTwoEntitiesData(entityType, entityIds[0] || '', entityIds[1] || '', 5, analysisMode);
  
  // Получаем имена сущностей
  const entityNames = useMemo(() => {
    if (!entitiesResponse?.data || entityIds.length < 2) {
      return [labels.defaultName1, labels.defaultName2];
    }
    const entity1 = entitiesResponse.data.find((a) => String(a.id) === String(entityIds[0]));
    const entity2 = entitiesResponse.data.find((a) => String(a.id) === String(entityIds[1]));
    return [
      entity1?.value || labels.defaultName1,
      entity2?.value || labels.defaultName2,
    ];
  }, [entityIds, entitiesResponse?.data, labels]);
  
  const displayTopics = topTopics.length > 0 ? topTopics : 
    ['Теория управления', 'Системный анализ', 'Оптимизация', 'Моделирование', 'Искусственный интеллект'];
  
  // Функция для получения цветов с учетом выбранной тематики
  const getFilteredColors = useMemo(() => {
    if (selectedTopicIndex === null) return colors;
    
    // Оставляем только выбранный цвет, остальные делаем полупрозрачными
    return colors.map((color, index) => 
      index === selectedTopicIndex ? color : `${color}20` // 20 = 12% opacity в hex
    );
  }, [selectedTopicIndex]);
  
  // Функция для фильтрации данных по выбранной тематике
  const filteredChartData1 = useMemo(() => {
    if (selectedTopicIndex === null) return getChartData1;
    
    return getChartData1.map(item => {
      const filteredItem: any = { year: item.year };
      const topicName = displayTopics[selectedTopicIndex];
      filteredItem[`topics.${topicName}`] = item[`topics.${topicName}`] || 0;
      
      if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
        filteredItem[`counts.${topicName}`] = item[`counts.${topicName}`] || 0;
        filteredItem.totalPublications = item.totalPublications || 0;
      }
      
      return filteredItem;
    });
  }, [getChartData1, selectedTopicIndex, displayTopics, analysisMode]);
  
  const filteredChartData2 = useMemo(() => {
    if (selectedTopicIndex === null) return getChartData2;
    
    return getChartData2.map(item => {
      const filteredItem: any = { year: item.year };
      const topicName = displayTopics[selectedTopicIndex];
      filteredItem[`topics.${topicName}`] = item[`topics.${topicName}`] || 0;
      
      if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
        filteredItem[`counts.${topicName}`] = item[`counts.${topicName}`] || 0;
        filteredItem.totalPublications = item.totalPublications || 0;
      }
      
      return filteredItem;
    });
  }, [getChartData2, selectedTopicIndex, displayTopics, analysisMode]);
  
  // Функция для отображения tooltip
  const renderCustomTooltip = (entityData: TopicYearData[], entityName: string) => ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const year = payload[0].payload.year;
      const yearData = entityData.find(d => d.year === year);
      if (!yearData) return null;
      
      // Режимы "по публикациям"
      if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
        const totalPubs = yearData.totalPublications || 0;
        
        if (selectedTopicIndex !== null) {
          // Показываем только одну тему - количество публикаций
          const topicName = displayTopics[selectedTopicIndex];
          const pubCount = yearData.publicationCounts?.[topicName] || 0;
          
          return (
            <Box sx={{ 
              p: 2,
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1b4596' }}>
                Год: {year}
              </Typography>
              <Typography variant="body2">
                <span style={{ color: colors[selectedTopicIndex], fontWeight: 600 }}>●</span>
                {pubCount} публ
              </Typography>
              {totalPubs > 0 && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#666' }}>
                  ({((pubCount / totalPubs) * 100).toFixed(1)}% от {totalPubs})
                </Typography>
              )}
            </Box>
          );
        } else {
          // Показываем все темы - процент от общего количества публикаций
          const topicsWithData = displayTopics.filter(topic => {
            const pubCount = yearData.publicationCounts?.[topic] || 0;
            return pubCount > 0;
          });
          
          if (topicsWithData.length === 0) return null;
          
          return (
            <Box sx={{
              p: 2,
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1b4596' }}>
                Год: {year} 
              </Typography>
              {topicsWithData.map((topic, index) => {
                const pubCount = yearData.publicationCounts?.[topic] || 0;
                const percentage = totalPubs > 0 ? ((pubCount / totalPubs) * 100).toFixed(1) : '0';
                
                return (
                  <Typography key={topic} variant="body2" sx={{ mb: 0.5 }}>
                    <span style={{ color: colors[index], fontWeight: 600 }}>●</span>
                    {percentage}%
                  </Typography>
                );
              })}
            </Box>
          );
        }
      }
      
      // Все остальные режимы
      else {
        if (selectedTopicIndex !== null) {
          const topicName = displayTopics[selectedTopicIndex];
          const count = yearData.terms[topicName] || 0;
          
          return (
            <Box sx={{ 
              p: 2,
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1b4596' }}>
                Год: {year}
              </Typography>
              <Typography variant="body2">
                <span style={{ color: colors[selectedTopicIndex], fontWeight: 600 }}>●</span>
                {count.toFixed(analysisMode === 'factors_terms' || analysisMode === 'subfactors_terms' ? 0 : 2)} {getModeLabel(analysisMode)}
              </Typography>
            </Box>
          );
        } else {
          const totalInclusions = displayTopics.reduce((sum, topic) => {
            return sum + (yearData.terms[topic] || 0);
          }, 0);
          
          if (totalInclusions === 0) return null;
          
          const nonZeroTopics = displayTopics.filter(topic => {
            const count = yearData.terms[topic] || 0;
            return count > 0;
          });
          
          return (
            <Box sx={{
              p: 2,
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1b4596' }}>
                Год: {year}
              </Typography>
              {nonZeroTopics.map((topic, index) => {
                const count = yearData.terms[topic] || 0;
                const percentage = totalInclusions > 0 ? ((count / totalInclusions) * 100).toFixed(1) : '0';
                
                return (
                  <Typography key={topic} variant="body2" sx={{ mb: 0.5 }}>
                    <span style={{ color: colors[index], fontWeight: 600 }}>●</span>
                    {percentage}%
                  </Typography>
                );
              })}
            </Box>
          );
        }
      }
    }
    return null;
  };
  
  const getModeLabel = (mode: AnalysisMode) => {
    switch (mode) {
      case 'factors_terms': return 'вхождений факторов';
      case 'subfactors_terms': return 'вхождений подфакторов';
      case 'factors_publs': return 'публикаций с факторами';
      case 'subfactors_publs': return 'публикаций с подфакторами';
      case 'unique_terms_publs': return 'публикаций с терминами';
      case 'terms_occurrences': return 'вхождений терминов';
      default: return '';
    }
  };
  
  const getModeDescription = (mode: AnalysisMode) => {
    switch (mode) {
      case 'factors_terms': return 'Сумма вхождений факторов в публикациях за год';
      case 'subfactors_terms': return 'Сумма вхождений подфакторов в публикациях за год (исключая факторы)';
      case 'factors_publs': return 'Процент публикаций, где фактор является доминирующим';
      case 'subfactors_publs': return 'Процент публикаций, где подфактор является доминирующим (исключая факторы)';
      case 'unique_terms_publs': return 'В скольких публикациях встречается каждый термин (1 раз за публикацию)';
      case 'terms_occurrences': return 'Общее количество вхождений терминов в публикациях за год';
      default: return '';
    }
  };
  
  const getAlgorithmDescription = (mode: AnalysisMode) => {
    switch (mode) {
      case 'factors_terms':
        return `1. Для каждой публикации получаем метаданные и факторы (level=1)
2. Извлекаем год публикации
3. Для каждого фактора:
   - Суммируем количество вхождений фактора в публикации
   - Добавляем к общему счетчику для фактора
4. Сортируем факторы по убыванию суммарных вхождений
5. Выбираем топ-5 факторов
6. Формируем данные для графика: год - {фактор: сумма вхождений}`;
      
      case 'subfactors_terms':
        return `1. Для каждой публикации получаем метаданные и подфакторы (level=2)
2. Извлекаем год публикации
3. Для каждого подфактора суммируем количество вхождений подфактора
4. Сортируем подфакторы по убыванию суммарных вхождений
5. Выбираем топ-5 подфакторов
6. Формируем данные для графика: год - {подфактор: сумма вхождений}`;
      
      case 'factors_publs':
        return `1. Для каждой публикации получаем метаданные и факторы (level=1)
2. Извлекаем год публикации
3. Находим максимальное значение среди всех факторов в публикации
4. Определяем все факторы с этим максимальным значением (доминирующие)
5. Для каждого доминирующего фактора учитываем публикацию
6. Сортируем факторы по количеству публикаций, где они доминируют
7. Выбираем топ-5 факторов
8. Формируем данные для графика: год - {фактор: % публикаций}`;
      
      case 'subfactors_publs':
        return `1. Для каждой публикации получаем метаданные и подфакторы (level=2)
2. Извлекаем год публикации
3. Находим максимальное значение среди подфакторов
4. Определяем доминирующие подфакторы
5. Для каждого доминирующего подфактора учитываем публикацию
6. Сортируем подфакторы по количеству публикаций, где они доминируют
7. Выбираем топ-5 подфакторов
8. Формируем данные для графика: год - {подфактор: % публикаций}`;
      
      case 'unique_terms_publs':
        return `1. Для каждой публикации получаем метаданные и термины (level=3)
2. Извлекаем год публикации
3. Для каждого термина:
   - Учитываем 1 раз за публикацию
   - Увеличиваем счетчик публикаций с термином
4. Сортируем термины по количеству публикаций
5. Выбираем топ-5 терминов
6. Формируем данные для графика: год - {термин: кол-во публикаций}`;
      
      case 'terms_occurrences':
        return `1. Для каждой публикации получаем метаданные и термины (level=3)
2. Извлекаем год публикации
3. Для каждого термина:
   - Суммируем количество вхождений термина в публикации
   - Добавляем к общему счетчику для термина
4. Сортируем термины по убыванию суммарных вхождений
5. Выбираем топ-5 терминов
6. Формируем данные для графика: год - {термин: сумма вхождений}`;
      
      default: return '';
    }
  };
  
  return (
    <>
      <Head>
        <title>Сравнение тематических интересов - {entityNames[0]} и {entityNames[1]}</title>
      </Head>
      <main className="flex flex-col items-center">
        <Stack spacing={4} sx={{ width: '67.5vw', mt: '16px', mb: '40px' }}>
          {/* Кнопки переключения графиков */}
          <Stack direction="row" spacing={2}>
            <button
              onClick={() => {
                setActiveTab('evolution');
                setSelectedTopicIndex(null);
                setShowAlgorithm(false);
              }}
              style={{
                flex: 1,
                height: '48px',
                borderRadius: '12px',
                fontWeight: activeTab === 'evolution' ? 600 : 500,
                fontSize: '16px',
                textTransform: 'none',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'evolution' ? '#D1D1D1' : '#1b4596',
                color: '#FFFFFF',
              }}
            >
              Эволюция тематик по годам
            </button>
            <button
              onClick={() => {
                setActiveTab('statistics');
                setShowAlgorithm(false);
              }}
              style={{
                flex: 1,
                height: '48px',
                borderRadius: '12px',
                fontWeight: activeTab === 'statistics' ? 600 : 500,
                fontSize: '16px',
                textTransform: 'none',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'statistics' ? '#D1D1D1' : '#1b4596',
                color: '#FFFFFF',
              }}
            >
              Статистика за несколько лет
            </button>
            <button
              onClick={() => {
                setActiveTab('forecast');
                setShowAlgorithm(false);
              }}
              style={{
                flex: 1,
                height: '48px',
                borderRadius: '12px',
                fontWeight: activeTab === 'forecast' ? 600 : 500,
                fontSize: '16px',
                textTransform: 'none',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'forecast' ? '#D1D1D1' : '#1b4596',
                color: '#FFFFFF',
              }}
            >
              Прогноз дальнейшего развития 
            </button>
          </Stack>
          
          {activeTab === 'evolution' && (
            <>
              {/* 6 КНОПОК РЕЖИМОВ АНАЛИЗА */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '8px',
                mt: 1,
                flexWrap: 'wrap'
              }}>
                {/* 1. Факторы (вхождения) */}
                <button
                  onClick={() => handleModeChange('factors_terms')}
                  style={{
                    minWidth: '140px',
                    height: '36px',
                    borderRadius: '8px',
                    fontWeight: analysisMode === 'factors_terms' ? 600 : 500,
                    fontSize: '12px',
                    textTransform: 'none',
                    border: '1px solid #1b4596',
                    cursor: 'pointer',
                    backgroundColor: analysisMode === 'factors_terms' ? '#1b4596' : '#FFFFFF',
                    color: analysisMode === 'factors_terms' ? '#FFFFFF' : '#1b4596',
                    padding: '0 8px',
                  }}
                >
                  Факторы (вхождения)
                </button>
                
                {/* 2. Подфакторы (вхождения) */}
                <button
                  onClick={() => handleModeChange('subfactors_terms')}
                  style={{
                    minWidth: '140px',
                    height: '36px',
                    borderRadius: '8px',
                    fontWeight: analysisMode === 'subfactors_terms' ? 600 : 500,
                    fontSize: '12px',
                    textTransform: 'none',
                    border: '1px solid #1b4596',
                    cursor: 'pointer',
                    backgroundColor: analysisMode === 'subfactors_terms' ? '#1b4596' : '#FFFFFF',
                    color: analysisMode === 'subfactors_terms' ? '#FFFFFF' : '#1b4596',
                    padding: '0 8px',
                  }}
                >
                  Подфакторы (вхождения)
                </button>
                
                {/* 3. Факторы (публикации) */}
                <button
                  onClick={() => handleModeChange('factors_publs')}
                  style={{
                    minWidth: '140px',
                    height: '36px',
                    borderRadius: '8px',
                    fontWeight: analysisMode === 'factors_publs' ? 600 : 500,
                    fontSize: '12px',
                    textTransform: 'none',
                    border: '1px solid #1b4596',
                    cursor: 'pointer',
                    backgroundColor: analysisMode === 'factors_publs' ? '#1b4596' : '#FFFFFF',
                    color: analysisMode === 'factors_publs' ? '#FFFFFF' : '#1b4596',
                    padding: '0 8px',
                  }}
                >
                  Факторы (публикации)
                </button>
                
                {/* 4. Подфакторы (публикации) */}
                <button
                  onClick={() => handleModeChange('subfactors_publs')}
                  style={{
                    minWidth: '140px',
                    height: '36px',
                    borderRadius: '8px',
                    fontWeight: analysisMode === 'subfactors_publs' ? 600 : 500,
                    fontSize: '12px',
                    textTransform: 'none',
                    border: '1px solid #1b4596',
                    cursor: 'pointer',
                    backgroundColor: analysisMode === 'subfactors_publs' ? '#1b4596' : '#FFFFFF',
                    color: analysisMode === 'subfactors_publs' ? '#FFFFFF' : '#1b4596',
                    padding: '0 8px',
                  }}
                >
                  Подфакторы (публикации)
                </button>
                
                {/* 5. Термины (публикации) */}
                <button
                  onClick={() => handleModeChange('unique_terms_publs')}
                  style={{
                    minWidth: '140px',
                    height: '36px',
                    borderRadius: '8px',
                    fontWeight: analysisMode === 'unique_terms_publs' ? 600 : 500,
                    fontSize: '12px',
                    textTransform: 'none',
                    border: '1px solid #1b4596',
                    cursor: 'pointer',
                    backgroundColor: analysisMode === 'unique_terms_publs' ? '#1b4596' : '#FFFFFF',
                    color: analysisMode === 'unique_terms_publs' ? '#FFFFFF' : '#1b4596',
                    padding: '0 8px',
                  }}
                >
                  Термины (публикации)
                </button>
                
                {/* 6. Термины (вхождения) */}
                <button
                  onClick={() => handleModeChange('terms_occurrences')}
                  style={{
                    minWidth: '140px',
                    height: '36px',
                    borderRadius: '8px',
                    fontWeight: analysisMode === 'terms_occurrences' ? 600 : 500,
                    fontSize: '12px',
                    textTransform: 'none',
                    border: '1px solid #1b4596',
                    cursor: 'pointer',
                    backgroundColor: analysisMode === 'terms_occurrences' ? '#1b4596' : '#FFFFFF',
                    color: analysisMode === 'terms_occurrences' ? '#FFFFFF' : '#1b4596',
                    padding: '0 8px',
                  }}
                >
                  Термины (вхождения)
                </button>
              </Box>
              
              {/* Индикаторы прогресса */}
              {evolutionLoading && (
                <>
                  {publicationCount1 > 0 && (
                    <Card sx={{ 
                      bgcolor: '#FFFFFF', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                      mb: 1
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Загрузка данных для {entityNames[0]} ({getModeLabel(analysisMode)})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {progress1}%
                            </Typography>
                          </Box>
                          <Box sx={{ position: 'relative', height: 8, bgcolor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
                            <Box 
                              sx={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                bgcolor: '#1b4596',
                                width: `${progress1}%`,
                                transition: 'width 0.3s ease',
                                borderRadius: 4
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#656565' }}>
                            Анализируем {publicationCount1} публикаций
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                  
                  {publicationCount2 > 0 && (
                    <Card sx={{ 
                      bgcolor: '#FFFFFF', 
                      borderRadius: '16px', 
                      boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                      mb: 2
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Загрузка данных для {entityNames[1]} ({getModeLabel(analysisMode)})
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {progress2}%
                            </Typography>
                          </Box>
                          <Box sx={{ position: 'relative', height: 8, bgcolor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
                            <Box 
                              sx={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                bgcolor: '#1b4596',
                                width: `${progress2}%`,
                                transition: 'width 0.3s ease',
                                borderRadius: 4
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#656565' }}>
                            Анализируем {publicationCount2} публикаций
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
              
              {/* ОСНОВНОЙ ГРАФИК - СРАВНЕНИЕ ДВУХ СУЩНОСТЕЙ */}
              <Card
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                  p: 3
                }}
              >
                <CardContent sx={{ p: 0, position: 'relative' }}>
                  {evolutionLoading && publicationCount1 === 0 && publicationCount2 === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="500px">
                      <CircularProgress />
                    </Box>
                  ) : evolutionError ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="500px">
                      <Typography color="error">{evolutionError}</Typography>
                    </Box>
                  ) : getChartData1.length === 0 || getChartData2.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="500px" flexDirection="column" gap={2}>
                      <Typography variant="h6" color="text.secondary">
                        Нет данных для отображения
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getModeDescription(analysisMode)}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', height: '500px', position: 'relative' }}>
                      {selectedTopicIndex !== null && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          zIndex: 100 
                        }}>
                          <button
                            onClick={() => setSelectedTopicIndex(null)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#1b4596',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span>Сбросить фильтр</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
                            </svg>
                          </button>
                        </Box>
                      )}
                      
                      {/* СИНХРОНИЗАЦИЯ: Определяем общий диапазон годов */}
                      {(() => {
                        // Находим все уникальные годы из обоих наборов данных
                        const years1 = getChartData1.map(d => d.year);
                        const years2 = getChartData2.map(d => d.year);
                        const allUniqueYears = Array.from(new Set([...years1, ...years2]));
                        const sortedYears = allUniqueYears.sort((a, b) => a - b);
                        
                        // Создаем выровненные данные с нулями для отсутствующих годов
                        const createAlignedData = (originalData: any[]) => {
                          return sortedYears.map(year => {
                            const existingData = originalData.find(d => d.year === year);
                            if (existingData) {
                              return existingData;
                            }
                            // Создаем запись с нулевыми значениями для отсутствующего года
                            const emptyEntry: any = { year };
                            displayTopics.forEach(topic => {
                              emptyEntry[`topics.${topic}`] = 0;
                              if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
                                emptyEntry[`counts.${topic}`] = 0;
                              }
                            });
                            if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
                              emptyEntry.totalPublications = 0;
                            }
                            return emptyEntry;
                          });
                        };
                        
                        const alignedData1 = createAlignedData(selectedTopicIndex === null ? getChartData1 : filteredChartData1);
                        const alignedData2 = createAlignedData(selectedTopicIndex === null ? getChartData2 : filteredChartData2);
                        
                        return (
                          <>
                            {/* Верхний график — Сущность 1 */}
                            <Box sx={{ width: '100%', height: '250px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={alignedData1}
                                  margin={{ top: 10, right: 70, left: 70, bottom: 0 }}
                                >
                                  <defs>
                                    {displayTopics.map((topic, index) => (
                                      <linearGradient key={topic} id={`color1-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getFilteredColors[index]} stopOpacity={selectedTopicIndex === null || selectedTopicIndex === index ? 0.8 : 0.2} />
                                        <stop offset="95%" stopColor={getFilteredColors[index]} stopOpacity={selectedTopicIndex === null || selectedTopicIndex === index ? 0.1 : 0.05} />
                                      </linearGradient>
                                    ))}
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                  <YAxis hide domain={[0, 'auto']} />
                                  <Tooltip
                                    wrapperStyle={{
                                      backgroundColor: '#FFFFFF',
                                    }}
                                    contentStyle={{
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #E0E0E0',
                                      borderRadius: '8px',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                      padding: 0
                                    }}
                                    content={renderCustomTooltip(evolutionData1, entityNames[0])}
                                  />
                                  {displayTopics.map((topic, index) => (
                                    <Area
                                      key={topic}
                                      type="monotone"
                                      dataKey={`topics.${topic}`}
                                      stroke={getFilteredColors[index]}
                                      strokeWidth={selectedTopicIndex === null || selectedTopicIndex === index ? 2 : 1}
                                      fill={`url(#color1-${index})`}
                                      stackId="1"
                                    />
                                  ))}
                                </AreaChart>
                              </ResponsiveContainer>
                            </Box>
                            
                            {/* Центральная ось с годами - СИНЯЯ ЛИНИЯ */}
                            <Box sx={{ 
                              position: 'absolute', 
                              top: '50%', 
                              left: 70, 
                              right: 70, 
                              height: '1px', 
                              backgroundColor: '#1b4596',
                              zIndex: 10 
                            }} />
                            
                            {/* Нижний график — Сущность 2, перевёрнутый */}
                            <Box sx={{ width: '100%', height: '250px', mt: '20px', transform: 'scaleY(-1)' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={alignedData2}
                                  margin={{ top: 0, right: 70, left: 70, bottom: 10 }}
                                >
                                  <defs>
                                    {displayTopics.map((topic, index) => (
                                      <linearGradient key={topic} id={`color2-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getFilteredColors[index]} stopOpacity={selectedTopicIndex === null || selectedTopicIndex === index ? 0.8 : 0.2} />
                                        <stop offset="95%" stopColor={getFilteredColors[index]} stopOpacity={selectedTopicIndex === null || selectedTopicIndex === index ? 0.1 : 0.05} />
                                      </linearGradient>
                                    ))}
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                  <YAxis hide domain={[0, 'auto']} />
                                  <Tooltip
                                    wrapperStyle={{
                                      backgroundColor: '#FFFFFF',
                                      transform: 'scaleY(-1)',
                                    }}
                                    contentStyle={{
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #E0E0E0',
                                      borderRadius: '8px',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                      padding: 0,
                                    }}
                                    content={renderCustomTooltip(evolutionData2, entityNames[1])}
                                  />
                                  {displayTopics.map((topic, index) => (
                                    <Area
                                      key={topic}
                                      type="monotone"
                                      dataKey={`topics.${topic}`}
                                      stroke={getFilteredColors[index]}
                                      strokeWidth={selectedTopicIndex === null || selectedTopicIndex === index ? 2 : 1}
                                      fill={`url(#color2-${index})`}
                                      stackId="1"
                                    />
                                  ))}
                                </AreaChart>
                              </ResponsiveContainer>
                            </Box>
                            
                            {/* Подписи лет по центру - ОБЩИЕ ДЛЯ ОБОИХ ГРАФИКОВ */}
                            <Box sx={{ 
                              position: 'absolute', 
                              top: '50%', 
                              left: 70, 
                              right: 70, 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              zIndex: 11,
                              pointerEvents: 'none'
                            }}>
                              {sortedYears.map((year, i) => (
                                <Typography 
                                  key={year} 
                                  variant="caption" 
                                  sx={{ 
                                    color: '#1b4596', 
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    backgroundColor: '#FFFFFF',
                                    padding: '0 2px',
                                    transform: 'translateY(-10px)'
                                  }}
                                >
                                  {year}
                                </Typography>
                              ))}
                            </Box>
                          </>
                        );
                      })()}
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              {/* АННОТАЦИЯ ДЛЯ ГРАФИКОВ ЭВОЛЮЦИИ */}
              <Card sx={{ 
                bgcolor: '#FFFFFF', 
                borderRadius: '16px', 
                boxShadow: '0 4px 32px rgba(0,34,102,0.15)', 
                p: 2 
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack 
                    direction="row" 
                    spacing={2} 
                    sx={{ 
                      justifyContent: 'center', 
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}
                  >
                    {displayTopics.map((label, i) => {
                      const isSelected = selectedTopicIndex === i;
                      const isSemiTransparent = selectedTopicIndex !== null && selectedTopicIndex !== i;
                      
                      return (
                        <Stack
                          key={label}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          onClick={() => setSelectedTopicIndex(isSelected ? null : i)}
                          sx={{
                            cursor: 'pointer',
                            px: 1.5,
                            py: 1,
                            borderRadius: '8px',
                            bgcolor: isSelected ? 'rgba(27,69,150,0.06)' : 'transparent',
                            border: isSelected ? '1px solid #1b4596' : '1px solid transparent',
                            userSelect: 'none',
                            opacity: isSemiTransparent ? 0.4 : 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: isSelected ? 'rgba(27,69,150,0.1)' : 'rgba(27,69,150,0.04)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '2px', 
                            bgcolor: colors[i],
                            opacity: isSemiTransparent ? 0.5 : 1
                          }} />
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: isSemiTransparent ? '#999' : '#656565',
                              fontSize: '16px',
                              fontWeight: isSelected ? 600 : 500 
                            }}
                          >
                            {label}
                          </Typography>
                          {isSelected && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1b4596">
                              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                            </svg>
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </>
          )}
          
          {/* ВТОРАЯ ВКЛАДКА - ПУСТАЯ КАРТОЧКА */}
          {activeTab === 'statistics' && (
            <Card
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                p: 3,
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary" align="center">
                  Статистика за несколько лет
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  Этот раздел находится в разработке
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {/* ТРЕТЬЯ ВКЛАДКА - ПУСТАЯ КАРТОЧКА */}
          {activeTab === 'forecast' && (
            <Card
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                p: 3,
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary" align="center">
                  Прогноз дальнейшего развития
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  Этот раздел находится в разработке
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {/* ИНФОРМАЦИЯ О СУЩНОСТЯХ */}
          <Card
            sx={{
              bgcolor: '#F5F5F6',
              borderRadius: '16px',
              boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#1b4596', fontWeight: 600, mb: 1 }}>
                {labels.plural}:
              </Typography>
              
              {/* Карточки для сущностей */}
              {entityType === 'authors' ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <Typography
                    sx={{ 
                      color: '#1b4596', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { opacity: 0.8 }
                    }}
                    onClick={() => {
                      if (entityIds?.[0]) {
                        window.open(`/authors/author?creature_id=${entityIds[0]}`, '_blank');
                      }
                    }}
                  >
                    {entityNames[0]}
                  </Typography>
                  <Typography>,</Typography>
                  <Typography 
                    sx={{
                      color: '#1b4596',
                      fontWeight: 600, 
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { opacity: 0.8 }
                    }}
                    onClick={() => {
                      if (entityIds?.[1]) {
                        window.open(`/authors/author?creature_id=${entityIds[1]}`, '_blank');
                      }
                    }}
                  >
                    {entityNames[1]}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body1" sx={{ color: '#1b4596' }}>
                  {entityNames[0]}, {entityNames[1]}
                </Typography>
              )}

              {/* СТАТИСТИКА */}
              <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                {publicationCount1 > 0 && (
                  <Typography variant="body2" sx={{ color: '#656565', fontWeight: 500 }}>
                    {entityNames[0]}: <strong>{publicationCount1}</strong> публикаций
                  </Typography>
                )}
                {publicationCount2 > 0 && (
                  <Typography variant="body2" sx={{ color: '#656565', fontWeight: 500 }}>
                    {entityNames[1]}: <strong>{publicationCount2}</strong> публикаций
                  </Typography>
                )}
              </Box>
              
              {activeTab === 'evolution' && (
                <Typography variant="body2" sx={{ color: '#656565' }}>
                  {getModeDescription(analysisMode)}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* КНОПКА ДЛЯ ПОКАЗА АЛГОРИТМА (ПОД карточкой с описанием сущности) */}
          {activeTab === 'evolution' && !evolutionLoading && getChartData1.length > 0 && getChartData2.length > 0 && displayTopics.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setShowAlgorithm(!showAlgorithm)}
                endIcon={showAlgorithm ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{
                  color: '#1b4596',
                  borderColor: '#1b4596',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  padding: '6px 16px',
                  '&:hover': {
                    backgroundColor: 'rgba(27, 69, 150, 0.04)',
                    borderColor: '#153d7a',
                  }
                }}
              >
                {showAlgorithm ? 'Скрыть алгоритм анализа' : 'Показать алгоритм анализа'}
              </Button>
            </Box>
          )}

          {/* КАРТОЧКА С АЛГОРИТМОМ (только при showAlgorithm) */}
          <Collapse in={showAlgorithm}>
            <Card
              sx={{
                bgcolor: 'rgba(27,69,150,0.05)',
                borderRadius: '12px',
                boxShadow: '0 2px 16px rgba(0,34,102,0.08)',
                border: '1px solid #1b4596',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#1b4596', fontWeight: 600 }}>
                    Алгоритм анализа: {getModeLabel(analysisMode)}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowAlgorithm(false)}
                    sx={{ color: '#1b4596' }}
                  >
                    <ExpandLessIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: '#656565', whiteSpace: 'pre-line', fontFamily: 'monospace', fontSize: '13px' }}>
                  {getAlgorithmDescription(analysisMode)}
                </Typography>
              </CardContent>
            </Card>
          </Collapse>
          
          {/* КНОПКА НАЗАД */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginTop: '-20px',
            marginLeft: '8px'
          }}>
            <Button
              variant="outlined"
              onClick={handleBackToSelection}
              sx={{
                color: '#1b4596',
                borderColor: '#1b4596',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '16px',
                padding: '8px 24px',
                '&:hover': {
                  backgroundColor: 'rgba(27, 69, 150, 0.04)',
                  borderColor: '#153d7a',
                }
              }}
            >
              Назад
            </Button>
          </Box>
        </Stack>
      </main>
    </>
  );
};

export default InsightsTwoPage;