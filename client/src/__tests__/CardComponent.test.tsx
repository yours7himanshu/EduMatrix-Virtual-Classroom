import { render, screen } from '@testing-library/react';
import React from 'react';
import CardComponent from '@/pages/Home/components/CardComponent';

describe('CardComponent', () => {
  it('renders title and description', () => {
    render(
      <CardComponent
        title="Real-time Collaboration"
        discription="Work together seamlessly in your virtual classroom."
        icon={<span data-testid="icon">*</span>}
      />
    );

    expect(screen.getByText('Real-time Collaboration')).toBeInTheDocument();
    expect(
      screen.getByText('Work together seamlessly in your virtual classroom.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});


