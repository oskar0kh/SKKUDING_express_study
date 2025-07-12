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
            console.error('파일 읽기 오류: ${err}');
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


// 'name'을 통해 특정 restaurant 정보 출력 (Query, Parameter, Body 사용)

// Query 형식
// URL : http://localhost:3000/find?name=먹거리 고을
//       -> 알아서 /backend/data/restaurants.json 으로 이동함

router.get('/find', (req, res) => {
    
    const name = req.query.name;

    const filePath = path.join(__dirname, 'data', 'restaurants.json');

    fs.readFile(filePath, 'utf-8', (err, data) => {

        if(err){
            console.log('파일 읽기 오류 : ${err}');
            return res.status(500).json({ error : '서버 오류'});
        }

        try{

            // 1. restaurants.json 파일 속 전체 json 데이터 가져오기
            const entire = JSON.parse(data);

            // 2. json 데이터들 중, 'restaurants' 배열만 추출
            const jsonData = entire.restaurants;

            // 3. restauratns 배열 안에서, name 이랑 같은 이름인 데이터 있는지 찾기
            const result = jsonData.find(r => r.name === name);

            // 4. 만약 못 찾았으면, 오류 log 전송
            if(!result) return res.status(404).json({ message : '데이터 못찾음'});

            // 5. result를 응답으로 전송
            res.send(result);

        } catch(parseErr){
            console.error('JSON 파싱 오류: ', parseErr);
            res.status(500).json({ error : 'JSON 파싱 실패'});
        }

    });
});

export default router;