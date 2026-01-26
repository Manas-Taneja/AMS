import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders with title and description', () => {
    render(
      <EmptyState
        title="No Data Found"
        description="There are no items to display"
      />
    );

    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display')).toBeInTheDocument();
  });

  it('renders only title when description is not provided', () => {
    render(<EmptyState title="No Data" />);

    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">Icon</span>;
    
    render(
      <EmptyState
        title="Empty"
        icon={<CustomIcon />}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders with action element', () => {
    render(
      <EmptyState
        title="No Items"
        action={<button>Add Item</button>}
      />
    );

    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
  });

  it('renders with onAction and actionLabel', () => {
    const handleClick = jest.fn();
    
    render(
      <EmptyState
        title="No Items"
        onAction={handleClick}
        actionLabel="Add Item"
      />
    );

    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
    
    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        className="custom-empty-state"
      />
    );

    const emptyState = container.querySelector('.custom-empty-state');
    expect(emptyState).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Title Only" />);
    
    expect(screen.getByText('Title Only')).toBeInTheDocument();
    // Verify description is not in the document
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });
});
