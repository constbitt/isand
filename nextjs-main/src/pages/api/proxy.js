// src/pages/api/proxy.js
//
// Клиент ходит только на /api/proxy; grapher/filewatcher вызываются с сервера Next.
//
// Базовые URL (как в рабочей версии до рефакторинга) — если переменные окружения не заданы.
// В продакшене задайте GRAPHER_BASE_URL и ML_FILEWATCHER_BASE_URL (HTTPS за reverse proxy),
// чтобы не зависеть от дефолтов ниже.
//
// Дальнейшее улучшение: batch-API на стороне Next, чтобы не дергать get_publication_terms по одной публикации с клиента.

/** Дефолт = прежний grapher; переопределение: GRAPHER_BASE_URL */
const DEFAULT_GRAPHER_BASE_URL = 'http://193.232.208.58:9002/grapher';

/** Хост без /filewatcher; переопределение: ML_FILEWATCHER_BASE_URL (см. resolveFilewatcherBaseUrl) */
const DEFAULT_FILEWATCHER_ORIGIN = 'http://193.232.208.58:9001';

function getGrapherBaseUrl() {
  const v = (process.env.GRAPHER_BASE_URL || DEFAULT_GRAPHER_BASE_URL).trim();
  return v.replace(/\/$/, '');
}

/**
 * http://host:9001 и http://host:9001/ → с суффиксом /filewatcher; полный путь с /filewatcher не трогаем.
 * Без env — как раньше (DEFAULT_FILEWATCHER_ORIGIN + /filewatcher).
 */
function resolveFilewatcherBaseUrl(rawEnv) {
  const base = (rawEnv && String(rawEnv).trim()) || DEFAULT_FILEWATCHER_ORIGIN;
  if (!base) return null;
  const trimmed = String(base).replace(/\/$/, '');
  if (/\/filewatcher$/i.test(trimmed)) return trimmed;
  if (/^https?:\/\/[^/]+(:\d+)?$/i.test(trimmed)) return `${trimmed}/filewatcher`;
  return trimmed;
}

function getFilewatcherBaseUrlResolved() {
  return resolveFilewatcherBaseUrl(process.env.ML_FILEWATCHER_BASE_URL);
}

function unwrapDeltasBody(body) {
  if (body == null || typeof body !== 'object' || Array.isArray(body)) return body;
  if (body.deltas != null && typeof body.deltas === 'object' && !Array.isArray(body.deltas))
    return body.deltas;
  if (body.data != null && typeof body.data === 'object' && !Array.isArray(body.data)) return body.data;
  if (body.result != null && typeof body.result === 'object' && !Array.isArray(body.result))
    return body.result;
  return body;
}

/**
 * get_deltas: плоский { термин: number } / обёртка grapher; иногда — массив [ [имя, вес], ... ].
 */
function deltasMapFromResponse(body, idPubl) {
  body = unwrapDeltasBody(body);
  if (body == null) return {};
  if (Array.isArray(body)) {
    const o = {};
    for (const row of body) {
      if (row == null) continue;
      if (Array.isArray(row) && row.length >= 2) {
        o[String(row[0])] = Number(row[1]) || 0;
        continue;
      }
      if (typeof row === 'object') {
        const n = row.name ?? row.term ?? row.factor ?? row.label;
        if (n == null) continue;
        o[String(n)] =
          Number(
            row.delta ?? row.count ?? row.weight ?? row.value ?? 0
          ) || 0;
      }
    }
    return o;
  }
  if (typeof body !== 'object') return {};
  const k = String(idPubl);
  if (body[k] != null && typeof body[k] === 'object' && !Array.isArray(body[k])) {
    return normalizeTermCounts(body[k]);
  }
  const keys = Object.keys(body);
  if (keys.length > 0 && keys.every((x) => /^\d+$/.test(x))) {
    return body[k] && typeof body[k] === 'object' && !Array.isArray(body[k])
      ? normalizeTermCounts(body[k])
      : {};
  }
  return normalizeTermCounts(body);
}

function normalizeTermCounts(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const o = {};
  for (const [name, v] of Object.entries(obj)) {
    o[name] = typeof v === 'number' && !Number.isNaN(v) ? v : Number(v) || 0;
  }
  return o;
}

/** Откат, если get_deltas недоступен: grapher, level 1/2/3 = факторы/подфакторы/термины */
async function fetchGrapherPublicationDeltas(grapherBase, idPublStr) {
  const idNum = parseInt(idPublStr, 10);
  if (!Number.isFinite(idNum)) throw new Error('Invalid id_publ');
  const post = (level) =>
    JSON.stringify({
      publ_ids: [idNum],
      id_type: 'local',
      format: 'names',
      level,
      common_terms: 'leave',
      result: 'list',
    });
  const [a, b, c] = await Promise.all([
    fetch(`${grapherBase}/get_publs_deltas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: post(1),
    }),
    fetch(`${grapherBase}/get_publs_deltas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: post(2),
    }),
    fetch(`${grapherBase}/get_publs_deltas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: post(3),
    }),
  ]);
  if (!a.ok || !b.ok || !c.ok) {
    const s = [a, b, c]
      .map((r) => r.status)
      .join(', ');
    throw new Error(`grapher get_publs_deltas: ${s}`);
  }
  const fa = await a.json();
  const fb = await b.json();
  const fc = await c.json();
  return {
    publication_id: idNum,
    factors: fa[idPublStr] || fa[String(idNum)] || {},
    subfactors: fb[idPublStr] || fb[String(idNum)] || {},
    terms: fc[idPublStr] || fc[String(idNum)] || {},
  };
}

export default async function handler(req, res) {
  console.log('Simple Proxy called!');
  
  // Извлекаем ВСЕ возможные параметры
  const { 
    endpoint,
    // Для авторов
    id_author, auth_prnd_id,
    // Для журналов, конференций, организаций, городов
    id_journal, id_conference, id_organization, id_city,
    // Для терминов (НОВЫЙ МЕТОД)
    id_publ, // ID публикации для получения терминов
    // Новые параметры
    sort_mode,
    recalculate,
    keep_not_russian,
    min_max_year,
    verbouse,
    current_user_id,
    // Пагинация
    limit,
    offset,
    search
  } = req.query;

  try {
    let url = '';
    const newBaseUrl = getGrapherBaseUrl();
    const filewatcherBase = getFilewatcherBaseUrlResolved();
    
    switch (endpoint) {
      // ===== СПИСКИ СУЩНОСТЕЙ =====
      case 'get_all_authors':
        url = `${newBaseUrl}/get_all_available_authors`;
        const authorParams = new URLSearchParams();
        if (sort_mode) authorParams.append('sort_mode', sort_mode);
        if (recalculate) authorParams.append('recalculate', recalculate);
        if (keep_not_russian) authorParams.append('keep_not_russian', keep_not_russian);
        if (authorParams.toString()) url += '?' + authorParams.toString();
        break;
        
      case 'get_all_journals':
        url = `${newBaseUrl}/get_all_available_journals`;
        const journalParams = new URLSearchParams();
        if (sort_mode) journalParams.append('sort_mode', sort_mode);
        if (recalculate) journalParams.append('recalculate', recalculate);
        if (journalParams.toString()) url += '?' + journalParams.toString();
        break;
        
      case 'get_all_conferences':
        url = `${newBaseUrl}/get_all_available_conferences`;
        const confParams = new URLSearchParams();
        if (sort_mode) confParams.append('sort_mode', sort_mode);
        if (recalculate) confParams.append('recalculate', recalculate);
        if (confParams.toString()) url += '?' + confParams.toString();
        break;
        
      case 'get_all_organizations':
        url = `${newBaseUrl}/get_all_available_organizations`;
        const orgParams = new URLSearchParams();
        if (sort_mode) orgParams.append('sort_mode', sort_mode);
        if (recalculate) orgParams.append('recalculate', recalculate);
        if (orgParams.toString()) url += '?' + orgParams.toString();
        break;
        
      case 'get_all_cities':
        url = `${newBaseUrl}/get_all_available_cities`;
        const cityParams = new URLSearchParams();
        if (sort_mode) cityParams.append('sort_mode', sort_mode);
        if (recalculate) cityParams.append('recalculate', recalculate);
        if (cityParams.toString()) url += '?' + cityParams.toString();
        break;
      
      // ===== ПУБЛИКАЦИИ СУЩНОСТЕЙ =====
      case 'authors_publs':
        const authorId = auth_prnd_id || id_author;
        if (!authorId) throw new Error('Missing author ID');
        
        url = `${newBaseUrl}/get_author_publications?auth_prnd_id=${authorId}`;
        if (min_max_year) {
          if (Array.isArray(min_max_year)) {
            min_max_year.forEach(year => url += `&min_max_year=${year}`);
          } else {
            url += `&min_max_year=${min_max_year}`;
          }
        }
        if (verbouse) url += `&verbouse=${verbouse}`;
        if (current_user_id) url += `&current_user_id=${current_user_id}`;
        break;
        
      case 'journals_publs':
        if (!id_journal) throw new Error('Missing id_journal');
        url = `${newBaseUrl}/get_journal_publications?id=${id_journal}`;
        if (min_max_year) {
          if (Array.isArray(min_max_year)) {
            min_max_year.forEach(year => url += `&min_max_year=${year}`);
          } else {
            url += `&min_max_year=${min_max_year}`;
          }
        }
        if (verbouse) url += `&verbouse=${verbouse}`;
        if (current_user_id) url += `&current_user_id=${current_user_id}`;
        break;
        
      case 'conferences_publs':
        if (!id_conference) throw new Error('Missing id_conference');
        url = `${newBaseUrl}/get_conf_publications?id=${id_conference}`;
        if (min_max_year) {
          if (Array.isArray(min_max_year)) {
            min_max_year.forEach(year => url += `&min_max_year=${year}`);
          } else {
            url += `&min_max_year=${min_max_year}`;
          }
        }
        if (verbouse) url += `&verbouse=${verbouse}`;
        if (current_user_id) url += `&current_user_id=${current_user_id}`;
        break;
        
      case 'organizations_publs':
        if (!id_organization) throw new Error('Missing id_organization');
        url = `${newBaseUrl}/get_organization_publications?id=${id_organization}`;
        if (min_max_year) {
          if (Array.isArray(min_max_year)) {
            min_max_year.forEach(year => url += `&min_max_year=${year}`);
          } else {
            url += `&min_max_year=${min_max_year}`;
          }
        }
        if (verbouse) url += `&verbouse=${verbouse}`;
        if (current_user_id) url += `&current_user_id=${current_user_id}`;
        break;
        
      case 'cities_publs':
        if (!id_city) throw new Error('Missing id_city');
        url = `${newBaseUrl}/get_city_publications?id=${id_city}`;
        if (min_max_year) {
          if (Array.isArray(min_max_year)) {
            min_max_year.forEach(year => url += `&min_max_year=${year}`);
          } else {
            url += `&min_max_year=${min_max_year}`;
          }
        }
        if (verbouse) url += `&verbouse=${verbouse}`;
        if (current_user_id) url += `&current_user_id=${current_user_id}`;
        break;
      
      // ===== get_publication_terms: filewatcher get_deltas (factor_level: факторы 2, подфакторы 3, термины 4) =====
      case 'get_publication_terms': {
        const idPublRaw = Array.isArray(id_publ) ? id_publ[0] : id_publ;
        if (idPublRaw == null || idPublRaw === '') throw new Error('Missing id_publ');
        const idPublStr = String(idPublRaw);
        let result;

        const idQ = encodeURIComponent(idPublStr);
        const uFactors = `${filewatcherBase}/get_deltas?id_publ=${idQ}&factor_level=2`;
        const uSubfactors = `${filewatcherBase}/get_deltas?id_publ=${idQ}&factor_level=3`;
        const uTerms = `${filewatcherBase}/get_deltas?id_publ=${idQ}&factor_level=4`;

        console.log(`🔍 get_deltas id_publ=${idPublStr} (factor_level 2 / 3 / 4)`);

        const [factors, subfactors, terms] = await Promise.all([
          fetch(uFactors, { method: 'GET' }),
          fetch(uSubfactors, { method: 'GET' }),
          fetch(uTerms, { method: 'GET' }),
        ]);

        const filewatcherOk = factors.ok && subfactors.ok && terms.ok;

        if (filewatcherOk) {
          const factorsData = await factors.json();
          const subfactorsData = await subfactors.json();
          const termsData = await terms.json();
          result = {
            publication_id: parseInt(idPublStr, 10),
            factors: deltasMapFromResponse(factorsData, idPublStr),
            subfactors: deltasMapFromResponse(subfactorsData, idPublStr),
            terms: deltasMapFromResponse(termsData, idPublStr),
          };
        } else {
          const st = {
            factors: factors.status,
            subfactors: subfactors.status,
            terms: terms.status,
          };
          console.warn(
            `↩️ filewatcher get_deltas ${JSON.stringify(st)} (base=${filewatcherBase}) → grapher get_publs_deltas id_publ=${idPublStr}`
          );
          result = await fetchGrapherPublicationDeltas(newBaseUrl, idPublStr);
        }

        console.log(`✅ Термины загружены: факторов=${Object.keys(result.factors).length}, подфакторов=${Object.keys(result.subfactors).length}, терминов=${Object.keys(result.terms).length}`);
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).json(result);
      }
      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }

    console.log('🔗 Проксируем к:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ошибка ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    console.log('✅ Успешный ответ');
    console.log('Тип ответа:', Array.isArray(data) ? 'массив' : 'объект');
    console.log('Размер:', Array.isArray(data) ? data.length : Object.keys(data).length);
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    console.error('Request query:', req.query);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Proxy error',
      details: error.message,
      query: req.query
    });
  }
}
