import { useReducer, useEffect } from 'react';
import { appReducer } from './reducer';
import { loadState, saveState } from './persistence';
import { AppState } from './state';
import { AppAction } from './actions';

export interface UseAppStoreReturn {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

/**
 * Custom React hook that initializes state using pure loadState()
 * and automatically persists state changes to localStorage.
 */
export function useAppStore(): UseAppStoreReturn {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  return { state, dispatch };
}
