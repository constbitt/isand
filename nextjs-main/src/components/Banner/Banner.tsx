import React from 'react';
import { useRouter } from 'next/router';
import logo from '@/src/assets/images/home/logo.svg';

const Banner: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClosed, setIsClosed] = React.useState(false);
  const [hasAppeared, setHasAppeared] = React.useState(false);
  const [isImageHovered, setIsImageHovered] = React.useState(false);
  const [isTextHovered, setIsTextHovered] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasAppeared(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen && !isClosed) return null;

  const handleClose = () => {
    setIsClosed(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        right: '5px',
        transform: isClosed ? 'translateX(320px)' : hasAppeared ? 'translateX(0)' : 'translateX(320px)',
        transition: 'transform 0.3s ease',
        width: '300px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.5)' : '0 4px 16px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: '10px',
          gap: '10px',
        }}
      >
        <img
          src={logo.src}
          alt="Логотип"
          style={{
            width: '50px',
            height: '50px',
            transform: isImageHovered ? 'scale(1.2)' : 'scale(1)', // Увеличение при наведении
            transition: 'transform 0.2s ease', // Плавный переход
          }}
          onMouseEnter={() => setIsImageHovered(true)} // Увеличение при наведении
          onMouseLeave={() => setIsImageHovered(false)} // Возврат к исходному размеру
          onClick={() => router.push('/')} // Переход на главную страницу
        />
        <span
          style={{
            fontWeight: 'bold',
            color: '#1B4596',
            fontSize: '24px',
            marginLeft: '20px',
            transform: isTextHovered ? 'scale(1.2)' : 'scale(1)', // Увеличение при наведении
            transition: 'transform 0.2s ease', // Плавный переход
          }}
          onMouseEnter={() => setIsTextHovered(true)} // Увеличение при наведении
          onMouseLeave={() => setIsTextHovered(false)} // Возврат к исходному размеру
          onClick={() => router.push('/')} // Переход на главную страницу
        >
          ИСАНД
        </span>
      </div>
      <div style={{ marginTop: '0px' }}>
        <span
          style={{
            display: 'block',
            color: '#1B4596',
            fontSize: '17px',
            marginBottom: '10px',
          }}
        >
          Информационная система анализа научной деятельности
        </span>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#1B4596',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 15px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              width: '90%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Перейти
          </button>
        </div>
      </div>
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: '#1B4596',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ✖
      </button>
    </div>
  );
};

export default Banner;
