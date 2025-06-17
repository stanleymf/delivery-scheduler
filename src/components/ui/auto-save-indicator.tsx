import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AutoSaveState, getAutoSaveStatusText, getAutoSaveStatusColor } from '@/lib/autoSave';
import { cn } from '@/lib/utils';

export interface AutoSaveIndicatorProps {
  state: AutoSaveState;
  className?: string;
  variant?: 'badge' | 'text' | 'minimal';
  showIcon?: boolean;
}

export function AutoSaveIndicator({ 
  state, 
  className,
  variant = 'badge',
  showIcon = true 
}: AutoSaveIndicatorProps) {
  const statusText = getAutoSaveStatusText(state);
  const statusColor = getAutoSaveStatusColor(state);

  const getIcon = () => {
    if (!showIcon) return '';
    
    if (state.isSaving) {
      return '💾';
    }
    if (state.hasUnsavedChanges) {
      return '📝';
    }
    if (state.lastSaved) {
      return '✅';
    }
    return '💾';
  };

  const getVariant = () => {
    if (state.isSaving) {
      return 'secondary';
    }
    if (state.hasUnsavedChanges) {
      return 'outline';
    }
    return 'default';
  };

  if (variant === 'badge') {
    return (
      <Badge 
        variant={getVariant()}
        className={cn(
          'text-xs',
          statusColor,
          state.isSaving && 'animate-pulse',
          className
        )}
      >
        {showIcon && <span className="mr-1">{getIcon()}</span>}
        {statusText.replace(/^[💾📝✅]\s*/, '')}
      </Badge>
    );
  }

  if (variant === 'text') {
    return (
      <span 
        className={cn(
          'text-sm font-medium',
          statusColor,
          state.isSaving && 'animate-pulse',
          className
        )}
      >
        {statusText}
      </span>
    );
  }

  if (variant === 'minimal') {
    return (
      <span 
        className={cn(
          'text-xs',
          statusColor,
          state.isSaving && 'animate-pulse',
          className
        )}
        title={statusText}
      >
        {getIcon()}
      </span>
    );
  }

  return null;
}

// Hook for managing auto-save indicator state
export function useAutoSaveIndicator(autoSaveState: AutoSaveState) {
  const [displayState, setDisplayState] = React.useState(autoSaveState);

  React.useEffect(() => {
    setDisplayState(autoSaveState);
  }, [autoSaveState]);

  return displayState;
} 