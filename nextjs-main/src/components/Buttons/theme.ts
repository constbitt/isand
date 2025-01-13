import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        action: {
            disabled: '#bdbdbd', // Цвет неактивной кнопки
            disabledBackground: '#1B4596', // Фоновый цвет неактивной кнопки
        },
        // Другие настройки палитры...
    },
});

export default theme;