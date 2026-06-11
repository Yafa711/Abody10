import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

let currentState: NetworkState = {
  isConnected: true,
  isInternetReachable: true,
  type: null,
};

const listeners: Array<(state: NetworkState) => void> = [];

NetInfo.fetch().then(handleStateChange).catch(() => {});

function handleStateChange(netState: NetInfoState) {
  currentState = {
    isConnected: netState.isConnected ?? true,
    isInternetReachable: netState.isInternetReachable,
    type: netState.type,
  };
  listeners.forEach(fn => fn(currentState));
}

NetInfo.addEventListener(handleStateChange);

export function getNetworkState(): NetworkState {
  return currentState;
}

export function isOnline(): boolean {
  return currentState.isConnected && currentState.isInternetReachable !== false;
}

export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>(currentState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return state;
}

export function useIsOnline(): boolean {
  const network = useNetwork();
  return network.isConnected && network.isInternetReachable !== false;
}

export function waitForOnline(timeout = 30000): Promise<void> {
  if (isOnline()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for network')), timeout);
    const unsub = NetInfo.addEventListener((netState: NetInfoState) => {
      if (netState.isConnected && netState.isInternetReachable !== false) {
        clearTimeout(timer);
        unsub();
        resolve();
      }
    });
  });
}
