const giftBasketImg = new Image();
giftBasketImg.src = 'assets/images/basket.png'; // 🎁 바구니 이미지

const santaImg = new Image();
santaImg.src = 'assets/images/santa.png'; // 🎅 산타 이미지

const rudolphImg = new Image();
rudolphImg.src = 'assets/images/rudolph.png'; // 🦌 루돌프 이미지

const GIFT_IMAGE_SOURCES = [
    'assets/images/gift_red.png',    // 1번 선물
    'assets/images/gift_blue.png',   // 2번 선물
    'assets/images/gift_green.png',  // 3번 선물
]; // 🎁 떨어지는 선물 이미지

const fallingGiftImgs = [];
GIFT_IMAGE_SOURCES.forEach(src => {
    const img = new Image();
    img.src = src;
    fallingGiftImgs.push(img);
})


document.addEventListener('DOMContentLoaded', () => {
    const gameSelection = document.querySelector('.game-selection');
    const gameArea = document.getElementById('game-area');

    // --- 게임 선택 핸들러 (기존 유지) ---
    gameSelection.addEventListener('click', (e) => {
        // ... (기존 로직 유지) ...
        const card = e.target.closest('.game-card');
        if (!card) return;

        const gameType = card.getAttribute('data-game');

        gameArea.className = 'game-area'; 
        gameArea.classList.add(gameType + '-bg'); // 배경 클래스 추가
        
        // 이전에 실행 중이던 게임 초기화 (필요시)
        gameArea.innerHTML = `<p>게임 로드 중: ${gameType}...</p>`;

        switch (gameType) {
            case 'falling-gifts':
                loadFallingGiftsGame();
                break;
            case 'santa-dodge':
                loadSantaDodgeGame(); // ✨ 이 함수가 실행됩니다.
                break;
            case 'snow-clicker':
                loadSnowClickerGame(); // ✨ 이 함수가 실행됩니다.
                break;
            default:
                gameArea.innerHTML = '<p>게임을 찾을 수 없습니다.</p>';
        }
    });

    // ===================================================================
    // 1. 선물 잡기 게임 (로직 유지)
    // ===================================================================
    function loadFallingGiftsGame() {
        // ... (기존 Falling Gifts 게임 로직 유지) ...
        gameArea.innerHTML = `
            <div id="game-controls">
                </div>
            <canvas id="fallingGiftsCanvas" width="600" height="400" style="background-color: transparent; border: 2px solid white; margin-top: 10px;"></canvas>
            <div id="gameOverMessage" style="color: red; font-size: 2em; display: none;">GAME OVER!</div>
        `;
        
        const canvas = document.getElementById('fallingGiftsCanvas');
        const ctx = canvas.getContext('2d');
        const startGameBtn = document.getElementById('startGameBtn');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const gameOverMessage = document.getElementById('gameOverMessage');

        let score = 0;
        let isGameOver = false;
        let animationFrameId;
        let giftInterval; // 선물 생성 인터벌 ID
        
        // --- 플레이어 (바구니) 설정 ---
        const player = {
            width: 60,
            height: 10,
            x: canvas.width / 2 - 30,
            y: canvas.height - 20,
            speed: 5,
            color: 'brown',
            movingLeft: false,
            movingRight: false,
            draw: function() {
                // 🚨 사각형 대신 이미지 그리기
                if (giftBasketImg.complete) {
                    ctx.drawImage(giftBasketImg, this.x, this.y, this.width, this.height);
                } else {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            }
        };

        // --- 선물 객체 배열 ---
        let gifts = [];

        // --- 선물 생성 함수 ---
        function createGift() {
             // 🚨 1. 무작위로 이미지 객체를 선택합니다.
            const randomGiftImg = fallingGiftImgs[Math.floor(Math.random() * fallingGiftImgs.length)];

            const gift = {
                size: Math.random() * 10 + 20, // 크기 15~25
                x: Math.random() * (canvas.width - 25),
                y: 0,
                speed: Math.random() * 1 + 1.5, // 속도 1.5 ~ 2.5
                color: 'red', // 대체 사각형 색상
                image: randomGiftImg, // 선택된 이미지 객체 저장
                
                draw: function() {
                    // 🚨 2. 저장된 이미지 객체를 그립니다.
                    if (this.image.complete) {
                        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
                    } else {
                        // 이미지가 없을 경우 대체 (기존 사각형 + 리본)
                        ctx.fillStyle = this.color;
                        ctx.fillRect(this.x, this.y, this.size, this.size);
                        ctx.fillStyle = 'white';
                        ctx.fillRect(this.x + this.size / 2 - 2, this.y, 4, this.size);
                        ctx.fillRect(this.x, this.y + this.size / 2 - 2, this.size, 4);
                    }
                }
            };
            gifts.push(gift);
        }

        // --- 충돌 감지 및 처리 ---
        function updateGame() {
            // 1. 화면 지우기
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 2. 플레이어 이동 처리
            if (player.movingLeft && player.x > 0) {
                player.x -= player.speed;
            }
            if (player.movingRight && player.x < canvas.width - player.width) {
                player.x += player.speed;
            }
            player.draw();

            // 3. 선물 업데이트 및 충돌 검사
            for (let i = 0; i < gifts.length; i++) {
                const gift = gifts[i];
                gift.y += gift.speed;
                gift.draw();

                // 🎁 충돌 검사 (선물이 바구니에 닿았는지)
                if (gift.y + gift.size >= player.y && 
                    gift.x + gift.size > player.x && 
                    gift.x < player.x + player.width) {
                    
                    score += 10;
                    scoreDisplay.textContent = `점수: ${score}`;
                    gifts.splice(i, 1); // 선물 제거
                    i--; // 인덱스 보정
                } 
                // ❌ 선물 놓침 (바닥에 닿았는지)
                else if (gift.y > canvas.height) {
                    isGameOver = true;
                    gameOverMessage.style.display = 'block';
                    gifts.splice(i, 1);
                    i--;
                }
            }
            
            // 4. 게임 루프 반복
            if (!isGameOver) {
                animationFrameId = requestAnimationFrame(updateGame);
            } else {
                // 게임 종료 시 선물 생성 인터벌 중지
                clearInterval(giftInterval);
            }
        }
        
        // --- 게임 시작/초기화 ---
        function startGame() {
            // 상태 초기화
            score = 0;
            gifts = [];
            isGameOver = false;
            player.x = canvas.width / 2 - 30;
            scoreDisplay.textContent = `점수: ${score}`;
            gameOverMessage.style.display = 'none';

            // 키보드 이벤트 리스너 (반복 추가 방지를 위해 한 번만 실행)
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
            
            // 기존 애니메이션 프레임 중지 (혹시 모를 이전 실행 방지)
            cancelAnimationFrame(animationFrameId);
            
            // 게임 루프 시작
            updateGame();

            // 선물 생성 시작 (1초마다)
            clearInterval(giftInterval);
            giftInterval = setInterval(createGift, 1500);
        }

        // --- 키보드 이벤트 핸들러 ---
        function handleKeyDown(e) {
            if (isGameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                player.movingLeft = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                player.movingRight = true;
            }
        }

        function handleKeyUp(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                player.movingLeft = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                player.movingRight = false;
            }
        }

        // 시작 버튼 이벤트
        startGameBtn.addEventListener('click', startGame);

        // 클린업 함수는 페이지 이동 시 자동으로 제거되므로 생략 가능합니다.
    }


    // ===================================================================
    // ✨ NEW: 2. 산타 피하기 게임 로직 구현
    // ===================================================================
    let santaInterval; // 산타 생성 인터벌 ID
    let dodgeTimer;    // 시간 제한 타이머 ID

    function loadSantaDodgeGame() {
        const TIME_LIMIT = 30; // 30초 생존 목표

        // 게임 영역에 캔버스 삽입
        gameArea.innerHTML = `
            <div id="game-controls" style="margin-bottom: 10px;">
                </div>
            <canvas id="santaDodgeCanvas" width="600" height="400" style="background-color: transparent; border: 2px solid white;"></canvas>
            <div id="resultMessage" style="color: red; font-size: 2em; margin-top: 10px; display: none;"></div>
        `;

        const canvas = document.getElementById('santaDodgeCanvas');
        const ctx = canvas.getContext('2d');
        const startGameBtn = document.getElementById('startGameBtnDodge');
        const timeDisplay = document.getElementById('timeDisplay');
        const resultMessage = document.getElementById('resultMessage');

        let isGameOver = false;
        let timeRemaining = TIME_LIMIT;
        let animationFrameId;

        // --- 플레이어 (루돌프) 설정 ---
        const player = {
            size: 40,
            x: canvas.width / 2 - 10,
            y: canvas.height - 30,
            speed: 4,
            color: '#B7410E', // 루돌프 색상
            movingLeft: false,
            movingRight: false,
            draw: function() {
                // 🚨 원형 대신 루돌프 이미지 그리기
                if (rudolphImg.complete) {
                    ctx.drawImage(rudolphImg, this.x, this.y, this.size, this.size);
                } else {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        // --- 산타 객체 배열 ---
        let santas = [];

        // --- 산타 생성 함수 ---
        function createSanta() {
            const santa = {
                size: Math.random() * 10 + 20, // 크기 20~30
                x: Math.random() * (canvas.width - 30),
                y: 0,
                speed: Math.random() * 1.5 + 2.5, // 속도 2.5~4
                color: 'red',
                
                draw: function() {
                    // 🚨 산타 이미지 사용
                    if (santaImg.complete) {
                        ctx.drawImage(santaImg, this.x, this.y, this.size, this.size);
                    } else {
                        // 이미지가 없을 경우 대체 (기존 사각형)
                        ctx.fillStyle = this.color;
                        ctx.fillRect(this.x, this.y, this.size, this.size);
                    }
                }
            };
            santas.push(santa);
        }

        // --- 타이머 함수 ---
        function startTimer() {
            timeRemaining = TIME_LIMIT;
            timeDisplay.textContent = `남은 시간: ${timeRemaining}초`;

            clearInterval(dodgeTimer);
            dodgeTimer = setInterval(() => {
                timeRemaining--;
                timeDisplay.textContent = `남은 시간: ${timeRemaining}초`;

                if (timeRemaining <= 0) {
                    endGame(true); // 생존 성공
                }
            }, 1000);
        }

        // --- 게임 종료 함수 ---
        function endGame(isSuccess) {
            isGameOver = true;
            clearInterval(dodgeTimer);
            clearInterval(santaInterval);
            cancelAnimationFrame(animationFrameId);
            
            if (isSuccess) {
                resultMessage.style.color = 'lime';
                resultMessage.textContent = '🎉 생존 성공! 30초를 버텼습니다! 🎉';
            } else {
                resultMessage.style.color = 'red';
                resultMessage.textContent = 'GAME OVER! 산타에게 잡혔습니다.';
            }
            resultMessage.style.display = 'block';
            startGameBtn.textContent = '다시 시작';
        }

        // --- 게임 루프 ---
        function updateGame() {
            if (isGameOver) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. 플레이어 이동
            if (player.movingLeft && player.x > 0) {
                player.x -= player.speed;
            }
            if (player.movingRight && player.x < canvas.width - player.size) {
                player.x += player.speed;
            }
            player.draw();

            // 2. 산타 업데이트 및 충돌 검사
            for (let i = 0; i < santas.length; i++) {
                const santa = santas[i];
                santa.y += santa.speed;
                santa.draw();

                // 🚨 충돌 검사 (간단한 직사각형 충돌)
                if (player.x < santa.x + santa.size && 
                    player.x + player.size > santa.x && 
                    player.y < santa.y + santa.size && 
                    player.y + player.size > santa.y) {
                    
                    endGame(false); // 충돌 실패
                    return;
                } 
                // 산타가 바닥으로 떨어지면 제거
                else if (santa.y > canvas.height) {
                    santas.splice(i, 1);
                    i--;
                }
            }
            
            animationFrameId = requestAnimationFrame(updateGame);
        }

        // --- 게임 시작/초기화 ---
        function startGame() {
            isGameOver = false;
            santas = [];
            player.x = canvas.width / 2 - 10;
            resultMessage.style.display = 'none';
            startGameBtn.textContent = '게임 중...';

            // 키보드 이벤트
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            // 루프 및 타이머 시작
            cancelAnimationFrame(animationFrameId);
            updateGame();
            startTimer();

            // 산타 생성 시작 (밀집도를 높이기 위해 0.5초마다 생성)
            clearInterval(santaInterval);
            santaInterval = setInterval(createSanta, 350);
        }

        // --- 키보드 이벤트 핸들러 ---
        function handleKeyDown(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                player.movingLeft = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                player.movingRight = true;
            }
        }

        function handleKeyUp(e) {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                player.movingLeft = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                player.movingRight = false;
            }
        }

        startGameBtn.addEventListener('click', startGame);
    }

    // ===================================================================
    // ✨ NEW: 3. 눈송이 터뜨리기 로직 구현
    // ===================================================================
    
    function loadSnowClickerGame() {
        const MAX_SNOWFLAKES = 10;
        const GAME_DURATION = 15000; // 15초 게임
        
        gameArea.innerHTML = `
            <div id="clicker-controls" style="width: 80%; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <button id="startGameBtnClicker" class="button-red">게임 시작</button>
                <div style="text-align: right;">
                    <div id="clickerTimeDisplay" style="color: white; font-size: 1.2em;">시간: 15.00초</div>
                    <div id="clickerScoreDisplay" style="color: white; font-size: 1.2em;">점수: 0</div>
                </div>
            </div>
            <div id="snowClickerContainer" style="width: 100%; height: 80%; position: relative; border: 2px dashed #FFF; background-color: #2c3e50; border-radius: 8px;">
                </div>
            <div id="clickerResultMessage" style="color: lime; font-size: 1.5em; margin-top: 10px; display: none;"></div>
        `;

        const startGameBtn = document.getElementById('startGameBtnClicker');
        const container = document.getElementById('snowClickerContainer');
        const timeDisplay = document.getElementById('clickerTimeDisplay');
        const scoreDisplay = document.getElementById('clickerScoreDisplay');
        const resultMessage = document.getElementById('clickerResultMessage');

        let score = 0;
        let isGameRunning = false;
        let gameTimer;
        let snowflakeCreationInterval;

        // --- 눈송이 생성 ---
        function createSnowflake() {
            if (container.children.length >= MAX_SNOWFLAKES) return;

            const flake = document.createElement('button');
            flake.classList.add('snowflake-button');
            
            // 크기 랜덤 설정 (CSS에서 기본 스타일링)
            const size = Math.random() * 15 + 35; // 35px ~ 50px
            flake.style.width = `${size}px`;
            flake.style.height = `${size}px`;

            // 위치 랜덤 설정 (경계 내에서)
            const x = Math.random() * (container.clientWidth - size);
            const y = Math.random() * (container.clientHeight - size);
            flake.style.left = `${x}px`;
            flake.style.top = `${y}px`;
            
            flake.textContent = '❄️';
            
            flake.addEventListener('click', () => {
                if (!isGameRunning) return;
                score += 1;
                scoreDisplay.textContent = `점수: ${score}`;
                container.removeChild(flake);
            });

            container.appendChild(flake);
        }

        // --- 게임 타이머 ---
        function startTimer() {
            let startTime = Date.now();
            
            clearInterval(gameTimer);
            gameTimer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = GAME_DURATION - elapsed;
                
                if (remaining <= 0) {
                    clearInterval(gameTimer);
                    endGame();
                    timeDisplay.textContent = `시간: 0.00초`;
                    return;
                }
                
                timeDisplay.textContent = `시간: ${(remaining / 1000).toFixed(2)}초`;
            }, 50);
        }

        // --- 게임 종료 ---
        function endGame() {
            isGameRunning = false;
            clearInterval(snowflakeCreationInterval);
            container.style.pointerEvents = 'none'; // 클릭 방지
            startGameBtn.textContent = '다시 시작';
            
            // 최종 결과 메시지
            resultMessage.textContent = `게임 종료! 최종 점수: ${score}점`;
            resultMessage.style.display = 'block';
        }

        // --- 게임 시작/초기화 ---
        function startGame() {
            // 초기화
            score = 0;
            isGameRunning = true;
            resultMessage.style.display = 'none';
            scoreDisplay.textContent = `점수: ${score}`;
            timeDisplay.textContent = `시간: ${(GAME_DURATION / 1000).toFixed(2)}초`;
            container.innerHTML = ''; // 모든 눈송이 제거
            container.style.pointerEvents = 'auto';
            startGameBtn.textContent = '게임 중...';
            
            // 타이머 및 생성 인터벌 시작
            startTimer();
            clearInterval(snowflakeCreationInterval);
            snowflakeCreationInterval = setInterval(createSnowflake, 600);  //600ms
        }

        startGameBtn.addEventListener('click', startGame);
    }
    
    // 이 부분에 CSS를 인라인으로 추가하여 눈송이 버튼의 기본 스타일을 정의합니다.
    const style = document.createElement('style');
    style.textContent = `
        .snowflake-button {
            position: absolute;
            background-color: #ecf0f1;
            border: 3px solid #3498db;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.5em;
            line-height: 1;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: transform 0.1s ease-out;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
        }
        .snowflake-button:active {
            transform: scale(0.8);
        }
    `;
    document.head.appendChild(style);

});