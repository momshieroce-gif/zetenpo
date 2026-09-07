import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mynearshops.app',
  appName: 'My Near Shops',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
  },
};

export default config;