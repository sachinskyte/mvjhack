import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pandora.vault',
  appName: 'PandoraVault',
  webDir: 'dist',
  server: { androidScheme: "https" }

};

export default config;
