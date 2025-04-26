import { WebcastPushConnection } from './src/lib/client';

const client = new WebcastPushConnection('tv_asahi_news');


client.connect().then(() => {
    console.log('Connected babes!');
});
