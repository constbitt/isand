export const generateMockReport = (
  terms: Array<{ term: string; freq: number }>,
  categories: Array<{ name: string; value: number }>,
  similarPublications: Array<{ title: string; authors: string; year: number; similarity: number }>
): string => {
  const report = `
    ОТЧЕТ ОБ АНАЛИЗЕ ПУБЛИКАЦИИ
    
    Извлеченные термины:
    ${terms.map(t => `- ${t.term} (частота: ${t.freq})`).join('\n')}
    
    Распределение по категориям:
    ${categories.map(c => `- ${c.name}: ${c.value}%`).join('\n')}
    
    Похожие публикации:
    ${similarPublications.map(p => `- ${p.title} (${p.authors}, ${p.year}) - сходство: ${p.similarity * 100}%`).join('\n')}
  `;
  return report;
};