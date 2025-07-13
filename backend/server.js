import express from 'express';
import route from './route.js';

const app = express();

// 1. request 속 JSON을 req.body에 parsing해서 넣어줌
app.use(express.json());
// 2. parsing 끝나면, '/' 링크로 들어오는 HTTP 요청들을 다 route.js로 넘어가서 처리
app.use('/', route);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`server running at PORT ${PORT}`);
});