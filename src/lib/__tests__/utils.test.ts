import { cn } from '../utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toContain('bg-red-500');
    expect(result).toContain('text-white');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
  });

  it('removes false conditional classes', () => {
    const isActive = false;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).not.toContain('active-class');
  });

  it('handles tailwind merge conflicts', () => {
    // Later class should override earlier class
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('merges complex class strings', () => {
    const result = cn(
      'flex items-center justify-center',
      'bg-blue-500 hover:bg-blue-600',
      'text-white font-bold'
    );
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
  });

  it('handles empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles null and undefined inputs', () => {
    const result = cn('base-class', null, undefined, 'other-class');
    expect(result).toContain('base-class');
    expect(result).toContain('other-class');
  });

  it('handles array of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });

  it('resolves conflicting tailwind classes correctly', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    // Should only keep the last background color
    expect(result).toBe('bg-blue-500');
    expect(result).not.toContain('bg-red-500');
  });

  it('preserves non-conflicting tailwind classes', () => {
    const result = cn('bg-red-500 text-white', 'hover:bg-red-600');
    expect(result).toContain('bg-red-500');
    expect(result).toContain('text-white');
    expect(result).toContain('hover:bg-red-600');
  });
});
