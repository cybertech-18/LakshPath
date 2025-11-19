import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.lakshpath.app',
  appName: 'LakshPath',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
    }
  },
  // server: {
  //   url: 'http://192.168.1.5:5173',
  //   cleartext: true
  // }
};

export default config;
