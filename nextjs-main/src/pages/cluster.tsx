
import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Autocomplete,
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControlLabel,
  Switch
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import PanToolIcon from '@mui/icons-material/PanTool';
import MouseIcon from '@mui/icons-material/Mouse';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

interface ClusterPoint {
  author_id: number;
  fio: string;
  publs_count: number;
  x: number;
  y: number;
  cluster: number;
  top_terms: string[];
}

interface ClusteringData {
  author_clusters: {
    author_id: number;
    author_name: string;
    x: number;
    y: number;
    cluster: number;
    top_terms: string[];
  }[];
}

interface Connection {
  from: number; // ID автора
  to: number;   // ID соавтора
}

const AuthorsClusteringPage = () => {
  const [points, setPoints] = useState<ClusterPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<ClusterPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [coauthorIds, setCoauthorIds] = useState<Set<number>>(new Set());
  const [markedAuthors, setMarkedAuthors] = useState<Set<number>>(new Set());
  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
  const [showOnlyMarked, setShowOnlyMarked] = useState(false);

  const clusterColors = [
    '#1b4596', // primary
    'rgb(34, 139, 230)', // secondary
    '#ff6b6b', '#4ecdc4', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
  ];

  // Создаем Map для быстрого поиска авторов по ID
  const [authorsMap, setAuthorsMap] = useState<Map<number, ClusterPoint>>(new Map());

  // Добавляем CSS для анимаций
  const animationStyles = `
    @keyframes pulse {
      0% {
        box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.9);
      }
      100% {
        box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
      }
    }
    
    @keyframes glow {
      0% {
        filter: brightness(1);
      }
      50% {
        filter: brightness(1.3);
      }
      100% {
        filter: brightness(1);
      }
    }
    
    @keyframes bounce {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.05);
      }
    }
    
    @keyframes star-pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
        transform: translate(-50%, -50%) scale(1);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
        transform: translate(-50%, -50%) scale(1);
      }
    }
  `;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/clustering_results.json');
      const data: ClusteringData = await response.json();
      
      const newPoints: ClusterPoint[] = data.author_clusters.map(item => ({
        author_id: typeof item.author_id === 'string' ? parseInt(item.author_id) : item.author_id,
        fio: item.author_name,
        publs_count: Math.floor(Math.random() * 100) + 1,
        x: item.x,
        y: item.y,
        cluster: item.cluster,
        top_terms: item.top_terms || []
      }));
      
      setPoints(newPoints);
      
      // Создаем Map для быстрого поиска
      const map = new Map<number, ClusterPoint>();
      newPoints.forEach(point => {
        map.set(point.author_id, point);
      });
      setAuthorsMap(map);
      
      setLoading(false);
    } catch (err) {
      setError('Не удалось загрузить данные. Проверьте наличие файла clustering_results.json');
      setLoading(false);
    }
  };

  // Функция для загрузки соавторов
  const loadCoauthors = async (authorId: number) => {
    setLoadingConnections(true);
    try {
      const response = await fetch(`https://kb-isand.ipu.ru/grapher/get_author_coauthors?auth_id=${authorId}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки соавторов');
      }
      
      const coauthorIdsArray: number[] = await response.json();
      
      // Сохраняем ID соавторов в Set для быстрой проверки
      const coauthorSet = new Set(coauthorIdsArray);
      setCoauthorIds(coauthorSet);
      
      // Создаем связи только с теми соавторами, которые есть на графике
      const newConnections: Connection[] = [];
      coauthorIdsArray.forEach(coauthorId => {
        if (authorsMap.has(coauthorId)) {
          newConnections.push({
            from: authorId,
            to: coauthorId
          });
        }
      });
      
      setConnections(newConnections);
    } catch (err) {
      console.error('Ошибка загрузки соавторов:', err);
      setCoauthorIds(new Set());
      setConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  };

  const handlePointClick = async (point: ClusterPoint) => {
    setSelectedPoint(point);
    await loadCoauthors(point.author_id);
  };

  // Функция для отметки/снятия отметки автора
  const toggleMarkAuthor = (authorId: number) => {
    const newMarkedAuthors = new Set(markedAuthors);
    if (newMarkedAuthors.has(authorId)) {
      newMarkedAuthors.delete(authorId);
    } else {
      newMarkedAuthors.add(authorId);
    }
    setMarkedAuthors(newMarkedAuthors);
  };

  // Функция для отметки выбранного автора
  const markSelectedAuthor = () => {
    if (selectedPoint) {
      toggleMarkAuthor(selectedPoint.author_id);
    }
  };

  // Функция для проверки, является ли автор соавтором
  const isCoauthor = (authorId: number) => {
    return coauthorIds.has(authorId);
  };

  // Функция для проверки, отмечен ли автор
  const isMarked = (authorId: number) => {
    return markedAuthors.has(authorId);
  };

  // Функция для получения отфильтрованных точек (если включен фильтр "Показывать только отмеченных")
  const getFilteredPoints = () => {
    if (showOnlyMarked && markedAuthors.size > 0) {
      return points.filter(point => markedAuthors.has(point.author_id));
    }
    return points;
  };

  // Функция для очистки всех отметок
  const clearAllMarks = () => {
    setMarkedAuthors(new Set());
  };

  // Функция для удаления конкретной отметки
  const removeMark = (authorId: number) => {
    const newMarkedAuthors = new Set(markedAuthors);
    newMarkedAuthors.delete(authorId);
    setMarkedAuthors(newMarkedAuthors);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale(Math.min(scale * 1.1, 3));
    } else {
      setScale(Math.max(scale * 0.9, 0.3));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Левая кнопка мыши
      setIsDragging(true);
      setStartDrag({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffsetX(e.clientX - startDrag.x);
      setOffsetY(e.clientY - startDrag.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setScale(Math.min(scale * 1.2, 3));
  const zoomOut = () => setScale(Math.max(scale * 0.8, 0.3));
  const resetView = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };
  const moveLeft = () => setOffsetX(offsetX - 50);
  const moveRight = () => setOffsetX(offsetX + 50);
  const moveUp = () => setOffsetY(offsetY - 50);
  const moveDown = () => setOffsetY(offsetY + 50);

  // Функция для очистки связей
  const clearConnections = () => {
    setConnections([]);
    setCoauthorIds(new Set());
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Кластеризация авторов - Загрузка</title>
        </Head>
        <div className="flex flex-col items-center justify-center h-96">
          <CircularProgress color="primary" />
          <Typography variant="h6" className="mt-4">
            Загрузка результатов кластеризации...
          </Typography>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Кластеризация авторов - Ошибка</title>
        </Head>
        <div className="p-6">
          <Alert 
            severity="error" 
            className="mb-4"
            action={
              <Button color="inherit" size="small" onClick={loadData}>
                Повторить
              </Button>
            }
          >
            {error}
          </Alert>
        </div>
      </>
    );
  }

  const filteredPoints = getFilteredPoints();

  return (
    <>
      <Head>
        <title>Визуализация кластеризации авторов</title>
      </Head>
      
      {/* Добавляем стили анимаций */}
      <style jsx global>{animationStyles}</style>
      
      <div className="p-6">
        <Typography variant="h4" className="mb-6">
          Визуализация кластеризации авторов
        </Typography>

        {/* Панель управления отметками */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <Autocomplete
                  multiple
                  open={autoCompleteOpen}
                  onOpen={() => setAutoCompleteOpen(true)}
                  onClose={() => setAutoCompleteOpen(false)}
                  options={points}
                  getOptionLabel={(option) => `${option.fio} (ID: ${option.author_id})`}
                  value={points.filter(point => markedAuthors.has(point.author_id))}
                  onChange={(event, newValue) => {
                    const newMarkedAuthors = new Set(newValue.map(author => author.author_id));
                    setMarkedAuthors(newMarkedAuthors);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Отметить авторов"
                      placeholder="Выберите авторов из списка"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        checked={selected}
                        icon={<BookmarkBorderIcon />}
                        checkedIcon={<BookmarkIcon color="primary" />}
                      />
                      <Box>
                        <Typography variant="body1">{option.fio}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {option.author_id} | Кластер: {option.cluster}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnlyMarked}
                      onChange={(e) => setShowOnlyMarked(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Только отмеченные"
                />
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearAllMarks}
                  disabled={markedAuthors.size === 0}
                  startIcon={<DeleteIcon />}
                  size="small"
                >
                  Очистить все
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={markSelectedAuthor}
                  disabled={!selectedPoint}
                  startIcon={<StarIcon />}
                  size="small"
                >
                  Отметить выбранного
                </Button>
              </div>
            </div>
            
            {/* Список отмеченных авторов */}
            {markedAuthors.size > 0 && (
              <div className="mt-4">
                <Typography variant="subtitle2" className="mb-2">
                  Отмеченные авторы ({markedAuthors.size}):
                </Typography>
                <Paper variant="outlined" className="max-h-40 overflow-y-auto">
                  <List dense>
                    {points
                      .filter(point => markedAuthors.has(point.author_id))
                      .map((point) => (
                        <ListItem key={point.author_id}>
                          <Chip
                            size="small"
                            label={`Кластер ${point.cluster}`}
                            style={{ 
                              backgroundColor: clusterColors[point.cluster % clusterColors.length],
                              color: 'white',
                              marginRight: '8px'
                            }}
                          />
                          {/* <ListItemText
                            primary={point.fio}
                            secondary={`ID: ${point.author_id} | Публикаций: ${point.publs_count}`}
                          /> */}
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => removeMark(point.author_id)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  </List>
                </Paper>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Информационная панель */}
        <Card className="mb-6">
          <CardContent className="flex flex-wrap gap-6">
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Всего авторов
              </Typography>
              <Typography variant="h6" color="primary">
                {showOnlyMarked ? `${filteredPoints.length}/${points.length}` : points.length}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Количество кластеров
              </Typography>
              <Typography variant="h6" color="primary">
                {new Set(filteredPoints.map(p => p.cluster)).size}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Соавторов найдено
              </Typography>
              <Typography variant="h6" color="primary">
                {coauthorIds.size}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">
                Отмеченных авторов
              </Typography>
              <Typography variant="h6" color="warning.main">
                {markedAuthors.size}
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Основной контейнер */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Левая часть - график */}
          <div className="flex-1 relative">
            <Paper 
              elevation={3}
              className="relative overflow-hidden"
              style={{ 
                width: '100%', 
                height: '600px',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Сетка и точки */}
              <div 
                className="absolute inset-0"
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
                }}
              >
                
                {/* Точки */}
                {filteredPoints.map(point => {
                  const screenX = point.x * 7.5 + 400;
                  const screenY = -point.y * 7.5 + 300;
                  
                  // Проверяем статусы точки
                  const isSelected = selectedPoint?.author_id === point.author_id;
                  const isCoauthorPoint = isCoauthor(point.author_id);
                  const isMarkedPoint = isMarked(point.author_id);
                  
                  // Размеры в зависимости от статуса
                  const baseSize = 10;
                  const selectedSize = 30;
                  const coauthorSize = 25;
                  const markedSize = 22;
                  const hoverSize = 14;
                  
                  // Цвета и стили
                  const selectedBorderColor = '#000000';
                  const coauthorBorderColor = '#da6900ff';
                  const markedBorderColor = '#ffd700'; // Золотой цвет для отмеченных
                  const markedShadowColor = 'rgba(255, 215, 0, 0.8)';
                  const hoverBorderColor = '#45b7d1';
                  
                  // Фоновый цвет с учетом того, отмечен ли автор
                  let backgroundColor = clusterColors[point.cluster % clusterColors.length];
                  if (isMarkedPoint) {
                    // Делаем цвет более ярким для отмеченных авторов
                    backgroundColor = backgroundColor.replace('rgb', 'rgba').replace(')', ', 0.9)');
                  }
                  
                  return (
                    <div
                      key={point.author_id}
                      className="absolute rounded-full cursor-pointer transition-all duration-300"
                      style={{
                        left: `${screenX}px`,
                        top: `${screenY}px`,
                        width: isSelected ? `${selectedSize}px` : 
                               isCoauthorPoint ? `${coauthorSize}px` : 
                               isMarkedPoint ? `${markedSize}px` : `${baseSize}px`,
                        height: isSelected ? `${selectedSize}px` : 
                                isCoauthorPoint ? `${coauthorSize}px` : 
                                isMarkedPoint ? `${markedSize}px` : `${baseSize}px`,
                        backgroundColor: backgroundColor,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isSelected ? 40 : 
                                isMarkedPoint ? 35 : 
                                (isCoauthorPoint ? 20 : 10),
                        // Рамки в зависимости от статуса
                        border: isSelected ? `4px solid ${selectedBorderColor}` : 
                                isCoauthorPoint ? `3px solid ${coauthorBorderColor}` : 
                                isMarkedPoint ? `4px solid ${markedBorderColor}` : 'none',
                        // Тени
                        boxShadow: isSelected ? '0 0 15px rgba(0, 0, 0, 0.7)' :
                                   isCoauthorPoint ? '0 0 10px rgba(255, 215, 0, 0.8)' :
                                   isMarkedPoint ? `0 0 15px ${markedShadowColor}` : 'none',
                        // Анимации
                        animation: isCoauthorPoint ? 'pulse 1.5s infinite, glow 2s infinite' : 
                                   isMarkedPoint ? 'star-pulse 2s infinite' : 'none',
                        // Фильтры для яркости
                        filter: isCoauthorPoint ? 'brightness(1.2)' : 
                                isMarkedPoint ? 'brightness(1.3)' : 'brightness(1)'
                      }}
                      onClick={() => handlePointClick(point)}
                      onMouseEnter={(e) => {
                        if (!isSelected && !isCoauthorPoint && !isMarkedPoint) {
                          e.currentTarget.style.width = `${hoverSize}px`;
                          e.currentTarget.style.height = `${hoverSize}px`;
                          e.currentTarget.style.border = `2px solid ${hoverBorderColor}`;
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(69, 183, 209, 0.6)';
                          e.currentTarget.style.zIndex = '15';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected && !isCoauthorPoint && !isMarkedPoint) {
                          e.currentTarget.style.width = `${baseSize}px`;
                          e.currentTarget.style.height = `${baseSize}px`;
                          e.currentTarget.style.border = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.zIndex = '10';
                        }
                      }}
                      title={`${point.fio} (ID: ${point.author_id})`}
                    />
                  );
                })}
              </div>
            </Paper>

            {/* Панель управления масштабом */}
            <Card className="absolute top-4 right-4 shadow-lg">
              <CardContent className="p-2">
                <div className="flex flex-col items-center space-y-2">
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={zoomIn}
                    className="min-w-0 w-10 h-10"
                  >
                    <ZoomInIcon />
                  </Button>
                  <Typography variant="caption" className="text-center">
                    {scale.toFixed(1)}x
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={zoomOut}
                    className="min-w-0 w-10 h-10"
                  >
                    <ZoomOutIcon />
                  </Button>
                  <Divider className="w-full my-1" />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={resetView}
                    className="text-xs"
                  >
                    Сброс
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Панель управления перемещением */}
            <Card className="absolute bottom-4 left-4 shadow-lg">
              <CardContent className="p-2">
                <div className="flex flex-col items-center space-y-1">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={moveUp}
                    className="min-w-0 w-10 h-8"
                  >
                    ↑
                  </Button>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={moveLeft}
                      className="min-w-0 w-10 h-8"
                    >
                      ←
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={moveRight}
                      className="min-w-0 w-10 h-8"
                    >
                      →
                    </Button>
                  </div>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={moveDown}
                    className="min-w-0 w-10 h-8"
                  >
                    ↓
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Легенда */}
            <Card className="absolute top-4 left-4 shadow-lg max-h-80 overflow-y-auto">
              <CardContent className="p-3">
                <Typography variant="subtitle2" className="font-semibold mb-2">
                  Легенда
                </Typography>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-black border-4 border-black" />
                    <Typography variant="body2">
                      Выбранный автор
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-5 h-5 rounded-full bg-blue-500 border-3 border-yellow-500"
                      style={{ 
                        animation: 'pulse 1.5s infinite, glow 2s infinite',
                        filter: 'brightness(1.2)'
                      }}
                    />
                    <Typography variant="body2">
                      Соавторы
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-5 h-5 rounded-full border-4 border-yellow-500"
                      style={{ 
                        backgroundColor: 'rgba(255, 215, 0, 0.2)',
                        animation: 'pulse 2s infinite',
                        boxSizing: 'border-box' // Добавляем это свойство
                      }}
                    />
                    <Typography variant="body2">
                      Отмеченные авторы
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <Typography variant="body2">
                      Обычные авторы
                    </Typography>
                  </div>
                  <Divider />
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Кластеры
                  </Typography>
                  {Array.from(new Set(filteredPoints.map(p => p.cluster)))
                    .sort((a, b) => a - b)
                    .map(cluster => (
                      <div key={cluster} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: clusterColors[cluster % clusterColors.length] }}
                        />
                        <Typography variant="body2">
                          Кластер {cluster}
                        </Typography>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая часть - информация об авторе */}
          <div className="lg:w-96">
            <Card className="h-full">
              <CardContent className="h-full flex flex-col">
                {selectedPoint ? (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <Typography variant="h6">
                        Информация об авторе
                      </Typography>
                      <div className="flex space-x-1">
                        <IconButton
                          size="small"
                          onClick={() => toggleMarkAuthor(selectedPoint.author_id)}
                          color={isMarked(selectedPoint.author_id) ? "warning" : "default"}
                          title={isMarked(selectedPoint.author_id) ? "Снять отметку" : "Отметить автора"}
                        >
                          {isMarked(selectedPoint.author_id) ? (
                            <StarIcon color="warning" />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
                        <Button 
                          size="small" 
                          onClick={clearConnections}
                          variant="outlined"
                          disabled={connections.length === 0}
                          className="text-xs"
                        >
                          Очистить связи
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => {
                            setSelectedPoint(null);
                            clearConnections();
                          }}
                          className="min-w-0"
                        >
                          <CloseIcon />
                        </Button>
                      </div>
                    </div>

                    <Typography variant="h6" className="mb-3">
                      {selectedPoint.fio}
                    </Typography>

                    <div className="flex items-center space-x-2 mb-4">
                      <Chip 
                        label={`Кластер ${selectedPoint.cluster}`}
                        style={{ 
                          backgroundColor: clusterColors[selectedPoint.cluster % clusterColors.length],
                          color: 'white'
                        }}
                      />
                      {isMarked(selectedPoint.author_id) && (
                        <Chip
                          icon={<StarIcon />}
                          label="Отмечен"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <Typography variant="subtitle2" color="textSecondary" className="mb-1">
                          ID автора
                        </Typography>
                        <Typography variant="body1">
                          {selectedPoint.author_id}
                        </Typography>
                      </div>

                      {/* <div>
                        <Typography variant="subtitle2" color="textSecondary" className="mb-1">
                          Количество публикаций
                        </Typography>
                        <Typography variant="body1">
                          {selectedPoint.publs_count}
                        </Typography>
                      </div> */}

                      <div>
                        <Typography variant="subtitle2" color="textSecondary" className="mb-1">
                          Соавторы на графике
                        </Typography>
                        <Typography variant="body1">
                          {loadingConnections ? (
                            <CircularProgress size={16} />
                          ) : (
                            `${connections.length} авторов`
                          )}
                        </Typography>
                      </div>
                    </div>

                    <div className="flex-1">
                      <Typography variant="subtitle2" color="textSecondary" className="mb-2">
                        Топ-термины
                      </Typography>
                      <div className="flex flex-wrap gap-2">
                        {selectedPoint.top_terms.map((term, index) => (
                          <Chip 
                            key={index}
                            label={term}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <TouchAppIcon className="text-4xl text-gray-400 mb-4" />
                    <Typography variant="h6" className="mb-2">
                      Выберите автора
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Нажмите на любую точку на графике, чтобы увидеть подробную информацию и связи с соавторами
                    </Typography>
                    <div className="mt-4 text-left">
                      <Typography variant="caption" className="block text-gray-600">
                        💡 Отмеченные авторы выделяются:
                      </Typography>
                      <Typography variant="caption" className="block text-gray-600">
                        • Увеличенным размером (22px вместо 10px)
                      </Typography>
                      <Typography variant="caption" className="block text-gray-600">
                        • Золотой рамкой с пульсирующим эффектом
                      </Typography>
                      <Typography variant="caption" className="block text-gray-600">
                        • Повышенной яркостью
                      </Typography>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Подсказки */}
        <Card className="mt-6">
          <CardContent>
            <Typography variant="subtitle2" className="font-semibold mb-2">
              💡 Управление визуализацией
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <MouseIcon className="text-gray-500" />
                <Typography variant="body2">
                  <strong>Колесико мыши</strong> — масштабирование
                </Typography>
              </div>
              <div className="flex items-center space-x-2">
                <PanToolIcon className="text-gray-500" />
                <Typography variant="body2">
                  <strong>ЛКМ + перетаскивание</strong> — перемещение графика
                </Typography>
              </div>
              <div className="flex items-center space-x-2">
                <TouchAppIcon className="text-gray-500" />
                <Typography variant="body2">
                  <strong>Клик по точке</strong> — выбор автора и отображение связей
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AuthorsClusteringPage;