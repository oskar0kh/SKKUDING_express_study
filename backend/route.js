import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

////
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
////

router.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'restaurants.json'); // /backend/data/resturants.json으로 이동

    fs.readFile(filePath, 'utf-8', (err, data) => {             // 1. 파일 경로 (json 파일) 읽기
        if(err){
            console.error('파일 읽기 오류: ', err);
            return res.status(500).json({ error : '서버 오류'}); // 2. return으로 아래 코드 실행되는거 막기
        }

        // 위에서 읽어온 json data 파싱 -> Client에게 전달
        try{

           const jsonData = JSON.parse(data); 
           res.json(jsonData);

        } catch(parseErr){

            console.error('JSON 파싱 오류: ', parseErr);
            res.status(500).json({error: 'JSON 파싱 실패'});

        }
    });
});

export default router;