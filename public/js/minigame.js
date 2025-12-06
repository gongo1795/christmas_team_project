// =========================
// 공통 이미지 로드
// =========================
const giftBasketImg = new Image();
giftBasketImg.src = '../assets/images/basket.png';

const santaImg = new Image();
santaImg.src = '../assets/images/santa.png';

const rudolphImg = new Image();
rudolphImg.src = '../assets/images/rudolph.png';

const GIFT_IMAGE_SOURCES = [
    '../assets/images/gift_red.png',
    '../assets/images/gift_blue.png',
    '../assets/images/gift_green.png',
];

const fallingGiftImgs = [];
GIFT_IMAGE_SOURCES.forEach(src => {
    const img = new Image();
    img.src = src;
    fallingGiftImgs.push(img);
});

// =========================
// DOMContentLoaded
// =========================
document.addEventListener('DOMContentLoaded', () => {
    const gameSelection = document.querySelector('.game-selection');
    const gameArea = document.getElementById('game-area');

    // 🔑 현재 실행 중인 게임을 정리하기 위한 cleanup 함수
    let currentCleanup = null;

    // --- 게임 선택 핸들러 ---
    gameSelection.addEventListener('click', (e) => {
        const card = e.target.closest('.game-card');
        if (!card) return;

        // 🔥 이전 게임 정리
        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }

        const gameType = card.getAttribute('data-game');

        // 배경 클래스 초기화 후 추가
        gameArea.className = 'game-area';
        gameArea.classList.add(gameType + '-bg');

        gameArea.innerHTML = `<p>게임 로드 중: ${gameType}...</p>`;

        switch (gameType) {
            case 'falling-gifts':
                currentCleanup = loadFallingGiftsGame(gameArea);
                break;
            case 'santa-dodge':
                currentCleanup = loadSantaDodgeGame(gameArea);
                break;
            case 'snow-clicker':
                currentCleanup = loadSnowClickerGame(gameArea);
                break;
            default:
                gameArea.innerHTML = '<p>게임을 찾을 수 없습니다.</p>';
        }
    });

    // ===================================================================
    // 1. 선물 잡기 게임 (FALLING GIFTS)
    // ===================================================================
    function loadFallingGiftsGame(gameArea) {
        gameArea.innerHTML = `
            <div id="game-controls">
                <button id="startGameBtn" class="button-red">시작하기</button>
                <div id="scoreDisplay" style="color: white; font-size: 1.2em; margin-top: 10px;">점수: 0</div>
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
        let animationFrameId = null;
        let giftInterval = null;

        const player = {
            width: 90,
            height: 40,
            x: canvas.width / 2 - 45, // 처음 중앙
            y: canvas.height - 50,
            speed: 5,
            color: 'brown',
            movingLeft: false,
            movingRight: false,
            draw: function () {
                if (giftBasketImg.complete) {
                    ctx.drawImage(giftBasketImg, this.x, this.y, this.width, this.height);
                } else {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            }
        };

        let gifts = [];

        function createGift() {
            const randomGiftImg = fallingGiftImgs[Math.floor(Math.random() * fallingGiftImgs.length)];

            const gift = {
                size: Math.random() * 25 + 30,
                x: Math.random() * (canvas.width - 25),
                y: 0,
                speed: Math.random() * 1 + 1.5,
                color: 'red',
                image: randomGiftImg,
                draw: function () {
                    if (this.image.complete) {
                        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
                    } else {
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

        function updateGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (player.movingLeft && player.x > 0) {
                player.x -= player.speed;
            }
            if (player.movingRight && player.x < canvas.width - player.width) {
                player.x += player.speed;
            }
            player.draw();

            for (let i = 0; i < gifts.length; i++) {
                const gift = gifts[i];
                gift.y += gift.speed;
                gift.draw();

                // 바구니에 닿으면 점수
                if (
                    gift.y + gift.size >= player.y &&
                    gift.x + gift.size > player.x &&
                    gift.x < player.x + player.width
                ) {
                    score += 10;
                    scoreDisplay.textContent = `점수: ${score}`;
                    gifts.splice(i, 1);
                    i--;
                }
                // 놓치면 게임 오버
                else if (gift.y > canvas.height) {
                    isGameOver = true;
                    gameOverMessage.style.display = 'block';
                    gifts.splice(i, 1);
                    i--;
                }
            }

            if (!isGameOver) {
                animationFrameId = requestAnimationFrame(updateGame);
            } else {
                if (giftInterval) clearInterval(giftInterval);
            }
        }

        function startGame() {
            score = 0;
            gifts = [];
            isGameOver = false;
            player.x = canvas.width / 2 - player.width / 2;
            scoreDisplay.textContent = `점수: ${score}`;
            gameOverMessage.style.display = 'none';

            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (giftInterval) clearInterval(giftInterval);

            updateGame();
            giftInterval = setInterval(createGift, 1500);
        }

        startGameBtn.addEventListener('click', startGame);

        // 🔚 이 게임에서 정리해야 할 것들 반환
        return function cleanupFallingGifts() {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (giftInterval) clearInterval(giftInterval);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }

    // ===================================================================
    // 2. 산타 피하기 게임 (SANTA DODGE)
    // ===================================================================
    function loadSantaDodgeGame(gameArea) {
        const TIME_LIMIT = 30;

        gameArea.innerHTML = `
            <div id="game-controls" style="margin-bottom: 10px; width: 100%; display: flex; justify-content: space-around; align-items: center;">
                <button id="startGameBtnDodge" class="button-green">시작하기</button>
                <div id="timeDisplay" style="color: white; font-size: 1.2em; margin-top: 10px;">남은 시간: ${TIME_LIMIT}초</div>
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
        let animationFrameId = null;
        let santaInterval = null;
        let dodgeTimer = null;

        const player = {
            size: 50,
            x: canvas.width / 2 - 25,
            y: canvas.height - 40,
            speed: 4,
            color: '#B7410E',
            movingLeft: false,
            movingRight: false,
            draw: function () {
                if (rudolphImg.complete) {
                    ctx.drawImage(rudolphImg, this.x, this.y, this.size, this.size);
                } else {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        let santas = [];

        function createSanta() {
            const santa = {
                size: Math.random() * 15 + 25,
                x: Math.random() * (canvas.width - 30),
                y: 0,
                speed: Math.random() * 1.5 + 2.5,
                color: 'red',
                draw: function () {
                    if (santaImg.complete) {
                        ctx.drawImage(santaImg, this.x, this.y, this.size, this.size);
                    } else {
                        ctx.fillStyle = this.color;
                        ctx.fillRect(this.x, this.y, this.size, this.size);
                    }
                }
            };
            santas.push(santa);
        }

        function startTimer() {
            timeRemaining = TIME_LIMIT;
            if (timeDisplay) timeDisplay.textContent = `남은 시간: ${timeRemaining}초`;

            if (dodgeTimer) clearInterval(dodgeTimer);
            dodgeTimer = setInterval(() => {
                timeRemaining--;
                if (timeDisplay) timeDisplay.textContent = `남은 시간: ${timeRemaining}초`;
                if (timeRemaining <= 0) {
                    endGame(true);
                }
            }, 1000);
        }

        function endGame(isSuccess) {
            isGameOver = true;
            if (dodgeTimer) clearInterval(dodgeTimer);
            if (santaInterval) clearInterval(santaInterval);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

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

        function updateGame() {
            if (isGameOver) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (player.movingLeft && player.x > 0) {
                player.x -= player.speed;
            }
            if (player.movingRight && player.x < canvas.width - player.size) {
                player.x += player.speed;
            }
            player.draw();

            for (let i = 0; i < santas.length; i++) {
                const santa = santas[i];
                santa.y += santa.speed;
                santa.draw();

                if (
                    player.x < santa.x + santa.size &&
                    player.x + player.size > santa.x &&
                    player.y < santa.y + santa.size &&
                    player.y + player.size > santa.y
                ) {
                    endGame(false);
                    return;
                } else if (santa.y > canvas.height) {
                    santas.splice(i, 1);
                    i--;
                }
            }

            animationFrameId = requestAnimationFrame(updateGame);
        }

        function startGame() {
            isGameOver = false;
            santas = [];
            player.x = canvas.width / 2 - player.size / 2;
            resultMessage.style.display = 'none';
            startGameBtn.textContent = '게임 중...';

            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (santaInterval) clearInterval(santaInterval);

            updateGame();
            startTimer();
            santaInterval = setInterval(createSanta, 350);
        }

        startGameBtn.addEventListener('click', startGame);

        return function cleanupSantaDodge() {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (santaInterval) clearInterval(santaInterval);
            if (dodgeTimer) clearInterval(dodgeTimer);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }

    // ===================================================================
    // 3. 눈송이 클릭 게임 (SNOW CLICKER)
    // ===================================================================
    function loadSnowClickerGame(gameArea) {
        const MAX_SNOWFLAKES = 10;
        const GAME_DURATION = 15000;

        gameArea.innerHTML = `
            <div id="clicker-controls" style="width: 80%; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <button id="startGameBtnClicker" class="button-red">게임 시작</button>
                <div style="text-align: right;">
                    <div id="clickerTimeDisplay" style="color: white; font-size: 1.2em;">시간: 15.00초</div>
                    <div id="clickerScoreDisplay" style="color: white; font-size: 1.2em;">점수: 0</div>
                </div>
            </div>
            <div id="snowClickerContainer" style="width: 100%; height: 80%; position: relative; border: 2px dashed #FFF; background-color: #2c3e50; border-radius: 8px;"></div>
            <div id="clickerResultMessage" style="color: lime; font-size: 1.5em; margin-top: 10px; display: none;"></div>
        `;

        const startGameBtn = document.getElementById('startGameBtnClicker');
        const container = document.getElementById('snowClickerContainer');
        const timeDisplay = document.getElementById('clickerTimeDisplay');
        const scoreDisplay = document.getElementById('clickerScoreDisplay');
        const resultMessage = document.getElementById('clickerResultMessage');

        let score = 0;
        let isGameRunning = false;
        let gameTimer = null;
        let snowflakeCreationInterval = null;

        function createSnowflake() {
            if (container.children.length >= MAX_SNOWFLAKES) return;

            const flake = document.createElement('button');
            flake.classList.add('snowflake-button');

            const size = Math.random() * 15 + 35;
            flake.style.width = `${size}px`;
            flake.style.height = `${size}px`;

            const x = Math.random() * (container.clientWidth - size);
            const y = Math.random() * (container.clientHeight - size);
            flake.style.left = `${x}px`;
            flake.style.top = `${y}px`;

            flake.textContent = '❄️';

            flake.addEventListener('click', () => {
                if (!isGameRunning) return;
                score += 1;
                scoreDisplay.textContent = `점수: ${score}`;
                if (flake.parentNode === container) {
                    container.removeChild(flake);
                }
            });

            container.appendChild(flake);
        }

        function startTimer() {
            const startTime = Date.now();

            if (gameTimer) clearInterval(gameTimer);
            gameTimer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = GAME_DURATION - elapsed;

                if (remaining <= 0) {
                    clearInterval(gameTimer);
                    timeDisplay.textContent = `시간: 0.00초`;
                    endGame();
                    return;
                }

                timeDisplay.textContent = `시간: ${(remaining / 1000).toFixed(2)}초`;
            }, 50);
        }

        function endGame() {
            isGameRunning = false;
            if (snowflakeCreationInterval) clearInterval(snowflakeCreationInterval);
            container.style.pointerEvents = 'none';
            startGameBtn.textContent = '다시 시작';

            resultMessage.textContent = `게임 종료! 최종 점수: ${score}점`;
            resultMessage.style.display = 'block';
        }

        function startGame() {
            score = 0;
            isGameRunning = true;
            resultMessage.style.display = 'none';
            scoreDisplay.textContent = `점수: ${score}`;
            timeDisplay.textContent = `시간: ${(GAME_DURATION / 1000).toFixed(2)}초`;
            container.innerHTML = '';
            container.style.pointerEvents = 'auto';
            startGameBtn.textContent = '게임 중...';

            startTimer();
            if (snowflakeCreationInterval) clearInterval(snowflakeCreationInterval);
            snowflakeCreationInterval = setInterval(createSnowflake, 600);
        }

        startGameBtn.addEventListener('click', startGame);

        return function cleanupSnowClicker() {
            if (gameTimer) clearInterval(gameTimer);
            if (snowflakeCreationInterval) clearInterval(snowflakeCreationInterval);
            // 컨테이너 안 버튼은 그냥 DOM에서 사라지므로 따로 이벤트 해제까지는 크게 필요 없음
        };
    }

    // =========================
    // 눈송이 버튼 기본 스타일 (한 번만 추가)
    // =========================
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
