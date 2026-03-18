// src/pages/api/proxy.js
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
    // Новый сервер для основных данных и терминов
    const newBaseUrl = 'http://193.232.208.58:9002/grapher';
    
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

      case 'get_author_publications_count_by_year':
        const authorIdForCount = author_id || auth_prnd_id;
        if (!authorIdForCount) throw new Error('Missing author ID for count by year');
        
        console.log(`📊 Запрос публикаций для автора ${authorIdForCount}`);
        url = `${newBaseUrl}/get_author_publications?auth_prnd_id=${authorIdForCount}`;
        
        console.log('🔗 URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Ошибка ${response.status}:`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        console.log(`✅ Получено ${Array.isArray(data) ? data.length : 'объект'} записей`);
        console.log('Пример первых 3 записей:', Array.isArray(data) ? data.slice(0, 3) : 'не массив');
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        return res.status(200).json(data);
        


      
      // ===== НОВЫЙ МЕТОД: ТЕРМИНЫ/ФАКТОРЫ/ПОДФАКТОРЫ (УРОВНИ 3,2,1) =====
      case 'get_publication_terms':
        if (!id_publ) throw new Error('Missing id_publ');
        
        console.log(`🔍 Запрос терминов для публикации ${id_publ} (новый метод)`);
        
        // Делаем три параллельных POST-запроса на новый сервер
        const [factors, subfactors, terms] = await Promise.all([
          // Уровень 1: Факторы
          fetch(`${newBaseUrl}/get_publs_deltas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              publ_ids: [parseInt(id_publ)],
              id_type: 'local',
              format: 'names',
              level: 1,
              common_terms: 'leave',
              result: 'list'
            })
          }),
          // Уровень 2: Подфакторы
          fetch(`${newBaseUrl}/get_publs_deltas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              publ_ids: [parseInt(id_publ)],
              id_type: 'local',
              format: 'names',
              level: 2,
              common_terms: 'leave',
              result: 'list'
            })
          }),
          // Уровень 3: Термины
          fetch(`${newBaseUrl}/get_publs_deltas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              publ_ids: [parseInt(id_publ)],
              id_type: 'local',
              format: 'names',
              level: 3,
              common_terms: 'leave',
              result: 'list'
            })
          })
        ]);

        // Проверяем все ответы
        if (!factors.ok || !subfactors.ok || !terms.ok) {
          const errors = [];
          if (!factors.ok) errors.push(`factors: ${factors.status}`);
          if (!subfactors.ok) errors.push(`subfactors: ${subfactors.status}`);
          if (!terms.ok) errors.push(`terms: ${terms.status}`);
          throw new Error(`Ошибка получения иерархии: ${errors.join(', ')}`);
        }

        // Парсим все ответы
        const factorsData = await factors.json();
        const subfactorsData = await subfactors.json();
        const termsData = await terms.json();

        // Структурируем ответ в удобном формате
        const result = {
          publication_id: parseInt(id_publ),
          factors: factorsData[id_publ] || {},
          subfactors: subfactorsData[id_publ] || {},
          terms: termsData[id_publ] || {}
        };

        console.log(`✅ Термины загружены: факторов=${Object.keys(result.factors).length}, подфакторов=${Object.keys(result.subfactors).length}, терминов=${Object.keys(result.terms).length}`);
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(200).json(result);
        
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