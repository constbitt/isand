import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import type { AnalysisMode, EntityType, TopicYearDataPoint } from './trendForecastTypes';
import {
  analysisModeToEntityType,
  buildTimeSeries,
  entityTypeToContextType,
} from './trendForecast';
import type { BatchPredictResult } from './trendForecastTypes';

export interface ForecastByTopic {
  predicted_class: number;
  class_name: string;
  probabilities?: Record<string, number>;
  values: [number, number, number];
}

const cacheRef = new Map<string, { byTopic: Record<string, ForecastByTopic> }>();

function makeKey(
  entityId: string,
  finalEntityType: EntityType,
  mode: AnalysisMode,
  topics: string[],
  years: string
) {
  return [entityId, finalEntityType, mode, topics.join('\u0001'), years].join('|');
}

function clampClass(c: number): 0 | 1 | 2 {
  if (c <= 0) return 0;
  if (c >= 2) return 2;
  return 1;
}

/** Один шаг вперёд по тому же правилу, что и раньше: класс 2 — рост, 0 — спад, 1 — уровень. */
function oneStepExtrapolate(lastValue: number, predictedClass: 0 | 1 | 2): number {
  const G = 0.15;
  const D = 0.15;
  if (predictedClass === 2) return lastValue * (1 + G);
  if (predictedClass === 0) return Math.max(0, lastValue * (1 - D));
  return lastValue;
}

const isPublsMode = (m: AnalysisMode) =>
  m === 'factors_publs' || m === 'subfactors_publs';

type ReqItem = {
  context_type: string;
  entity_type: string;
  time_series: number[];
  years: number[];
};

/**
 * Плоский прогноз по последнему известному значению (без ML).
 * Нужен при одной годовой точке, сбоя батча или сбоя по отдельной сущности.
 */
function buildLocalStability(
  evolutionData: TopicYearDataPoint[],
  displayTopics: string[],
  label: string
): Record<string, ForecastByTopic> {
  const out: Record<string, ForecastByTopic> = {};
  for (const topic of displayTopics) {
    const { timeSeries } = buildTimeSeries(evolutionData, topic);
    if (timeSeries.length < 1) continue;
    const last = timeSeries[timeSeries.length - 1] ?? 0;
    out[topic] = {
      predicted_class: 1,
      class_name: label,
      values: [last, last, last] as [number, number, number],
    };
  }
  return out;
}

type PostItems = (items: ReqItem) => Promise<Response>;

/** Три батч-вызова к модели: после шагов 0 и 1 в ряды добавляются y+1, y+2. */
async function rollThreeStepBatch(
  post: PostItems,
  orderTopics: string[],
  baseItems: ReqItem[]
): Promise<Record<string, ForecastByTopic> | null> {
  const work: ReqItem[] = baseItems.map((it) => ({
    context_type: it.context_type,
    entity_type: it.entity_type,
    time_series: [...it.time_series],
    years: [...it.years],
  }));
  const triple: number[][] = orderTopics.map(() => [0, 0, 0]);
  const lastStepMeta: {
    cl: 0 | 1 | 2;
    class_name: string;
    probabilities?: Record<string, number>;
  }[] = [];

  for (let step = 0; step < 3; step++) {
    let r: Response;
    try {
      r = await post(work);
    } catch {
      return null;
    }
    if (!r.ok) return null;
    let j: BatchPredictResult;
    try {
      j = (await r.json()) as BatchPredictResult;
    } catch {
      return null;
    }
    const results = j?.results;
    if (!Array.isArray(results) || results.length !== orderTopics.length) return null;
    for (let i = 0; i < orderTopics.length; i++) {
      const res = results[i];
      if (!res) return null;
      const cl = clampClass(
        Number.isFinite(res.predicted_class) ? (res.predicted_class as number) : 1
      );
      const lastV = work[i]!.time_series[work[i]!.time_series.length - 1] ?? 0;
      const v = oneStepExtrapolate(lastV, cl);
      triple[i]![step] = v;
      lastStepMeta[i] = {
        cl,
        class_name: res.class_name || '',
        probabilities: res.probabilities,
      };
      if (step < 2) {
        work[i]!.time_series.push(v);
        work[i]!.years.push(
          (work[i]!.years[work[i]!.years.length - 1] ?? 0) + 1
        );
      }
    }
  }

  const out: Record<string, ForecastByTopic> = {};
  for (let i = 0; i < orderTopics.length; i++) {
    const topic = orderTopics[i]!;
    const meta = lastStepMeta[i]!;
    const t = triple[i]!;
    out[topic] = {
      predicted_class: meta.cl,
      class_name: meta.class_name,
      probabilities: meta.probabilities,
      values: [t[0] ?? 0, t[1] ?? 0, t[2] ?? 0] as [number, number, number],
    };
  }
  return out;
}

function fillMissingWithLocal(
  out: Record<string, ForecastByTopic>,
  displayTopics: string[],
  evolutionData: TopicYearDataPoint[]
) {
  for (const topic of displayTopics) {
    if (out[topic]) continue;
    const { timeSeries } = buildTimeSeries(evolutionData, topic);
    if (timeSeries.length >= 1) {
      const last = timeSeries[timeSeries.length - 1] ?? 0;
      out[topic] = {
        predicted_class: 1,
        class_name: 'Стабильность (оценка)',
        values: [last, last, last] as [number, number, number],
      };
    }
  }
}

export function useTrendForecast(params: {
  getChartData: any[];
  evolutionData: TopicYearDataPoint[];
  displayTopics: string[];
  finalEntityType: EntityType;
  analysisMode: AnalysisMode;
  entityId: string;
  evolutionLoading: boolean;
  /** false — график только по истории, без API прогноза (серии публикации). */
  enableForecast?: boolean;
}): {
  chartDataWithForecast: any[];
  firstForecastYear: number | null;
  lastHistoryYear: number | null;
  forecastLoading: boolean;
  forecastError: string | null;
  byTopic: Record<string, ForecastByTopic>;
} {
  const {
    getChartData,
    evolutionData,
    displayTopics,
    finalEntityType,
    analysisMode,
    entityId,
    evolutionLoading,
    enableForecast = true,
  } = params;

  const [forecastError, setForecastError] = useState<string | null>(null);
  const [byTopic, setByTopic] = useState<Record<string, ForecastByTopic>>({});
  const [forecastLoading, setForecastLoading] = useState(false);
  const reqId = useRef(0);

  const yearsKey = useMemo(
    () =>
      evolutionData
        .map((d) => d.year)
        .sort()
        .join(','),
    [evolutionData]
  );

  const runFetch = useCallback(async () => {
    if (!enableForecast) {
      setByTopic({});
      setForecastError(null);
      setForecastLoading(false);
      return;
    }
    if (!entityId || !displayTopics.length) {
      setByTopic({});
      setForecastError(null);
      return;
    }
    if (evolutionData.length < 1) {
      setByTopic({});
      setForecastError(null);
      return;
    }

    const cacheKey = makeKey(
      entityId,
      finalEntityType,
      analysisMode,
      displayTopics,
      yearsKey
    );
    const cached = cacheRef.get(cacheKey);
    if (cached) {
      setByTopic(cached.byTopic);
      setForecastError(null);
      return;
    }

    const myId = ++reqId.current;
    setForecastLoading(true);
    setForecastError(null);
    setByTopic({});

    const entityTypeStr = analysisModeToEntityType(analysisMode);
    const contextType = entityTypeToContextType(finalEntityType);

    const requestItems: ReqItem[] = [];
    const orderTopics: string[] = [];

    for (const topic of displayTopics) {
      const { years, timeSeries } = buildTimeSeries(evolutionData, topic);
      if (timeSeries.length < 2) continue;
      orderTopics.push(topic);
      requestItems.push({
        context_type: contextType,
        entity_type: entityTypeStr,
        time_series: timeSeries,
        years: years,
      });
    }

    const setDone = (m: Record<string, ForecastByTopic>, err: string | null) => {
      if (myId === reqId.current) {
        cacheRef.set(cacheKey, { byTopic: m });
        setByTopic(m);
        setForecastError(err);
      }
    };

    if (orderTopics.length === 0) {
      const onlyLocal = buildLocalStability(
        evolutionData,
        displayTopics,
        'Стабильность (оценка, < 2 точек в ряду)'
      );
      if (Object.keys(onlyLocal).length) {
        setDone(onlyLocal, null);
      } else {
        if (myId === reqId.current) {
          setByTopic({});
          setForecastError(null);
        }
      }
      if (myId === reqId.current) setForecastLoading(false);
      return;
    }

    const post = async (items: ReqItem) => {
      return fetch('/api/trend-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    };

    /** Сбой батча: три пошаговых вызова на одну сущность с нарастающим рядом. */
    const tryRollingOneByOne = async (): Promise<Record<string, ForecastByTopic> | null> => {
      const out: Record<string, ForecastByTopic> = {};
      for (let i = 0; i < orderTopics.length; i++) {
        const topic = orderTopics[i]!;
        const base = requestItems[i]!;
        const work: ReqItem = {
          context_type: base.context_type,
          entity_type: base.entity_type,
          time_series: [...base.time_series],
          years: [...base.years],
        };
        const vals: number[] = [];
        let lastMeta: {
          cl: 0 | 1 | 2;
          class_name: string;
          probabilities?: Record<string, number>;
        } = { cl: 1, class_name: '' };
        let success = true;
        for (let step = 0; step < 3; step++) {
          try {
            const r = await post([work]);
            if (!r.ok) {
              success = false;
              break;
            }
            const j = (await r.json()) as BatchPredictResult;
            const r0 = j?.results?.[0];
            if (!r0) {
              success = false;
              break;
            }
            const cl = clampClass(
              Number.isFinite(r0.predicted_class) ? (r0.predicted_class as number) : 1
            );
            const lastV = work.time_series[work.time_series.length - 1] ?? 0;
            const v = oneStepExtrapolate(lastV, cl);
            vals.push(v);
            lastMeta = {
              cl,
              class_name: r0.class_name || '',
              probabilities: r0.probabilities,
            };
            if (step < 2) {
              work.time_series.push(v);
              work.years.push(
                (work.years[work.years.length - 1] ?? 0) + 1
              );
            }
          } catch {
            success = false;
            break;
          }
        }
        if (success && vals.length === 3) {
          out[topic] = {
            predicted_class: lastMeta.cl,
            class_name: lastMeta.class_name,
            probabilities: lastMeta.probabilities,
            values: [vals[0]!, vals[1]!, vals[2]!],
          };
        } else {
          const { timeSeries } = buildTimeSeries(evolutionData, topic);
          if (timeSeries.length >= 1) {
            const last = timeSeries[timeSeries.length - 1] ?? 0;
            out[topic] = {
              predicted_class: 1,
              class_name: 'Стабильность (оценка)',
              values: [last, last, last] as [number, number, number],
            };
          }
        }
      }
      return Object.keys(out).length ? out : null;
    };

    try {
      const outBatch = await rollThreeStepBatch(post, orderTopics, requestItems);
      if (outBatch) {
        fillMissingWithLocal(outBatch, displayTopics, evolutionData);
        setDone(outBatch, null);
        return;
      }
      const one = await tryRollingOneByOne();
      if (one) {
        fillMissingWithLocal(one, displayTopics, evolutionData);
        setDone(one, null);
        return;
      }
    } catch {
      const one = await tryRollingOneByOne();
      if (one) {
        fillMissingWithLocal(one, displayTopics, evolutionData);
        setDone(one, null);
        return;
      }
    } finally {
      if (myId === reqId.current) setForecastLoading(false);
    }

    // Полный фоллбек: стабильность по последним значениям (график всё равно с тремя годами)
    const fallback = buildLocalStability(
      evolutionData,
      displayTopics,
      'Стабильность (оценка)'
    );
    if (Object.keys(fallback).length) {
      setDone(fallback, null);
    } else {
      if (myId === reqId.current) {
        setByTopic({});
        setForecastError('Не удалось загрузить прогноз');
      }
    }
  }, [
    displayTopics,
    analysisMode,
    entityId,
    finalEntityType,
    evolutionData,
    yearsKey,
    enableForecast,
  ]);

  useEffect(() => {
    if (evolutionLoading) return;
    void runFetch();
  }, [evolutionLoading, runFetch]);

  const { chartDataWithForecast, firstForecastYear, lastHistoryYear } = useMemo(() => {
    const base = getChartData;
    if (!base.length) {
      return {
        chartDataWithForecast: [] as any[],
        firstForecastYear: null,
        lastHistoryYear: null,
      };
    }
    const lastHist = base[base.length - 1] as any;
    const y0 = lastHist?.year as number;
    if (y0 == null || y0 === undefined) {
      return {
        chartDataWithForecast: base,
        firstForecastYear: null,
        lastHistoryYear: null,
      };
    }
    if (!enableForecast) {
      return {
        chartDataWithForecast: base,
        firstForecastYear: null,
        lastHistoryYear: y0,
      };
    }
    const haveForecast = displayTopics.some((t) => byTopic[t]?.values);
    if (!haveForecast) {
      return {
        chartDataWithForecast: base,
        firstForecastYear: null,
        lastHistoryYear: y0,
      };
    }
    const yf = y0 + 1;
    const out: any[] = base.map((r) => ({ ...r, isForecast: !!(r as any).isForecast }));
    const years3 = [y0 + 1, y0 + 2, y0 + 3];
    const publs = isPublsMode(analysisMode);

    years3.forEach((y, i) => {
      const row: any = { year: y, isForecast: true };
      displayTopics.forEach((topic) => {
        const fore = byTopic[topic];
        if (fore?.values) {
          row[`topics.${topic}`] = fore.values[i] ?? 0;
        } else {
          const before = out[out.length - 1] as any;
          const prev = before?.[`topics.${topic}`] ?? lastHist?.[`topics.${topic}`] ?? 0;
          row[`topics.${topic}`] = prev;
        }
      });
      if (publs) {
        const before = out.length ? (out[out.length - 1] as any) : lastHist;
        const lp = y === y0 + 1 ? lastHist : before;
        displayTopics.forEach((topic) => {
          row[`counts.${topic}`] = 0;
        });
        row.totalPublications = lp?.totalPublications ?? lastHist?.totalPublications ?? 0;
      }
      out.push(row);
    });
    return {
      chartDataWithForecast: out,
      firstForecastYear: yf,
      lastHistoryYear: y0,
    };
  }, [getChartData, byTopic, displayTopics, analysisMode, enableForecast]);

  return {
    chartDataWithForecast,
    firstForecastYear,
    lastHistoryYear,
    forecastLoading,
    forecastError,
    byTopic,
  };
}
