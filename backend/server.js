import express from 'express';
import route from './route.js';

const app = express();

// '/' 링크로 들어오는 HTTP 요청들은, 다 route.js로 넘어가서 처리됨
app.use('/', route);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`server running at PORT ${PORT}`);
});