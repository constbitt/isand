import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConferencePersonHatCard from '@/src/components/Cards/ConferencePersonHat';

describe('ConferencePersonHatCard', () => {
  const mockConference = {
    conf_name: 'Научная конференция 2024',
    avatar: 'https://example.com/avatar.jpg',
    representative: true
  };

  it('renders conference name correctly', () => {
    render(
      <ConferencePersonHatCard
        conference={mockConference}
      />
    );
    
    const conferenceName = screen.getByText('Научная конференция 2024');
    expect(conferenceName).toBeInTheDocument();
    expect(conferenceName).toHaveClass('org-name-text');
  });

  it('renders avatar with correct props', () => {
    render(
      <ConferencePersonHatCard
        conference={mockConference}
      />
    );
    
    const avatar = screen.getByRole('img', { hidden: true });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', mockConference.avatar);
  });

  it('renders initials when avatar is not provided', () => {
    const conferenceWithoutAvatar = {
      conf_name: 'Научная конференция 2024',
      representative: true
    };

    render(
      <ConferencePersonHatCard
        conference={conferenceWithoutAvatar}
      />
    );
    
    const initials = screen.getByText('Нк');
    expect(initials).toBeInTheDocument();
  });

  it('applies custom styles when provided', () => {
    const customSx = {
      backgroundColor: 'red',
      padding: '20px'
    };

    const { container } = render(
      <ConferencePersonHatCard
        conference={mockConference}
        sx={customSx}
      />
    );
    
    const stack = container.querySelector('.MuiStack-root');
    expect(stack).toHaveStyle({
      backgroundColor: 'red',
      padding: '20px'
    });
  });

  it('renders with correct spacing and alignment', () => {
    const { container } = render(
      <ConferencePersonHatCard
        conference={mockConference}
      />
    );
    
    const stack = container.querySelector('.MuiStack-root');
    expect(stack).toHaveStyle({
      alignItems: 'center',
      justifyContent: 'center'
    });
  });

  it('handles representative status correctly', () => {
    render(
      <ConferencePersonHatCard
        conference={mockConference}
      />
    );
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('MuiTypography-root');
    expect(heading).toHaveClass('MuiTypography-h4');
    expect(heading).toHaveClass('org-name-text');

    const representativeText = screen.getByText('', { selector: 'p.MuiTypography-body2' });
    expect(representativeText).toHaveClass('MuiTypography-body2');
    expect(representativeText).toHaveStyle({ color: 'rgb(25, 118, 210)' });
  });
}); 