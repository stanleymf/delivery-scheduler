import { useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export interface AutoSaveConfig {
  delay?: number; // Debounce delay in milliseconds (default: 2000)
  showToast?: boolean; // Show save notifications (default: true)
  onSave?: (data: any) => Promise<void> | void; // Custom save function
  onError?: (error: Error) => void; // Error handler
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

// Auto-save hook for components
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void> | void,
  config: AutoSaveConfig = {}
) {
  const {
    delay = 2000,
    showToast = true,
    onSave,
    onError
  } = config;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<Date | null>(null);
  const hasUnsavedChangesRef = useRef(false);

  const save = useCallback(async (currentData: T) => {
    if (isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      hasUnsavedChangesRef.current = false;

      if (showToast) {
        toast.loading('💾 Auto-saving...', { id: 'auto-save' });
      }

      // Execute custom save logic first
      if (onSave) {
        await onSave(currentData);
      }

      // Execute main save function
      await saveFunction(currentData);

      lastSavedRef.current = new Date();
      lastDataRef.current = currentData;

      if (showToast) {
        toast.success('✅ Changes saved automatically', { 
          id: 'auto-save',
          duration: 2000 
        });
      }

    } catch (error) {
      hasUnsavedChangesRef.current = true;
      
      if (showToast) {
        toast.error('❌ Auto-save failed', { 
          id: 'auto-save',
          duration: 3000 
        });
      }

      if (onError && error instanceof Error) {
        onError(error);
      }

      console.error('Auto-save error:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [saveFunction, onSave, onError, showToast]);

  const scheduleAutoSave = useCallback((newData: T) => {
    // Check if data actually changed
    if (JSON.stringify(newData) === JSON.stringify(lastDataRef.current)) {
      return;
    }

    hasUnsavedChangesRef.current = true;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule new save
    timeoutRef.current = setTimeout(() => {
      save(newData);
    }, delay);
  }, [save, delay]);

  // Trigger auto-save when data changes
  useEffect(() => {
    scheduleAutoSave(data);
  }, [data, scheduleAutoSave]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save(data);
  }, [save, data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveNow,
    state: {
      isSaving: isSavingRef.current,
      lastSaved: lastSavedRef.current,
      hasUnsavedChanges: hasUnsavedChangesRef.current
    }
  };
}

// Standalone auto-save manager for complex scenarios
export class AutoSaveManager<T> {
  private data: T;
  private saveFunction: (data: T) => Promise<void> | void;
  private config: AutoSaveConfig;
  private timeout: NodeJS.Timeout | null = null;
  private lastData: T;
  private isSaving = false;
  private lastSaved: Date | null = null;
  private hasUnsavedChanges = false;
  private listeners: Array<(state: AutoSaveState) => void> = [];

  constructor(
    initialData: T,
    saveFunction: (data: T) => Promise<void> | void,
    config: AutoSaveConfig = {}
  ) {
    this.data = initialData;
    this.lastData = initialData;
    this.saveFunction = saveFunction;
    this.config = { delay: 2000, showToast: true, ...config };
  }

  updateData(newData: T) {
    // Check if data actually changed
    if (JSON.stringify(newData) === JSON.stringify(this.lastData)) {
      return;
    }

    this.data = newData;
    this.hasUnsavedChanges = true;
    this.notifyListeners();

    // Clear existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Schedule new save
    this.timeout = setTimeout(() => {
      this.save();
    }, this.config.delay);
  }

  private async save() {
    if (this.isSaving) return;

    try {
      this.isSaving = true;
      this.hasUnsavedChanges = false;
      this.notifyListeners();

      if (this.config.showToast) {
        toast.loading('💾 Auto-saving...', { id: 'auto-save-manager' });
      }

      // Execute custom save logic first
      if (this.config.onSave) {
        await this.config.onSave(this.data);
      }

      // Execute main save function
      await this.saveFunction(this.data);

      this.lastSaved = new Date();
      this.lastData = this.data;

      if (this.config.showToast) {
        toast.success('✅ Changes saved automatically', { 
          id: 'auto-save-manager',
          duration: 2000 
        });
      }

    } catch (error) {
      this.hasUnsavedChanges = true;
      
      if (this.config.showToast) {
        toast.error('❌ Auto-save failed', { 
          id: 'auto-save-manager',
          duration: 3000 
        });
      }

      if (this.config.onError && error instanceof Error) {
        this.config.onError(error);
      }

      console.error('Auto-save error:', error);
    } finally {
      this.isSaving = false;
      this.notifyListeners();
    }
  }

  saveNow() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.save();
  }

  getState(): AutoSaveState {
    return {
      isSaving: this.isSaving,
      lastSaved: this.lastSaved,
      hasUnsavedChanges: this.hasUnsavedChanges
    };
  }

  onStateChange(listener: (state: AutoSaveState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  destroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.listeners = [];
  }
}

// Helper for auto-save status indicator component
export interface AutoSaveIndicatorProps {
  state: AutoSaveState;
  className?: string;
}

export function getAutoSaveStatusText(state: AutoSaveState): string {
  if (state.isSaving) {
    return '💾 Saving...';
  }
  if (state.hasUnsavedChanges) {
    return '📝 Unsaved changes';
  }
  if (state.lastSaved) {
    const timeAgo = Math.floor((Date.now() - state.lastSaved.getTime()) / 1000);
    if (timeAgo < 60) {
      return `✅ Saved ${timeAgo}s ago`;
    } else if (timeAgo < 3600) {
      return `✅ Saved ${Math.floor(timeAgo / 60)}m ago`;
    } else {
      return `✅ Saved ${Math.floor(timeAgo / 3600)}h ago`;
    }
  }
  return '💾 Auto-save enabled';
}

export function getAutoSaveStatusColor(state: AutoSaveState): string {
  if (state.isSaving) {
    return 'text-blue-600';
  }
  if (state.hasUnsavedChanges) {
    return 'text-orange-600';
  }
  if (state.lastSaved) {
    return 'text-green-600';
  }
  return 'text-gray-500';
} 