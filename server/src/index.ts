import { createApp } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT} (MOCK_MODE: ${config.MOCK_MODE})`);
});
