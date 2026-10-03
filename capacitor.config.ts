import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.traymbhkam.travelcrm',
  appName: 'Traymbhkam',
  webDir: 'public',
  server: {
    url: 'https://traymbhkam-crm.vercel.app',
    cleartext: true
  }
};

export default config;
