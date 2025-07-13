import express from 'express';
import fs, { write } from 'fs';
import path from 'path';

const router = express.Router();

////
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
////

// [GET] 전체 json 데이터 가져오기
router.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'restaurants.json'); // /backend/data/resturants.json으로 이동

    fs.readFile(filePath, 'utf-8', (err, data) => {                  // 1. 파일 경로 (json 파일) 읽기
        if(err){
            console.error('파일 읽기 오류: ${err}');
            return res.status(500).json({ error : '파일 읽기 오류'}); // 2. return으로 아래 코드 실행되는거 막기
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


// [GET] 'name'을 통해 특정 restaurant 정보 출력 (Query, Parameter 사용)

// Query 형식
// URL : http://localhost:3000/find?name=먹거리 고을
//       -> 알아서 /backend/data/restaurants.json 으로 이동함

router.get('/find', (req, res) => {
    
    const name = req.query.name;

    const filePath = path.join(__dirname, 'data', 'restaurants.json');

    fs.readFile(filePath, 'utf-8', (err, data) => {

        if(err){
            console.error('파일 읽기 오류 : ${err}');
            return res.status(500).json({ error : '파일 읽기 오류'});
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

// [POST] restaurants.json에 restaurants 데이터 추가하기
router.post('/', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'restaurants.json');

    const newRestaurant = req.body; // 새로운 restaurant 배열 생성

    // 2. 기존 json파일에서, 새로운 restaurant이랑 이름 같은거 있는지 확인
    fs.readFile(filePath, 'utf-8', (err, data) => {
       
        if(err){
            console.error(`파일 읽기 오류 : ${err}`);
            return res.status(500).json({ error : '파일 읽기 오류'});
        }

        try {

            // 2-1. 전체 json 데이터 가져오기
            const entire = JSON.parse(data);

            // 2-2. 전체 json 데이터 중 restaurants 배열 가져오기
            const restaurantList = entire.restaurants; // 배열 생성

            // 2-3. 기존 restaurant의 name이랑 일치하는 새로운 name 있는지 확인
            const result = restaurantList.find(r => r.name === newRestaurant.name);
            
            // 2-4. 만약 기존 name이랑 같은게 있으면, error 반환
            if(result) return res.status(400).json({error : '이미 해당 맛집 정보가 존재합니다'});

            // 2-5. 만약 기존 name이랑 같은거 없으면, restaurants 배열에 새로운 restaurant 정보 추가
            restaurantList.push(newRestaurant);

            // 2-6. 수정된 restaurant 배열을 다시 JSON으로 저장
            const updated = JSON.stringify({restaurants : restaurantList}, null, 2);

            fs.writeFile(filePath, updated, 'utf-8', (writeErr) => {
            
                if(writeErr){
                    console.error(`파일 쓰기 오류 : ${writeErr}`);
                    return res.status(500).json({error : '파일 저장 실패'});
                }

                // json 저장 성공
                res.status(201).json(newRestaurant);
            
            });

        } catch(parseErr){

            console.error(`JSON 파싱 오류 : ${parseErr}`);
            res.status(500).json({error : 'JSON 파싱 실패'});

        }

    });
});

// [DELETE] 특정 name의 데이터 삭제
// Query 방식 사용
// URL : http://localhost:3000/delete?name=먹거리 고을

router.delete('/delete', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'restaurants.json');

    const name = req.query.name; // 1. name 담은 query 생성

    fs.readFile(filePath, 'utf-8', (err, data) => {

        if(err){
            console.error(`파일 읽기 오류 : ${err}`);
            return res.status(500).json({error : '파일 읽기 오류'});
        }

        try{

            // 2. 전체 json 파일 가져오기
            const entire = JSON.parse(data);

            // 3. 그 중, restaurants 배열만 가져오기
            const restaurantList = entire.restaurants;

            // 4. 해당 배열에서 name이 같은거 있는지 찾기 (index 받아오기)
            const index = restaurantList.findIndex(r => r.name === name);

            // 5. index 못찾았을 때, error 반환
            if(index === -1) {
                return res.status(404).json({ error: '해당 맛집 정보가 존재하지 않습니다' });
            }

            // 6 해당 index의 데이터 삭제하기 (splice) -> removed array에 저장
            const removed = restaurantList.splice(index, 1);
            const removedItem = removed[0];

            // 7. 수정된 restaurantList를 다시 json 파일에 저장
            const updated = JSON.stringify({restaurants : restaurantList}, null, 2);

            fs.writeFile(filePath, updated, 'utf-8', (writeErr) => {

                if(writeErr){
                    console.error(`파일 쓰기 오류 : ${writeErr}`);
                    return res.status(500).json({error : '파일 저장 실패'});
                }

                // 7-1. json 저장 성공 -> 삭제된 데이터 저장한거 반환하기
                res.status(201).json(removedItem);

            });

        } catch(parseErr){
            console.error(`JSON 파싱 오류 : ${parseErr}`);
            res.status(500).json({error : 'JSON 파싱 실패'});
        }

    });
});

// [PATCH] 특정 name의 데이터 수정
// Query 사용
// URL : http://localhost:3000/update?name=생각나는 순대

router.patch('/update', (req, res) => {

    const filePath = path.join(__dirname, 'data', 'restaurants.json');
    const name = req.query.name;

    // 1. req.body에서 수정할 데이터 가져오기
    const updateFields = req.body;

    fs.readFile(filePath, 'utf-8', (err, data) => {

        if(err){
            console.error(`파일 읽기 오류 : ${err}`);
            return res.status(500).json({error : '파일 읽기 오류'});
        }

        try{
            
            // 2. 전체 json 파일 가져오기
            const entire = JSON.parse(data);

            // 3. 그 중, restaurants 배열만 가져오기
            const restaurantList = entire.restaurants;

            // 4. 해당 배열에서 name이 같은거 있는지 찾기
            const target = restaurantList.find(r => r.name === name);

            if(!target) return res.status(404).json({ error : '해당 맛집 정보가 존재하지 않습니다'});

            // 5. Object.assign() -> 찾은 부분의 정보 수정
            Object.assign(target, updateFields);
        
            // 6. 수정한 restaurantList 다시 json 파일에 저장하기
            const updated = JSON.stringify({restaurants : restaurantList}, null, 2);

            fs.writeFile(filePath, updated, 'utf-8', (writeErr) => {
	            if(writeErr) {
		            console.error(`파일 쓰기 오류: ${writeErr}`);
			        return res.status(500).json({ error: '파일 저장 실패' });
	            }

		           res.status(200).json(target); // 6-1. 수정된 결과 반환
            });

        } catch(parseErr){
            console.error(`JSON 파싱 오류: ${parseErr}`);
            res.status(500).json({ error: 'JSON 파싱 실패' });
        }

    });
});

export default router;