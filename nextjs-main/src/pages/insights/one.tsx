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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from 'recharts';
import { ApiResponse } from '@/src/store/types/apiTypes';
import { Author } from '@/src/store/types/authorTypes';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// ========== TYPES ==========
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

interface PublicationTerms {
  factors: Record<string, number>;
  subfactors: Record<string, number>;
  terms: Record<string, number>;
}

type EntityType = 'authors' | 'journals' | 'conferences' | 'organizations' | 'cities';
type AnalysisMode = 'factors_terms' | 'subfactors_terms' | 'terms_occurrences' | 'factors_publs' | 'subfactors_publs' | 'unique_terms_publs';

// ========== КОНСТАНТЫ ==========
const COMMON_TERMS = [
  'Общенаучные термины',
  'общенаучные термины',
  'General scientific terms',
  'general scientific terms'
];

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

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
const isCommonTerm = (term: string): boolean => {
  return COMMON_TERMS.some(common => 
    term.toLowerCase() === common.toLowerCase()
  );
};

const filterOutCommonTerms = <T extends Record<string, number>>(obj: T): T => {
  const filtered = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (!isCommonTerm(key)) {
      filtered[key as keyof T] = value as any;
    }
  }
  return filtered;
};

// ========== HOOK ==========
const useTopTopicsData = (
  entityType: EntityType, 
  entityId: string, 
  limit: number = 5, 
  analysisMode: AnalysisMode = 'factors_terms'
) => {
  const [data, setData] = useState<TopicYearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topTopics, setTopTopics] = useState<string[]>([]);
  const [publicationCount, setPublicationCount] = useState(0);
  const [progress, setProgress] = useState(0);

  // Хардкодированный список факторов (для исключения при level=2 и level=3)
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

  // Хардкодированный список подфакторов (для исключения при level=3)
  const SUBFACTORS_LIST = [
    'Абстрактные модели вычислений',
    'Авиация',
    'Автоматизация проектирования',
    'Автоматизированные информационно-управляющие системы (АИУС)',
    'Автомобильный транспорт',
    'Автономная навигация',
    'Автономные и распределённые система',
    'Адаптация и обучение',
    'Алгебра высказываний',
    'Алгебраическая геометрия',
    'Алгоритмическая теория информации',
    'Алгоритмы сжатия изображений, видеотеки, оценивание качества изображение',
    'Альтернативные источники энергии',
    'Анализ систем управления',
    'АСУ ТП',
    'Атомная энергетика',
    'Беспилотные летательные аппараты',
    'Виды управления, синтез систем управления',
    'Водный транспорт',
    'Военное дело',
    'Встроенный контроль и контролепригодность',
    'Выпуклая оптимизация',
    'Вычислительные системы реального времени',
    'Геоинформационные системы',
    'Грибоводство',
    'Группы и алгебры Ли',
    'Динамические управляемые системы',
    'Динамическое программирование',
    'Дискретная оптимизация',
    'Дифференциальная алгебра',
    'Дифференциальная геометрия',
    'Добыча полезных ископаемых',
    'Железнодорожный транспорт',
    'Животноводство',
    'Знания и онтологии',
    'Идентификация и наблюдение (оценивание)',
    'Избыточность и отказоустойчивость',
    'Измерительные технические средства управления',
    'Индивидуальный выбор',
    'Институциональное управление',
    'Интегральные уравнения',
    'Интегрированные навигационные системы',
    'Информационная безопасность телекоммуникационных и вычислительных сетей',
    'Информационное управление',
    'Исполнительные технические средства управления',
    'Квантовая и ядерная физика',
    'Квантовые компьютеры',
    'Квантовые методы обработки информации',
    'Кибернетика и системный анализ',
    'Коллективное поведение',
    'Коллективный выбор, голосование',
    'Комбинаторика',
    'Контроль эпидемии',
    'Кормопроизводство',
    'Космос',
    'Криптография',
    'Криптография и математические методы защиты информации',
    'Линейная алгебра, теория матриц',
    'Линейное программирование',
    'Логика предикатов и логические исчисления',
    'Манипуляторы, промышленные работы',
    'Математическая статистика',
    'Математические модели и методы преобразования и передачи информации',
    'Математический и комплексный анализ',
    'Машинное обучение и автоматическая классификация',
    'Машиностроение',
    'Межсредные роботы, разное',
    'Металлургия',
    'Механизмы обеспечения взаимодействия объектов сложных систем в жестком реальном времени',
    'Механизмы планирования',
    'Механизмы стимулирования',
    'Механика',
    'Механика в мехатронике',
    'Микроконтроллеры, встроенные микросистемы',
    'Многокритериальное принятие решений',
    'Многопроцессорные системы, параллельные вычисления',
    'Мобильные сотовые сети',
    'Модели отказов элементов систем',
    'Моделирование рассуждений',
    'Морские подвижные объекты',
    'Мультиагентные системы',
    'Наземные (напланетные) роботы',
    'Нейронные сети и нейроинформатика',
    'Нелинейное программирование',
    'Нечеткие модели, мягкие вычисления',
    'Обработка текстов естественного языка',
    'Образование',
    'Общенаучные термины',
    'Общественное и индивидуальное здоровье, контроль заболевания, медицинские вмешательства',
    'Обыкновенные дифференциальные уравнения и теория динамических систем',
    'Оптика',
    'Оптимальное управление',
    'Оптимизация потерь и безопасность',
    'Оптоволоконные сети',
    'Организационно-правовые вопросы защиты информации',
    'Передача и обработка сигналов',
    'Переработка сельскохозяйственной продукции',
    'Переработка углеводородов',
    'Предварительная обработка изображений',
    'Преобразовательные технические средства управления',
    'Программно-аппаратные средства защиты информации',
    'Программное обеспечение мехатронных систем',
    'Профилактика заболеваний',
    'Разностные уравнения',
    'Распознавание и генерация объектов и сцен на изображении',
    'Распознавание и синтез речи',
    'Растениеводство',
    'Расчетные показатели',
    'Решетки и Булевы алгебры',
    'Робастное управление',
    'Роботы водного базирования',
    'Рыбоводство',
    'Системное программирование',
    'Системы автоматизации и управления',
    'Системы поддержки жизни и здоровья',
    'Системы управления производством (АСУП)',
    'Системы управления с распределенными параметрами',
    'Социально-экономические системы',
    'Социальные сетевые структуры',
    'Социальные системы',
    'Станки с ЧПУ',
    'Стохастические системы управления',
    'Структурные и логико-алгебраические модели надежности',
    'Теория автоматов и сетей Петри',
    'Теория алгоритмов',
    'Теория вероятностей',
    'Теория вероятностей и математическая статистика',
    'Теория графов',
    'Теория дифференциальных игр',
    'Теория иерархических игр',
    'Теория кооперативных игр',
    'Теория массового обслуживания',
    'Теория множеств и отношений',
    'Теория некооперативных игр',
    'Теория расписаний, управление проектами',
    'Теория сложности вычислений',
    'Теория случайных процессов',
    'Теория чисел',
    'Тестирование, диагностирование, верификация и валидация',
    'Техническая диагностика, надежность и безопасность',
    'Техническая защита информации',
    'Топология',
    'Универсальная алгебра',
    'Управление в экологических системах',
    'Управление запасами и логистика',
    'Управление информационными рисками/информационной безопасностью, Аналитические вопросы ИБ',
    'Уравнения в частных производных',
    'Физика',
    'Финансовые системы',
    'Формальные языки и грамматики',
    'Функциональный анализ',
    'Химическая промышленность',
    'Цифровой двойник пациента',
    'Человеко-машинные системы',
    'Широкополосные беспроводные сети',
    'Экзоскелет',
    'Электричество и магнетизм',
    'Электромеханика',
    'Электроэнергетика',
    'Языки программирования высокого уровня'
  ];

  const fetchViaProxy = async (endpoint: string, params: Record<string, string> = {}) => {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    const cached = apiCache.get(cacheKey);
    
    console.log(`📤 Запрос: ${endpoint} с параметрами:`, params);
    
    if (cached) {
      console.log(`🔄 Используем кеш для ${endpoint}`);
      return cached;
    }

    const searchParams = new URLSearchParams({ endpoint, ...params }).toString();
    const url = `/api/proxy?${searchParams}`;
    console.log(`🔗 Прокси URL: ${url}`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ Данные от прокси для ${endpoint}:`);
      console.log('Тип ответа:', Array.isArray(data) ? 'массив' : 'объект');
      console.log('Размер:', Array.isArray(data) ? data.length : Object.keys(data).length);
      
      apiCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`❌ Ошибка при запросе ${endpoint}:`, error);
      throw error;
    }
  };

  const getPublicationIds = async (entityType: EntityType, entityId: string): Promise<number[]> => {
    const endpointMap = {
      authors: { 
        endpoint: 'authors_publs', 
        param: 'auth_prnd_id'
      },
      journals: { 
        endpoint: 'journals_publs', 
        param: 'id_journal'
      },
      conferences: { 
        endpoint: 'conferences_publs', 
        param: 'id_conference' 
      },
      organizations: { 
        endpoint: 'organizations_publs', 
        param: 'id_organization' 
      },
      cities: { 
        endpoint: 'cities_publs', 
        param: 'id_city' 
      },
    };

    const config = endpointMap[entityType];
    if (!config) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const params: Record<string, string> = {};
    if (entityType === 'authors') {
      params['auth_prnd_id'] = entityId;
      params['id_author'] = entityId;
    } else {
      params[config.param] = entityId;
    }

    const publications = await fetchViaProxy(config.endpoint, params);
    
    if (Array.isArray(publications)) {
      console.log(`Получено публикаций: ${publications.length}`);
      
      if (publications.length > 0 && Array.isArray(publications[0])) {
        const publicationsWithYear = publications.map(([id, year]) => ({
          id,
          year,
          metadata: { 'Publication year': year }
        }));
        
        publicationsWithYear.forEach(({ id, metadata }) => {
          const cacheKey = `publs_metadata:${JSON.stringify({ id_publ: id.toString() })}`;
          apiCache.set(cacheKey, metadata);
        });
        
        console.log('Пример метаданных:', publicationsWithYear[0]);
        
        return publicationsWithYear.map(p => p.id);
      }
      
      return publications;
    }
    
    return [];
  };

  const fetchPublicationTerms = async (publicationIds: number[]): Promise<Map<number, PublicationTerms>> => {
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < publicationIds.length; i += batchSize) {
      const batch = publicationIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    const resultsMap = new Map<number, PublicationTerms>();
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchPromises = batch.map(async (publId) => {
        try {
          const data = await fetchViaProxy('get_publication_terms', {
            id_publ: publId.toString()
          }) as PublicationTerms & { publication_id: number };
          
          if (data && typeof data === 'object') {
            // Фильтруем общенаучные термины на всех уровнях
            const filteredData: PublicationTerms = {
              factors: filterOutCommonTerms(data.factors || {}),
              subfactors: filterOutCommonTerms(data.subfactors || {}),
              terms: filterOutCommonTerms(data.terms || {})
            };
            
            console.log(`📊 Публикация ${publId}: факторов=${Object.keys(filteredData.factors).length}, подфакторов=${Object.keys(filteredData.subfactors).length}, терминов=${Object.keys(filteredData.terms).length}`);
            
            resultsMap.set(publId, filteredData);
          }
        } catch (err) {
          console.error(`❌ Ошибка данных для публикации ${publId}:`, err);
          resultsMap.set(publId, { factors: {}, subfactors: {}, terms: {} });
        }
      });
      
      await Promise.all(batchPromises);
      setProgress(50 + Math.round(((i + 1) / batches.length) * 50));
    }
    
    return resultsMap;
  };



  // ========== АЛГОРИТМЫ АНАЛИЗА ==========
  
  // 1. Факторы (вхождения)
  const analyzeFactorsByTerms = (
    metadataList: any[],
    termsMap: Map<number, PublicationTerms>,
    allPublicationIds: number[]
  ) => {
    console.log('=== DEBUG: analyzeFactorsByTerms ===');
    console.log('всего публикаций:', allPublicationIds.length);
    
    const allTopicsData: { [topic: string]: number } = {};
    const yearData: { [year: number]: { [topic: string]: number } } = {};
    const yearPublicationCount: { [year: number]: number } = {};

    for (let i = 0; i < allPublicationIds.length; i++) {
      const publId = allPublicationIds[i];
      const metadata = metadataList[i];
      const terms = termsMap.get(publId);
      
      if (!metadata || !terms) continue;

      const year = metadata['Publication year'];
      yearPublicationCount[year] = (yearPublicationCount[year] || 0) + 1;

      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [topic, count] of Object.entries(terms.factors)) {
        const topicCount = count as number;
        allTopicsData[topic] = (allTopicsData[topic] || 0) + topicCount;
        yearData[year][topic] = (yearData[year][topic] || 0) + topicCount;
      }
    }
    
    console.log('Результаты analyzeFactorsByTerms:');
    console.log('- Уникальных тем:', Object.keys(allTopicsData).length);
    console.log('- Топ-10 тем:', Object.entries(allTopicsData).sort(([, a], [, b]) => b - a).slice(0, 10));

    return { allTopicsData, yearData, yearPublicationCount };
  };

  // 2. Подфакторы (вхождения)
  const analyzeSubfactorsByTerms = (
    metadataList: any[],
    termsMap: Map<number, PublicationTerms>,
    allPublicationIds: number[]
  ) => {
    console.log('=== DEBUG: analyzeSubfactorsByTerms ===');
    console.log('Всего публикаций:', allPublicationIds.length);
    
    const allTopicsData: { [topic: string]: number } = {};
    const yearData: { [year: number]: { [topic: string]: number } } = {};
    const yearPublicationCount: { [year: number]: number } = {};
    
    for (let i = 0; i < allPublicationIds.length; i++) {
      const publId = allPublicationIds[i];
      const metadata = metadataList[i];
      const terms = termsMap.get(publId);

      if (!metadata || !terms) continue;

      const year = metadata['Publication year'];
      yearPublicationCount[year] = (yearPublicationCount[year] || 0) + 1;
      
      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [topic, count] of Object.entries(terms.subfactors)) {
        // Исключаем факторы (они не должны быть в подфакторах)
        if (FACTORS_LIST.includes(topic)) continue;

        const topicCount = count as number;
        allTopicsData[topic] = (allTopicsData[topic] || 0) + topicCount;
        yearData[year][topic] = (yearData[year][topic] || 0) + topicCount;
      }
    }    
    console.log('Результаты analyzeSubfactorsByTerms:');
    console.log('- Уникальных тем:', Object.keys(allTopicsData).length);
    console.log('- Топ-10 тем:', Object.entries(allTopicsData).sort(([, a], [, b]) => b - a).slice(0, 10));

    return { allTopicsData, yearData, yearPublicationCount };
  };

  // 3. Термины (вхождения)
  const analyzeTermsOccurrences = (
    metadataList: any[],
    termsMap: Map<number, PublicationTerms>,
    allPublicationIds: number[]
  ) => {
    console.log('=== DEBUG: analyzeTermsOccurrences ===');
    console.log('Всего публикаций:', allPublicationIds.length);    
    
    const termStats: { [term: string]: number } = {};
    const yearData: { [year: number]: { [term: string]: number } } = {};
    const yearPublicationCount: { [year: number]: number } = {};
    
    const excludedTerms = new Set([
      ...FACTORS_LIST.map(f => f.toLowerCase()),
      ...SUBFACTORS_LIST.map(s => s.toLowerCase())
    ]);
    
    console.log('=== ИСКЛЮЧАЕМЫЕ ТЕРМИНЫ (кроме общенаучных, они уже отфильтрованы) ===');
    console.log('Количество исключаемых терминов:', excludedTerms.size);
    
    let totalTermsFound = 0;
    let excludedTermsCount = 0;
    
    for (let i = 0; i < allPublicationIds.length; i++) {
      const publId = allPublicationIds[i];
      const metadata = metadataList[i];
      const terms = termsMap.get(publId);

      if (!metadata || !terms || typeof terms.terms !== 'object') continue;

      const year = metadata['Publication year'];
      yearPublicationCount[year] = (yearPublicationCount[year] || 0) + 1;
      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [term, count] of Object.entries(terms.terms)) {
        totalTermsFound++;        
        
        const termLower = term.toLowerCase();        
        
        // Исключаем факторы и подфакторы из списка терминов
        if (excludedTerms.has(termLower)) {
          excludedTermsCount++;
          continue;
        }        
        
        const termCount = count as number;
        termStats[term] = (termStats[term] || 0) + termCount;
        yearData[year][term] = (yearData[year][term] || 0) + termCount;
      }
    }   
    
    console.log('=== СТАТИСТИКА ОБРАБОТКИ ===');
    console.log(`Всего терминов обработано: ${totalTermsFound}`);
    console.log(`Исключено терминов (факторы/подфакторы): ${excludedTermsCount}`);
    console.log(`Осталось чистых терминов: ${Object.keys(termStats).length}`);    
    
    console.log(`=== ВСЕ НАЙДЕННЫЕ ЧИСТЫЕ ТЕРМИНЫ ===`);
    const allTermsSorted = Object.entries(termStats)
      .sort(([, a], [, b]) => b - a);    
    
    console.log(`Всего уникальных чистых терминов: ${allTermsSorted.length}`);
    console.log(`ТОП-50 всех чистых терминов по вхождениям:`);
    allTermsSorted.slice(0, 50).forEach(([term, count], idx) => {
      console.log(`${idx + 1}. "${term}": ${count} вхождений`);
    });    
    
    return { allTopicsData: termStats, yearData, yearPublicationCount };
  };
  
  // 4. Факторы (публикации)
  const analyzeFactorsByPublications = (
    metadataList: any[],
    termsMap: Map<number, PublicationTerms>,
    allPublicationIds: number[]
  ) => {
    console.log('=== DEBUG: analyzeFactorsByPublications ===');
    
    const topicPublications: { [topic: string]: number } = {};
    const yearTopicPublications: { [year: number]: { [topic: string]: number } } = {};
    const yearTotalPublications: { [year: number]: number } = {};
    
    for (let i = 0; i < allPublicationIds.length; i++) {
      const publId = allPublicationIds[i];
      const metadata = metadataList[i];
      const terms = termsMap.get(publId);

      if (!metadata || !terms) continue;

      const year = metadata['Publication year'];
      yearTotalPublications[year] = (yearTotalPublications[year] || 0) + 1;

      if (!yearTopicPublications[year]) {
        yearTopicPublications[year] = {};
      }

      const filteredTopics = Object.entries(terms.factors);
      
      if (filteredTopics.length === 0) continue;
      
      const maxCount = Math.max(...filteredTopics.map(([, count]) => count as number));      
      const topTopicsForPublication = filteredTopics
        .filter(([, count]) => count === maxCount)
        .map(([topic]) => topic);
      
      topTopicsForPublication.forEach(topic => {
        topicPublications[topic] = (topicPublications[topic] || 0) + 1;
        yearTopicPublications[year][topic] = (yearTopicPublications[year][topic] || 0) + 1;
      });
    }    
    
    console.log('Результаты analyzeFactorsByPublications:');
    console.log('- Уникальных тем:', Object.keys(topicPublications).length);
    console.log('- Топ-10 тем по публикациям:', Object.entries(topicPublications).sort(([, a], [, b]) => b - a).slice(0, 10));
    
    return { 
      topicPublications, 
      yearTopicPublications, 
      yearTotalPublications
    };
  };
  
  // 5. Подфакторы (публикации)
  const analyzeSubfactorsByPublications = (
    metadataList: any[],
    termsMap: Map<number, PublicationTerms>,
    allPublicationIds: number[]
  ) => {
    console.log('=== DEBUG: analyzeSubfactorsByPublications ===');   
    
    const topicPublications: { [topic: string]: number } = {};
    const yearTopicPublications: { [year: number]: { [topic: string]: number } } = {};
    const yearTotalPublications: { [year: number]: number } = {};
    
    for (let i = 0; i < allPublicationIds.length; i++) {
      const publId = allPublicationIds[i];
      const metadata = metadataList[i];
      const terms = termsMap.get(publId);
      
      if (!metadata || !terms) continue;
      
      const year = metadata['Publication year'];
      yearTotalPublications[year] = (yearTotalPublications[year] || 0) + 1;
      
      if (!yearTopicPublications[year]) {
        yearTopicPublications[year] = {};
      }
      
      const filteredTopics = Object.entries(terms.subfactors)
        .filter(([topic]) => !FACTORS_LIST.includes(topic));
      
      if (filteredTopics.length === 0) continue;
      
      const maxCount = Math.max(...filteredTopics.map(([, count]) => count as number));      
      const topTopicsForPublication = filteredTopics
        .filter(([, count]) => count === maxCount)
        .map(([topic]) => topic);
      
      topTopicsForPublication.forEach(topic => {
        topicPublications[topic] = (topicPublications[topic] || 0) + 1;
        yearTopicPublications[year][topic] = (yearTopicPublications[year][topic] || 0) + 1;
      });
    }    
    
    console.log('Результаты analyzeSubfactorsByPublications:');
    console.log('- Уникальных тем:', Object.keys(topicPublications).length);
    console.log('- Топ-10 тем по публикациям:', Object.entries(topicPublications).sort(([, a], [, b]) => b - a).slice(0, 10));
    
    return { 
      topicPublications, 
      yearTopicPublications, 
      yearTotalPublications
    };
  };
  
  // 6. Уникальные термины на публикацию
  const analyzeUniqueTermsPerPublication = (
    metadataList: any[],
    termsMap: Map<number, PublicationTerms>,
    allPublicationIds: number[]
  ) => {
    console.log('=== DEBUG: analyzeUniqueTermsPerPublication ===');
    console.log('Всего публикаций:', allPublicationIds.length);    
    
    const termStats: { [term: string]: number } = {};
    const yearData: { [year: number]: { [term: string]: number } } = {};
    
    const excludedTerms = new Set([
      ...FACTORS_LIST.map(f => f.toLowerCase()),
      ...SUBFACTORS_LIST.map(s => s.toLowerCase())
    ]);
    
    console.log('=== ИСКЛЮЧАЕМЫЕ ТЕРМИНЫ (кроме общенаучных, они уже отфильтрованы) ===');
    console.log('Количество исключаемых терминов:', excludedTerms.size);
    
    let totalTermsFound = 0;
    let excludedTermsCount = 0;
    
    for (let i = 0; i < allPublicationIds.length; i++) {
      const publId = allPublicationIds[i];
      const metadata = metadataList[i];
      const terms = termsMap.get(publId);
      
      if (!metadata || !terms || typeof terms.terms !== 'object') continue;
      
      const year = metadata['Publication year'];
      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [term, count] of Object.entries(terms.terms)) {
        totalTermsFound++;        
        
        const termLower = term.toLowerCase();        
        
        if (excludedTerms.has(termLower)) {
          excludedTermsCount++;
          continue;
        }        
        
        if (count as number > 0) {
          termStats[term] = (termStats[term] || 0) + 1;
          yearData[year][term] = (yearData[year][term] || 0) + 1;
        }
      }
    } 



    console.log('=== СТАТИСТИКА ОБРАБОТКИ ===');
    console.log(`Всего терминов обработано: ${totalTermsFound}`);
    console.log(`Исключено терминов (факторы/подфакторы): ${excludedTermsCount}`);
    console.log(`Осталось чистых терминов: ${Object.keys(termStats).length}`);   
    
    console.log(`=== ВСЕ НАЙДЕННЫЕ ЧИСТЫЕ ТЕРМИНЫ ===`);
    const allTermsSorted = Object.entries(termStats)
      .sort(([, a], [, b]) => b - a);    
    
    console.log(`Всего уникальных чистых терминов: ${allTermsSorted.length}`);
    console.log(`ТОП-50 всех чистых терминов:`);
    allTermsSorted.slice(0, 50).forEach(([term, count], idx) => {
      console.log(`${idx + 1}. "${term}": ${count} публикаций`);
    });    
    
    return { allTopicsData: termStats, yearData };
  };
  
  useEffect(() => {
    const fetchTopTopicsData = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);
        console.log(`=== НАЧАЛО ЗАГРУЗКИ ===`);
        console.log(`Сущность: ${entityType} ID: ${entityId}, режим: ${analysisMode}`);        
        
        const allPublicationIds = await getPublicationIds(entityType, entityId);
        console.log('Всего публикаций:', allPublicationIds.length);        
        
        if (!allPublicationIds || allPublicationIds.length === 0) {
          console.log('Нет публикаций для анализа');
          setData([]);
          setTopTopics([]);
          setPublicationCount(0);
          setLoading(false);
          return;
        }        
        
        setPublicationCount(allPublicationIds.length);
        
        const metadataList = allPublicationIds.map(id => {
          const cacheKey = `publs_metadata:${JSON.stringify({ id_publ: id.toString() })}`;
          return apiCache.get(cacheKey) || { 'Publication year': 0 };
        });
        console.log('Загружено метаданных:', metadataList.length);        
        
        console.log(`Загружаем факторы, подфакторы и термины для ${allPublicationIds.length} публикаций...`);
        const termsMap = await fetchPublicationTerms(allPublicationIds);
        console.log('Загружено данных:', termsMap.size);
        
        let allTopicsData: { [topic: string]: number } = {};
        let yearData: { [year: number]: { [topic: string]: number } } = {};
        let publicationCountsData: { [year: number]: { [topic: string]: number } } = {};
        let totalPublicationsData: { [year: number]: number } = {};
        
        console.log(`Выполняем анализ: ${analysisMode}`);
        
        switch (analysisMode) {
          case 'factors_terms':
            const result1 = analyzeFactorsByTerms(metadataList, termsMap, allPublicationIds);
            allTopicsData = result1.allTopicsData;
            yearData = result1.yearData;
            totalPublicationsData = result1.yearPublicationCount;
            break;            
          case 'subfactors_terms':
            const result2 = analyzeSubfactorsByTerms(metadataList, termsMap, allPublicationIds);
            allTopicsData = result2.allTopicsData;
            yearData = result2.yearData;
            totalPublicationsData = result2.yearPublicationCount;
            break;            
          case 'terms_occurrences':
            const result3 = analyzeTermsOccurrences(metadataList, termsMap, allPublicationIds);
            allTopicsData = result3.allTopicsData;
            yearData = result3.yearData;
            totalPublicationsData = result3.yearPublicationCount;
            break;            
          case 'factors_publs':
            const result4 = analyzeFactorsByPublications(metadataList, termsMap, allPublicationIds);
            allTopicsData = result4.topicPublications;
            yearData = result4.yearTopicPublications;
            publicationCountsData = result4.yearTopicPublications;
            totalPublicationsData = result4.yearTotalPublications;
            break;            
          case 'subfactors_publs':
            const result5 = analyzeSubfactorsByPublications(metadataList, termsMap, allPublicationIds);
            allTopicsData = result5.topicPublications;
            yearData = result5.yearTopicPublications;
            publicationCountsData = result5.yearTopicPublications;
            totalPublicationsData = result5.yearTotalPublications;
            break;            
          case 'unique_terms_publs':
            const result6 = analyzeUniqueTermsPerPublication(metadataList, termsMap, allPublicationIds);
            allTopicsData = result6.allTopicsData;
            yearData = result6.yearData;
            break;
        }        
        
        console.log('=== РЕЗУЛЬТАТЫ АНАЛИЗА ===');
        console.log('- Найдено уникальных тем/терминов (без общенаучных):', Object.keys(allTopicsData).length);
        console.log('- Примеры тем/терминов:', Object.entries(allTopicsData).slice(0, 10));        
        
        const sortedTopics = Object.entries(allTopicsData)
          .sort(([, a], [, b]) => b - a)
          .slice(0, Math.min(limit, Object.keys(allTopicsData).length))
          .map(([topic]) => topic);        
        
        console.log(`Топ-${sortedTopics.length} тем/терминов:`, sortedTopics);
        setTopTopics(sortedTopics);        
        
        const allYears = Object.keys(yearData)
          .map(y => parseInt(y))
          .filter(y => !isNaN(y))
          .sort((a, b) => a - b);        
        
        console.log('Все года:', allYears);        
        
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
        setData(transformedData);
        console.log('=== ЗАВЕРШЕНИЕ ЗАГРУЗКИ ===');
      } catch (err) {
        console.error('Ошибка:', err);
        setError(`Ошибка загрузки: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };    
    
    if (entityId) {
      fetchTopTopicsData();
    }
  }, [entityType, entityId, limit, analysisMode]);  
  
  return { data, loading, error, topTopics, publicationCount, progress };
};

// ========== MAIN COMPONENT ==========
const entityLabels: Record<EntityType, { singular: string; defaultName: string; plural: string }> = {
  authors: { singular: 'автора', defaultName: 'Автор', plural: 'Авторы' },
  journals: { singular: 'журнала', defaultName: 'Журнал', plural: 'Журналы' },
  conferences: { singular: 'конференции', defaultName: 'Конференция', plural: 'Конференции' },
  organizations: { singular: 'организации', defaultName: 'Организация', plural: 'Организации' },
  cities: { singular: 'города', defaultName: 'Город', plural: 'Города' },
};

interface InsightsOnePageProps {
  entitiesResponse?: ApiResponse<Author[]>;
  entityType?: EntityType;
}

type TabType = 'evolution' | 'statistics' | 'forecast';

const InsightsOnePage: React.FC<InsightsOnePageProps> = ({ entitiesResponse, entityType = 'authors' }) => {
  const router = useRouter();
  const { entity: routerEntity, ids } = router.query;
  const finalEntityType = (routerEntity as EntityType) || entityType;  
  
  const entityId = useMemo(() => {
    if (!ids) return '';
    return Array.isArray(ids) ? ids[0] : ids;
  }, [ids]);  
  
  const [activeTab, setActiveTab] = useState<TabType>('evolution');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('factors_terms');
  const [showAlgorithm, setShowAlgorithm] = useState(false);  
  
  const {
    data: evolutionData,
    loading: evolutionLoading,
    error: evolutionError,
    topTopics,
    publicationCount,
    progress
  } = useTopTopicsData(finalEntityType, entityId, 5, analysisMode);  
  
  const labels = entityLabels[finalEntityType];  
  
  const entityName = useMemo(() => {
    if (!entityId || !entitiesResponse?.data || entitiesResponse.data.length === 0) {
      return labels.defaultName;
    }
    const normalizedEntityId = String(entityId);
    let entity = entitiesResponse.data.find(a =>
      String(a.id) === normalizedEntityId ||
      Number(a.id) === Number(entityId) ||
      a.id === entityId
    );
    return entity?.value || labels.defaultName;
  }, [entityId, entitiesResponse?.data, labels.defaultName]);  
  
  const colors = ['#807c7c', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'];
  const displayTopics = topTopics;  
const [data1, setData1] = useState<[number, number][]>([]);
const [isLoading1, setIsLoading1] = useState(false);
const [error1, setError1] = useState<string | null>(null);
const [publicationsByYear, setPublicationsByYear] = useState<Record<number, number>>({}); // 👈 Добавлено состояние

useEffect(() => {
  const fetchData = async () => {
    setIsLoading1(true);
    setError1(null);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ids = urlParams.get('ids');
      const entity = urlParams.get('entity');
      
      if (entity !== 'authors' || !ids) {
        throw new Error('Неверные параметры URL');
      }
      
      const authorId = ids.split(',')[0];
      
      const response = await fetch(
        `http://193.232.208.58:9002/grapher/get_author_publications?auth_prnd_id=${authorId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: [number, number][] = await response.json();
      console.log("result:", result);
      setData1(result);
      
      // Суммируем публикации по годам
      const yearCounts: Record<number, number> = {};
      result.forEach(([_, year]) => {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      });
      
      console.log("Publications by year:", yearCounts);
      setPublicationsByYear(yearCounts); // 👈 Устанавливаем значение
      
    } catch (err) {
      setError1(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading1(false);
    }
  };

  fetchData();
}, []);
  
const getChartData = useMemo(() => {
  if (!evolutionData.length || !displayTopics.length) return [];    

  return evolutionData.map(item => {
    const flatData: any = { year: item.year };

    displayTopics.forEach(topic => {
      flatData[`topics.${topic}`] = item.topics[topic] || 0;

      if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
        flatData[`counts.${topic}`] = item.publicationCounts?.[topic] || 0;
      }
    });

    // 👇 подставляем реальное количество публикаций для каждого года
    flatData.totalPublications = publicationsByYear[item.year] || 0;

    return flatData;
  });
}, [evolutionData, displayTopics, analysisMode, publicationsByYear]);

console.log("getChartData: ", getChartData);

const filteredChartData = useMemo(() => {
  if (selectedTopicIndex === null) return getChartData;

  return getChartData.map(item => {
    const filteredItem: any = { year: item.year };
    const topicName = displayTopics[selectedTopicIndex-1];

    // сохраняем выбранный топик
    filteredItem[`topics.${topicName}`] = item[`topics.${topicName}`] || 0;

    // 👇 сохраняем поле totalPublications всегда, чтобы Bar рисовался
    filteredItem.totalPublications = item.totalPublications || 0;

    // если используешь counts по другим условиям
    if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
      filteredItem[`counts.${topicName}`] = item[`counts.${topicName}`] || 0;
    }

    return filteredItem;
  });
}, [getChartData, selectedTopicIndex, displayTopics, analysisMode]);

console.log("filteredChartData: ", filteredChartData);
  
  const getFilteredColors = useMemo(() => {
    if (selectedTopicIndex === null) return colors;
    return colors.map((color, index) =>
      index === selectedTopicIndex ? color : `${color}20`
    );
  }, [selectedTopicIndex]);  
  
  const handleLegendClick = (index: number) => {
    setSelectedTopicIndex(selectedTopicIndex === index ? null : index);
  };  
  
  const handleBackToSelection = () => {
    router.push(`/insights/select?entity=${finalEntityType}`);
  };    
  
  const handleModeChange = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    setSelectedTopicIndex(null);
    setShowAlgorithm(false);
  };  
  
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const year = payload[0].payload.year;
      const yearData = evolutionData.find(d => d.year === year);
      if (!yearData) return null;      
      
      if (analysisMode === 'factors_publs' || analysisMode === 'subfactors_publs') {
        const totalPubs = yearData.totalPublications || 0;        
        if (selectedTopicIndex !== null) {
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
                Год: {year} ({totalPubs} публ)
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
      case 'factors_terms': return 'вхожд';
      case 'subfactors_terms': return 'вхожд';
      case 'terms_occurrences': return 'вхожд';
      case 'factors_publs': return 'публ';
      case 'subfactors_publs': return 'публ';
      case 'unique_terms_publs': return 'публ';
      default: return '';
    }
  };
  
  const getModeDescription = (mode: AnalysisMode) => {
    switch (mode) {
      case 'factors_terms': return 'Сумма вхождений факторов в публикациях за год';
      case 'subfactors_terms': return 'Сумма вхождений подфакторов в публикациях за год';
      case 'terms_occurrences': return 'Общее количество вхождений терминов в публикациях за год';
      case 'factors_publs': return 'Процент публикаций, где фактор является доминирующим';
      case 'subfactors_publs': return 'Процент публикаций, где подфактор является доминирующим';
      case 'unique_terms_publs': return 'В скольких публикациях встречается термин (уникальные вхождения)';
      default: return '';
    }
  };
  
  const getAlgorithmDescription = (mode: AnalysisMode) => {
    switch (mode) {
      case 'factors_terms':
        return `1. Для каждой публикации получаем метаданные и факторы (level=1)
2. Извлекаем год публикации
3. Исключаем общенаучные термины
4. Для каждого фактора:
   - Суммируем количество вхождений фактора в публикации
   - Добавляем к общему счетчику для фактора
5. Сортируем факторы по убыванию суммарных вхождений
6. Выбираем топ-5 факторов
7. Формируем данные для графика: год - {фактор: сумма вхождений}`;
      
      case 'subfactors_terms':
        return `1. Для каждой публикации получаем метаданные и подфакторы (level=2)
2. Извлекаем год публикации
3. Исключаем общенаучные термины и факторы
4. Для каждого подфактора суммируем количество вхождений подфактора
5. Сортируем подфакторы по убыванию суммарных вхождений
6. Выбираем топ-5 подфакторов
7. Формируем данные для графика: год - {подфактор: сумма вхождений}`;
      
      case 'terms_occurrences':
        return `1. Для каждой публикации получаем метаданные и термины (level=3)
2. Извлекаем год публикации
3. Исключаем общенаучные термины, факторы и подфакторы
4. Для каждого чистого термина суммируем количество вхождений
5. Сортируем чистые термины по количеству вхождений
6. Выбираем топ-5 чистых терминов
7. Формируем данные для графика: год - {термин: сумма вхождений}`;
      
      case 'factors_publs':
        return `1. Для каждой публикации получаем метаданные и факторы (level=1)
2. Извлекаем год публикации
3. Исключаем общенаучные термины
4. Находим максимальное значение среди всех факторов в публикации
5. Определяем все факторы с этим максимальным значением (доминирующие)
6. Для каждого доминирующего фактора учитываем публикацию
7. Сортируем факторы по количеству публикаций, где они доминируют
8. Выбираем топ-5 факторов
9. Формируем данные для графика: год - {фактор: % публикаций}`;
      
      case 'subfactors_publs':
        return `1. Для каждой публикации получаем метаданные и подфакторы (level=2)
2. Извлекаем год публикации
3. Исключаем общенаучные термины и факторы
4. Находим максимальное значение среди подфакторов
5. Определяем доминирующие подфакторы
6. Для каждого доминирующего подфактора учитываем публикацию
7. Сортируем подфакторы по количеству публикаций, где они доминируют
8. Выбираем топ-5 подфакторов
9. Формируем данные для графика: год - {подфактор: % публикаций}`;
      
      case 'unique_terms_publs':
        return `1. Для каждой публикации получаем метаданные и термины (level=3)
2. Извлекаем год публикации
3. Исключаем общенаучные термины, факторы и подфакторы
4. Для каждого чистого термина увеличиваем счетчик публикаций с термином
5. Сортируем чистые термины по количеству публикаций
6. Выбираем топ-5 чистых терминов
7. Формируем данные для графика: год - {термин: кол-во публикаций}`;
      
      default: return '';
    }
  };  
  
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    if (!payload || payload.length === 0) return null;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 1,
        paddingLeft: '20px',
        paddingRight: '10px'
      }}>
        {payload.map((entry: any, index: number) => {
          const isSelected = selectedTopicIndex === index;
          const isSemiTransparent = selectedTopicIndex !== null && selectedTopicIndex !== index;
          const topicName = entry.value.replace('topics.', '');
          
          return (
            <Box
              key={`legend-item-${index}`}
              onClick={() => handleLegendClick(index)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'rgba(27,69,150,0.06)' : 'transparent',
                border: isSelected ? '1px solid #1b4596' : '1px solid transparent',
                opacity: isSemiTransparent ? 0.4 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isSelected ? 'rgba(27,69,150,0.1)' : 'rgba(27,69,150,0.04)',
                }
              }}
            >
              <Box sx={{ 
                width: '4px', 
                height: '24px', 
                borderRadius: '1px', 
                backgroundColor: getFilteredColors[index],
                opacity: isSemiTransparent ? 0.5 : 1,
                flexShrink: 0
              }} />
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isSemiTransparent ? '#999' : '#656565',
                  fontSize: '14px',
                  fontWeight: isSelected ? 600 : 400,
                  lineHeight: 1.3,
                  flex: 1,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {topicName}
              </Typography>
              
              {isSelected && (
                <Box sx={{ flexShrink: 0, ml: 0.5 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1b4596">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
                  </svg>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };  
  
  return (
    <>
      <Head>
        <title>Эволюция тематических интересов - {entityName}</title>
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
              {/* 6 КНОПОК РЕЖИМОВ АНАЛИЗА В НОВОМ ПОРЯДКЕ */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '8px',
                mt: 1,
                flexWrap: 'wrap'
              }}>
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
              </Box>
              
              {evolutionLoading && publicationCount > 0 && (
                <Card sx={{ 
                  bgcolor: '#FFFFFF', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                  mb: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Загрузка данных ({getModeLabel(analysisMode)})...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {progress}%
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
                            width: `${progress}%`,
                            transition: 'width 0.3s ease',
                            borderRadius: 4
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#656565' }}>
                        Анализируем {publicationCount} публикаций
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}              
              
              <Card
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
                  p: 3
                }}
              >
                <CardContent sx={{ p: 0, position: 'relative' }}>
                  {evolutionLoading && publicationCount === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="500px">
                      <CircularProgress />
                    </Box>
                  ) : evolutionError ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="500px">
                      <Typography color="error">{evolutionError}</Typography>
                    </Box>
                  ) : evolutionData.length === 0 || displayTopics.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="500px" flexDirection="column" gap={2}>
                      <Typography variant="h6" color="text.secondary">
                        Нет данных для отображения
                      </Typography>
                      <Typography variant="body2" color="text-secondary">
                        {getModeDescription(analysisMode)}
                      </Typography>
                      {(analysisMode === 'unique_terms_publs' || analysisMode === 'terms_occurrences') && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Проверьте консоль браузера для подробной информации о найденных терминах
                        </Typography>
                      )}
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
                      <Box sx={{ width: '100%', height: '500px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={selectedTopicIndex === null ? getChartData : filteredChartData}>
                            <defs>
                              {displayTopics.map((topic, index) => (
                                <linearGradient key={topic} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={getFilteredColors[index]} stopOpacity={selectedTopicIndex === null || selectedTopicIndex === index ? 0.8 : 0.2} />
                                  <stop offset="95%" stopColor={getFilteredColors[index]} stopOpacity={selectedTopicIndex === null || selectedTopicIndex === index ? 0.1 : 0.05} />
                                </linearGradient>
                              ))}
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                            <XAxis dataKey="year" stroke="#1b4596" tick={{ fill: '#1b4596', fontWeight: 600 }} style={{ fontSize: '14px', fontWeight: 600 }} />
                            <YAxis stroke="#656565" style={{ fontSize: '12px' }} />

                            <Tooltip content={renderCustomTooltip} />

                            <Legend content={renderCustomLegend} />

                            {/* 👇 добавляем столбик */}
                            <Bar
                              dataKey="totalPublications"
                              fill="#90A4AE"
                              barSize={20}
                              name="всего публикаций" // будет в легенде
                            />

                            {/* 👇 оставляем твои Area */}
                            {displayTopics.map((topic, index) => (
                              <Area
                                key={topic}
                                type="monotone"
                                dataKey={`topics.${topic}`}
                                stroke={getFilteredColors[index]}
                                strokeWidth={selectedTopicIndex === null || selectedTopicIndex === index ? 2 : 1}
                                fill={`url(#color${index})`}
                                stackId="1"
                                activeDot={{ r: 6, fill: getFilteredColors[index] }}
                              />
                            ))}
                          </ComposedChart>
                        </ResponsiveContainer>

                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </>
          )}          
          
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
          
          <Card
            sx={{
              bgcolor: '#F5F5F6',
              borderRadius: '16px',
              boxShadow: '0 4px 32px rgba(0,34,102,0.15)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {finalEntityType === 'authors' ? (
                <Typography
                  variant="h6"
                  sx={{
                    color: '#1b4596',
                    fontWeight: 600,
                    mb: 1,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => {
                    if (entityId) {
                      window.open(`/authors/author?creature_id=${entityId}`, '_blank');
                    }
                  }}
                >
                  {labels.defaultName}: {entityName}
                </Typography>
              ) : (
                <Typography variant="h6" sx={{ color: '#1b4596', fontWeight: 600, mb: 1 }}>
                  {labels.defaultName}: {entityName}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                {publicationCount > 0 && (
                  <Typography variant="body2" sx={{ color: '#656565', fontWeight: 500 }}>
                    Проанализировано публикаций: <strong>{publicationCount}</strong>
                  </Typography>
                )}
                {evolutionData.length > 0 && (
                  <Typography variant="body2" sx={{ color: '#656565', fontWeight: 500 }}>
                    Охвачено лет: <strong>{evolutionData.length}</strong>
                    {evolutionData.length >= 2 && (
                      ` (${evolutionData[0].year} - ${evolutionData[evolutionData.length - 1].year})`
                    )}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
          
          {activeTab === 'evolution' && !evolutionLoading && evolutionData.length > 0 && displayTopics.length > 0 && (
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
                    Алгоритм анализа: {analysisMode === 'unique_terms_publs' ? 'Термины (публикации)' : 
                      analysisMode === 'terms_occurrences' ? 'Термины (вхождения)' : 
                      analysisMode === 'factors_terms' ? 'Факторы (вхождения)' :
                      analysisMode === 'subfactors_terms' ? 'Подфакторы (вхождения)' :
                      analysisMode === 'factors_publs' ? 'Факторы (публикации)' :
                      'Подфакторы (публикации)'}
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
          
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '-20px',
            marginLeft: '8px',
            marginRight: '8px'
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

export default InsightsOnePage;