const client = Redis.createClient({
    url: 'redis://redis:6380',
    host: '127.0.0.1',
    port: 6380,
    password: ''
});