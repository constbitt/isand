// src/hooks/useAllAnalysisData.ts
import { useState, useEffect } from 'react';

interface TopicYearData {
  year: number;
  topics: { [topic: string]: number };
  terms: { [topic: string]: number };
  publicationCounts?: { [topic: string]: number };
  totalPublications?: number;
}

type AnalysisMode = 'factors_terms' | 'subfactors_terms' | 'factors_publs' | 'subfactors_publs' | 'unique_terms_publs' | 'terms_occurrences';

const COMMON_TERMS = [
  'Общенаучные термины',
  'общенаучные термины',
  'General scientific terms',
  'general scientific terms',
];

const filterOutCommonTerms = <T extends Record<string, number>>(obj: T): T => {
  const filtered = {} as T;
  const isCommon = (k: string) => COMMON_TERMS.some((c) => c.toLowerCase() === k.toLowerCase());
  for (const [key, value] of Object.entries(obj)) {
    if (!isCommon(key)) (filtered as Record<string, number>)[key] = value as number;
  }
  return filtered;
};

// Факторы и подфакторы из one.tsx (упрощённая версия)
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

export const useAllAnalysisData = (authorId: string) => {
  const [data, setData] = useState<{ [key in AnalysisMode]?: {
    chartData: TopicYearData[];
    topTopics: string[];
    allYears: number[];
    publicationCount: number;
  } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const createCache = () => {
    const cache = new Map<string, { data: any; timestamp: number }>();
    const CACHE_DURATION = 5 * 60 * 1000;
    
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

  const fetchViaProxy = async (endpoint: string, params: Record<string, string> = {}) => {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const searchParams = new URLSearchParams({ endpoint, ...params }).toString();
    const url = `/api/proxy?${searchParams}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      apiCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Ошибка при запросе ${endpoint}:`, error);
      throw error;
    }
  };

  const getPublicationsWithYears = async (): Promise<{ ids: number[]; metadataList: { 'Publication year': number }[] }> => {
    const publications = await fetchViaProxy('authors_publs', { auth_prnd_id: authorId, id_author: authorId });
    if (!Array.isArray(publications)) return { ids: [], metadataList: [] };
    const currentYear = new Date().getFullYear();
    // Формат [[id, year], [id, year], ...] как в one.tsx
    if (publications.length > 0 && Array.isArray(publications[0])) {
      const pairs = publications as [number, number][];
      return {
        ids: pairs.map((p) => p[0]),
        metadataList: pairs.map((p) => ({ 'Publication year': p[1] || currentYear })),
      };
    }
    // Формат [{id, year}, ...]
    if (publications.length > 0 && typeof publications[0] === 'object' && publications[0] !== null && !Array.isArray(publications[0])) {
      const objs = publications as Array<{ id?: number; year?: number }>;
      return {
        ids: objs.map((o) => Number(o.id ?? 0)),
        metadataList: objs.map((o) => ({ 'Publication year': Number(o.year) || currentYear })),
      };
    }
    const ids = publications as number[];
    return { ids, metadataList: ids.map(() => ({ 'Publication year': currentYear })) };
  };

  const getPublicationMetadata = async (publId: number) => {
    // В proxy.js нет эндпоинта для метаданных, используем данные из публикаций
    // Временно возвращаем объект с годом из публикации или текущим годом
    return { 'Publication year': new Date().getFullYear() };
  };

  const fetchDataBatch = async (publicationIds: number[], level: 1 | 2 | 3) => {
    const batchSize = 10; // Уменьшаем размер батча для надёжности
    const batches = [];
    
    for (let i = 0; i < publicationIds.length; i += batchSize) {
      const batch = publicationIds.slice(i, i + batchSize);
      batches.push(batch);
    }

    const allData: any[] = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchPromises = batch.map(async (publId) => {
        try {
          // Используем правильный эндпоинт из proxy.js для get_publication_terms
          const response = await fetchViaProxy('get_publication_terms', {
            id_publ: publId.toString()
          });
          
          // Извлекаем нужный уровень и фильтруем общенаучные термины (как в one.tsx)
          if (response) {
            const raw =
              level === 1 ? (response.factors || {}) : level === 2 ? (response.subfactors || {}) : (response.terms || {});
            return filterOutCommonTerms(typeof raw === 'object' ? raw : {});
          }
          return {};
        } catch (err) {
          console.error(`Ошибка данных ${publId} (level ${level}):`, err);
          return {};
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      allData.push(...batchResults);
      
      // Обновляем прогресс
      const levelProgress = level === 1 ? 20 : level === 2 ? 40 : 60;
      setProgress(levelProgress + Math.round(((i + 1) / batches.length) * 20));
    }
    
    return allData;
  };

  // Алгоритмы анализа из one.tsx
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

      // Используем текущий год, если нет метаданных
      const year = metadata['Publication year'] || new Date().getFullYear();
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

    const sortedTopics = Object.entries(allTopicsData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    const years = Object.keys(yearData).map(y => parseInt(y.toString())).filter(y => !isNaN(y)).sort((a, b) => a - b);
    
    const chartData = years.map(year => ({
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

    return { chartData, topTopics: sortedTopics, allYears: years, yearPublicationCount };
  };

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

      const year = metadata['Publication year'] || new Date().getFullYear();
      yearPublicationCount[year] = (yearPublicationCount[year] || 0) + 1;

      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [topic, count] of Object.entries(topics)) {
        if (topic === 'Общенаучные термины') continue;
        if (FACTORS_LIST.includes(topic)) continue;

        const topicCount = count as number;
        allTopicsData[topic] = (allTopicsData[topic] || 0) + topicCount;
        yearData[year][topic] = (yearData[year][topic] || 0) + topicCount;
      }
    }

    const sortedTopics = Object.entries(allTopicsData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    const years = Object.keys(yearData).map(y => parseInt(y.toString())).filter(y => !isNaN(y)).sort((a, b) => a - b);
    
    const chartData = years.map(year => ({
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

    return { chartData, topTopics: sortedTopics, allYears: years, yearPublicationCount };
  };

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

      const year = metadata['Publication year'] || new Date().getFullYear();
      yearTotalPublications[year] = (yearTotalPublications[year] || 0) + 1;

      if (!yearTopicPublications[year]) {
        yearTopicPublications[year] = {};
      }

      const filteredTopics = Object.entries(topics)
        .filter(([topic, count]) => topic !== 'Общенаучные термины');

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

    const sortedTopics = Object.entries(topicPublications)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    const years = Object.keys(yearTopicPublications).map(y => parseInt(y.toString())).filter(y => !isNaN(y)).sort((a, b) => a - b);
    
    const chartData = years.map(year => ({
      year,
      topics: sortedTopics.reduce((acc, topic) => {
        acc[topic] = yearTopicPublications[year]?.[topic] || 0;
        return acc;
      }, {} as { [topic: string]: number }),
      terms: sortedTopics.reduce((acc, topic) => {
        acc[topic] = yearTopicPublications[year]?.[topic] || 0;
        return acc;
      }, {} as { [topic: string]: number }),
      publicationCounts: sortedTopics.reduce((acc, topic) => {
        acc[topic] = yearTopicPublications[year]?.[topic] || 0;
        return acc;
      }, {} as { [topic: string]: number }),
      totalPublications: yearTotalPublications[year] || 0,
    }));

    return { chartData, topTopics: sortedTopics, allYears: years };
  };

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

      const year = metadata['Publication year'] || new Date().getFullYear();
      yearTotalPublications[year] = (yearTotalPublications[year] || 0) + 1;

      if (!yearTopicPublications[year]) {
        yearTopicPublications[year] = {};
      }

      const filteredTopics = Object.entries(topics)
        .filter(([topic, count]) => {
          if (topic === 'Общенаучные термины') return false;
          if (FACTORS_LIST.includes(topic)) return false;
          return true;
        });

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

    const sortedTopics = Object.entries(topicPublications)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    const years = Object.keys(yearTopicPublications).map(y => parseInt(y.toString())).filter(y => !isNaN(y)).sort((a, b) => a - b);
    
    const chartData = years.map(year => ({
      year,
      topics: sortedTopics.reduce((acc, topic) => {
        acc[topic] = yearTopicPublications[year]?.[topic] || 0;
        return acc;
      }, {} as { [topic: string]: number }),
      terms: sortedTopics.reduce((acc, topic) => {
        acc[topic] = yearTopicPublications[year]?.[topic] || 0;
        return acc;
      }, {} as { [topic: string]: number }),
      publicationCounts: sortedTopics.reduce((acc, topic) => {
        acc[topic] = yearTopicPublications[year]?.[topic] || 0;
        return acc;
      }, {} as { [topic: string]: number }),
      totalPublications: yearTotalPublications[year] || 0,
    }));

    return { chartData, topTopics: sortedTopics, allYears: years };
  };

  const analyzeUniqueTermsPerPublication = (
    metadataList: any[],
    termsList: any[],
    allPublicationIds: number[]
  ) => {
    const termStats: { [term: string]: number } = {};
    const yearData: { [year: number]: { [term: string]: number } } = {};

    const excludedTerms = new Set([
      'общенаучные термины',
      ...FACTORS_LIST.map(f => f.toLowerCase()),
      ...SUBFACTORS_LIST.map(s => s.toLowerCase())
    ]);

    for (let i = 0; i < allPublicationIds.length; i++) {
      const metadata = metadataList[i];
      const terms = termsList[i];

      if (!metadata || !terms || typeof terms !== 'object') continue;

      const year = metadata['Publication year'] || new Date().getFullYear();

      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [term, count] of Object.entries(terms)) {
        const termLower = term.toLowerCase();
        
        if (excludedTerms.has(termLower)) {
          continue;
        }
        
        if (count as number > 0) {
          termStats[term] = (termStats[term] || 0) + 1;
          yearData[year][term] = (yearData[year][term] || 0) + 1;
        }
      }
    }

    const sortedTopics = Object.entries(termStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    const years = Object.keys(yearData).map(y => parseInt(y.toString())).filter(y => !isNaN(y)).sort((a, b) => a - b);
    
    const chartData = years.map(year => ({
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

    return { chartData, topTopics: sortedTopics, allYears: years };
  };

  const analyzeTermsOccurrences = (
    metadataList: any[],
    termsList: any[],
    allPublicationIds: number[]
  ) => {
    const termStats: { [term: string]: number } = {};
    const yearData: { [year: number]: { [term: string]: number } } = {};

    const excludedTerms = new Set([
      'общенаучные термины',
      ...FACTORS_LIST.map(f => f.toLowerCase()),
      ...SUBFACTORS_LIST.map(s => s.toLowerCase())
    ]);

    for (let i = 0; i < allPublicationIds.length; i++) {
      const metadata = metadataList[i];
      const terms = termsList[i];

      if (!metadata || !terms || typeof terms !== 'object') continue;

      const year = metadata['Publication year'] || new Date().getFullYear();

      if (!yearData[year]) {
        yearData[year] = {};
      }

      for (const [term, count] of Object.entries(terms)) {
        const termLower = term.toLowerCase();
        
        if (excludedTerms.has(termLower)) {
          continue;
        }
        
        const termCount = count as number;
        termStats[term] = (termStats[term] || 0) + termCount;
        yearData[year][term] = (yearData[year][term] || 0) + termCount;
      }
    }

    const sortedTopics = Object.entries(termStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    const years = Object.keys(yearData).map(y => parseInt(y.toString())).filter(y => !isNaN(y)).sort((a, b) => a - b);
    
    const chartData = years.map(year => ({
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

    return { chartData, topTopics: sortedTopics, allYears: years };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!authorId) {
        setError('Не указан ID автора');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setProgress(0);
        
        console.log('Загружаем публикации для автора:', authorId);
        const { ids: allPublicationIds, metadataList: fullMetadataList } = await getPublicationsWithYears();
        console.log('Получено публикаций:', allPublicationIds?.length);
        
        if (!allPublicationIds || allPublicationIds.length === 0) {
          setData({});
          setLoading(false);
          return;
        }

        const testIds = allPublicationIds;
        const publicationCount = testIds.length;
        const metadataList = fullMetadataList;
        setProgress(10);
        
        console.log('Загружаем факторы (level 1)...');
        const level1List = await fetchDataBatch(testIds, 1);
        setProgress(30);
        
        console.log('Загружаем подфакторы (level 2)...');
        const level2List = await fetchDataBatch(testIds, 2);
        setProgress(50);
        
        console.log('Загружаем термины (level 3)...');
        const level3List = await fetchDataBatch(testIds, 3);
        setProgress(70);
        
        console.log('Анализируем данные...');
        
        // Анализируем данные для всех режимов
        const newData: typeof data = {};

        // 1. Факторы (вхождения)
        const factorsTerms = analyzeFactorsByTerms(metadataList, level1List, testIds);
        newData.factors_terms = {
          chartData: factorsTerms.chartData,
          topTopics: factorsTerms.topTopics,
          allYears: factorsTerms.allYears,
          publicationCount,
        };

        // 2. Подфакторы (вхождения)
        const subfactorsTerms = analyzeSubfactorsByTerms(metadataList, level2List, testIds);
        newData.subfactors_terms = {
          chartData: subfactorsTerms.chartData,
          topTopics: subfactorsTerms.topTopics,
          allYears: subfactorsTerms.allYears,
          publicationCount,
        };

        // 3. Факторы (публикации)
        const factorsPubls = analyzeFactorsByPublications(metadataList, level1List, testIds);
        newData.factors_publs = {
          chartData: factorsPubls.chartData,
          topTopics: factorsPubls.topTopics,
          allYears: factorsPubls.allYears,
          publicationCount,
        };

        // 4. Подфакторы (публикации)
        const subfactorsPubls = analyzeSubfactorsByPublications(metadataList, level2List, testIds);
        newData.subfactors_publs = {
          chartData: subfactorsPubls.chartData,
          topTopics: subfactorsPubls.topTopics,
          allYears: subfactorsPubls.allYears,
          publicationCount,
        };

        // 5. Термины (публикации)
        const uniqueTermsPubls = analyzeUniqueTermsPerPublication(metadataList, level3List, testIds);
        newData.unique_terms_publs = {
          chartData: uniqueTermsPubls.chartData,
          topTopics: uniqueTermsPubls.topTopics,
          allYears: uniqueTermsPubls.allYears,
          publicationCount,
        };

        // 6. Термины (вхождения)
        const termsOccurrences = analyzeTermsOccurrences(metadataList, level3List, testIds);
        newData.terms_occurrences = {
          chartData: termsOccurrences.chartData,
          topTopics: termsOccurrences.topTopics,
          allYears: termsOccurrences.allYears,
          publicationCount,
        };

        setProgress(100);
        setData(newData);
        console.log('Анализ завершён:', newData);
        
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError(`Ошибка загрузки: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchData();
  }, [authorId]);

  return { data, loading, error, progress };
};