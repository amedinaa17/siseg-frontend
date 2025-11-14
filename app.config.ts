import { ExpoConfig } from '@expo/config-types';
import 'dotenv/config';

const config: ExpoConfig = {
  name: 'SISEG',
  slug: 'SISEG',
  extra: {
    API_URL: process.env.API_URL,
  },
};

export default config;