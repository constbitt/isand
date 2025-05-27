import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StyledAvatar from '@/src/components/Avatar/StyledAvatar';

describe('StyledAvatar', () => {
  const mockFio = 'Иванов Иван Иванович';
  const mockUrl = 'https://example.com/avatar.jpg';
  const mockWidth = 100;
  const mockHeight = 100;

  it('renders with initials when url is empty', () => {
    render(
      <StyledAvatar
        fio={mockFio}
        url=""
        width={mockWidth}
        height={mockHeight}
      />
    );
    
    const avatar = screen.getByText('ИИ');
    expect(avatar).toBeInTheDocument();
  });

  it('renders with image when url is provided', () => {
    render(
      <StyledAvatar
        fio={mockFio}
        url={mockUrl}
        width={mockWidth}
        height={mockHeight}
      />
    );
    
    const avatar = screen.getByRole('img', { hidden: true });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', mockUrl);
  });

  it('shows camera icon when editable is true', () => {
    render(
      <StyledAvatar
        fio={mockFio}
        url=""
        width={mockWidth}
        height={mockHeight}
        editable={true}
      />
    );
    
    const cameraIcon = screen.getByTestId('PhotoCameraIcon');
    expect(cameraIcon).toBeInTheDocument();
  });

  it('handles image load error correctly', () => {
    render(
      <StyledAvatar
        fio={mockFio}
        url="invalid-url"
        width={mockWidth}
        height={mockHeight}
      />
    );
    
    const avatar = screen.getByRole('img', { hidden: true });
    fireEvent.error(avatar);
    
    const initials = screen.getByText('ИИ');
    expect(initials).toBeInTheDocument();
  });

  it('has file input when editable is true', () => {
    render(
      <StyledAvatar
        fio={mockFio}
        url=""
        width={mockWidth}
        height={mockHeight}
        editable={true}
      />
    );
    
    const fileInput = screen.getByDisplayValue('');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('applies correct styles to container', () => {
    const { container } = render(
      <StyledAvatar
        fio={mockFio}
        url=""
        width={mockWidth}
        height={mockHeight}
      />
    );
    
    const boxContainer = container.querySelector('.MuiBox-root');
    expect(boxContainer).toHaveStyle({
      width: `${mockWidth}px`,
      height: `${mockHeight}px`
    });
  });
}); 