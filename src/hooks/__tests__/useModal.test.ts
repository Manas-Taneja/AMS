import { renderHook, act } from '@testing-library/react';
import { useModal, useConfirm, useFormModal, useMultiStepModal } from '../useModal';

describe('useModal', () => {
  it('initializes with closed state by default', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBe(false);
  });

  it('initializes with open state when initialOpen is true', () => {
    const { result } = renderHook(() => useModal({ initialOpen: true }));

    expect(result.current.isOpen).toBe(true);
  });

  it('opens modal', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('closes modal', () => {
    const { result } = renderHook(() => useModal({ initialOpen: true }));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('toggles modal state', () => {
    const { result } = renderHook(() => useModal());

    // Initially closed
    expect(result.current.isOpen).toBe(false);

    // Toggle to open
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    // Toggle to closed
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('calls onOpen callback when opened', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useModal({ onOpen }));

    act(() => {
      result.current.open();
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onClose callback when closed', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => useModal({ initialOpen: true, onClose }));

    act(() => {
      result.current.close();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('useConfirm', () => {
  it('initializes with closed state and default options', () => {
    const { result } = renderHook(() => useConfirm());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.title).toBe('Confirm Action');
    expect(result.current.message).toBe('Are you sure you want to proceed?');
    expect(result.current.confirmText).toBe('Confirm');
    expect(result.current.cancelText).toBe('Cancel');
    expect(result.current.variant).toBe('default');
  });

  it('accepts custom default options', () => {
    const { result } = renderHook(() => 
      useConfirm({
        title: 'Delete Item',
        message: 'This action cannot be undone',
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'destructive',
      })
    );

    expect(result.current.title).toBe('Delete Item');
    expect(result.current.message).toBe('This action cannot be undone');
    expect(result.current.confirmText).toBe('Delete');
    expect(result.current.cancelText).toBe('Keep');
    expect(result.current.variant).toBe('destructive');
  });

  it('opens with custom options', () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.open({
        title: 'Custom Title',
        message: 'Custom Message',
      });
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.title).toBe('Custom Title');
    expect(result.current.message).toBe('Custom Message');
  });

  it('closes confirmation dialog', () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });
});

describe('useFormModal', () => {
  it('initializes with closed state and no data', () => {
    const { result } = renderHook(() => useFormModal<{ name: string }>());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('opens with provided data', () => {
    const { result } = renderHook(() => useFormModal<{ name: string }>());
    const testData = { name: 'Test' };

    act(() => {
      result.current.open(testData);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toEqual(testData);
  });

  it('closes and clears data', () => {
    const { result } = renderHook(() => useFormModal<{ name: string }>());
    const testData = { name: 'Test' };

    act(() => {
      result.current.open(testData);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('calls onSave and closes on save', async () => {
    const onSave = jest.fn();
    const { result } = renderHook(() => 
      useFormModal<{ name: string }>({ onSave })
    );
    const testData = { name: 'Test' };

    act(() => {
      result.current.open();
    });

    await act(async () => {
      await result.current.save(testData);
    });

    expect(onSave).toHaveBeenCalledWith(testData);
    expect(result.current.isOpen).toBe(false);
  });

  it('calls onCancel and closes on cancel', () => {
    const onCancel = jest.fn();
    const { result } = renderHook(() => 
      useFormModal<{ name: string }>({ onCancel })
    );

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.cancel();
    });

    expect(onCancel).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });
});

describe('useMultiStepModal', () => {
  const steps = ['Step 1', 'Step 2', 'Step 3'];

  it('initializes with closed state at first step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps }));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentStep).toBe(0);
    expect(result.current.totalSteps).toBe(3);
    expect(result.current.stepName).toBe('Step 1');
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
  });

  it('opens modal at initial step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps }));

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.currentStep).toBe(0);
  });

  it('navigates to next step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps }));

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.next();
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.stepName).toBe('Step 2');
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);
  });

  it('navigates to previous step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps, initialStep: 1 }));

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.prev();
    });

    expect(result.current.currentStep).toBe(0);
    expect(result.current.stepName).toBe('Step 1');
  });

  it('does not go past last step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps, initialStep: 2 }));

    act(() => {
      result.current.open();
    });

    expect(result.current.isLastStep).toBe(true);

    act(() => {
      result.current.next();
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('does not go before first step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps }));

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.prev();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('jumps to specific step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps }));

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.goToStep(2);
    });

    expect(result.current.currentStep).toBe(2);
    expect(result.current.stepName).toBe('Step 3');
  });

  it('resets to initial step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps }));

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.goToStep(2);
    });

    expect(result.current.currentStep).toBe(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('closes modal and resets step', () => {
    const { result } = renderHook(() => useMultiStepModal({ steps }));

    act(() => {
      result.current.open();
    });

    act(() => {
      result.current.goToStep(2);
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentStep).toBe(0);
  });
});
