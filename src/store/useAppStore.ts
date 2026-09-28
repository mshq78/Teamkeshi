import { useReducer, useEffect, useRef } from 'react';
import { appReducer } from './reducer';
import { loadState, saveState, STORAGE_KEY_V3 } from './persistence';
import { AppState } from './state';
import { AppAction } from './actions';

export interface UseAppStoreReturn {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

/**
 * Custom React hook that initializes state using pure loadState()
 * and automatically persists state changes to localStorage.
 * Other tabs of the same browser (e.g. operator + judge) are kept in sync
 * through the `storage` event, so one tab never overwrites the other's changes.
 */
export function useAppStore(): UseAppStoreReturn {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);
  const skipNextSaveRef = useRef(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  // Pick up changes written by other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY_V3 || e.newValue === null) return;
      skipNextSaveRef.current = true;
      dispatch({ type: 'IMPORT_BACKUP', payload: { state: loadState() } });
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { state, dispatch };
}
