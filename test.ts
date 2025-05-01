import { SignConfig, WebcastPushConnection } from './src/';
import { configDotenv } from 'dotenv';

configDotenv();

SignConfig.apiKey = 'NWYzOTJiYTQ5ZGMwOTRlMjI0NDBlOTY5NzM3NjQzMGFiNTQ3MGI3YmUwYjJlOTYwZTRhYjc3';

const client = new WebcastPushConnection('tv_asahi_news', {
    authenticateWs: false,
    sessionId: 'gotem',
    fetchRoomInfoOnConnect: false,
    enableExtendedGiftInfo: false,
    connectWithUniqueId: true,
    logFetchFallbackErrors: false
});

client.waitUntilLive().then(async () => {
    await client.connect();
    console.log('Connected!');
});


