// src/pages/api/proxy.js
export default async function handler(req, res) {
  console.log('Simple Proxy called!');
  
  // Извлекаем ВСЕ возможные параметры
  const { 
    endpoint, 
    id_author, 
    id_journal, 
    id_conference, 
    id_organization, 
    id_city, 
    id_publ,
    factor_level,
    // Добавляем другие параметры на будущее
    limit,
    offset,
    search
  } = req.query;

  try {
    let url = '';
    const baseUrl = 'http://193.232.208.58:9001/filewatcher';
    
    switch (endpoint) {
      case 'authors_publs':
        if (!id_author) throw new Error('Missing id_author');
        url = `${baseUrl}/authors_publs?id_author=${id_author}`;
        break;
      case 'journals_publs':
        if (!id_journal) throw new Error('Missing id_journal');
        url = `${baseUrl}/journals_publs?id_journal=${id_journal}`;
        break;
      case 'conferences_publs':
        if (!id_conference) throw new Error('Missing id_conference');
        url = `${baseUrl}/conferences_publs?id_conference=${id_conference}`;
        break;
      case 'organizations_publs':
        if (!id_organization) throw new Error('Missing id_organization');
        url = `${baseUrl}/organizations_publs?id_organization=${id_organization}`;
        break;
      case 'cities_publs':
        if (!id_city) throw new Error('Missing id_city');
        url = `${baseUrl}/cities_publs?id_city=${id_city}`;
        break;
      case 'publs_metadata':
        if (!id_publ) throw new Error('Missing id_publ');
        url = `${baseUrl}/publs_metadata?id_publ=${id_publ}`;
        break;
      case 'get_deltas':
        if (!id_publ) throw new Error('Missing id_publ');
        // Используем factor_level из запроса, по умолчанию 1
        const level = factor_level || '1';
        url = `${baseUrl}/get_deltas?id_publ=${id_publ}&factor_level=${level}`;
        console.log(`Запрашиваем level=${level} для публикации ${id_publ}`);
        break;
      default:
        return res.status(400).json({ error: 'Invalid endpoint' });
    }

    console.log('🔗 Proxying to:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    console.log('Successfully proxied request');
    console.log(`Данные для ${endpoint}, id_publ=${id_publ || 'N/A'}, factor_level=${factor_level || '1'}:`);
    console.log('Количество ключей:', Object.keys(data).length);
    
    // Выводим первые 10 ключей для отладки
    if (Object.keys(data).length > 0) {
      console.log('Примеры ключей:', Object.keys(data).slice(0, 10));
      
      // Для get_deltas добавляем дополнительную информацию
      if (endpoint === 'get_deltas') {
        const keys = Object.keys(data);
        const sampleEntry = keys.length > 0 ? `${keys[0]}: ${data[keys[0]]}` : 'нет данных';
        console.log(`Пример: ${sampleEntry}`);
        
        // Проверяем тип данных
        const longKeys = keys.filter(key => key.length > 30);
        const hasFactors = keys.some(key => 
          key.toLowerCase().includes('теория') || 
          key.toLowerCase().includes('система') ||
          key.length > 40
        );
        
        if (factor_level === '3' && hasFactors) {
          console.warn('ВНИМАНИЕ: Для level=3 пришли данные, похожие на факторы/подфакторы');
          console.warn('Количество длинных ключей (>30 символов):', longKeys.length);
          if (longKeys.length > 0) {
            console.warn('   Примеры длинных ключей:', longKeys.slice(0, 3));
          }
        }
      }
    }
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    console.error('Request query:', req.query);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Proxy error',
      details: error.message,
      query: req.query
    });
  }
}