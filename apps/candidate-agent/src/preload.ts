import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('agentApi', {
  validatePairing: (data: { code: string; backendUrl?: string }) =>
    ipcRenderer.invoke('pairing:validate', data),
  startMonitoring: (data: { sessionId: string; sessionToken: string; backendUrl?: string }) =>
    ipcRenderer.invoke('monitoring:start', data),
  stopMonitoring: () => ipcRenderer.invoke('monitoring:stop'),
  onObservation: (callback: (data: any) => void) => {
    ipcRenderer.on('scanner:observation', (_e, value) => callback(value));
  },
  onError: (callback: (err: string) => void) => {
    ipcRenderer.on('scanner:error', (_e, value) => callback(value));
  },
});
