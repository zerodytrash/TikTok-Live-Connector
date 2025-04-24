const { WebcastPushConnection } = require('./src');

const client = new WebcastPushConnection('tv_asahi_news');

client.on('connected', () => {
   console.log('Connected');
});

client.connect();
