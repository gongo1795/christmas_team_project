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

        gameArea.innerHTML = `
            <p style="font-size:1.1rem; text-align:center; line-height:1.6; margin-top:40px;">
                🎮 미니게임을 시작하려면 <br>
                원하는 게임을 선택하고<br>
                <strong>난이도</strong>와 <strong>시작하기</strong> 버튼을 눌러주세요!
            </p>
        `;


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
    //    - 난이도 조정 + 범위 확대 + 하이스코어 + 리셋 버튼
    // ===================================================================
    function loadFallingGiftsGame(gameArea) {
        // 난이도 설정 (난이도 상향 + 범위 넓힘)
        const DIFFICULTY = {
            // 새 쉬움 = 기존 보통 느낌
            easy: {
                label: '쉬움',
                spawnInterval: 1300,
                speedMin: 1.4,
                speedMax: 2.1,
                spawnRange: 320,   // 범위 넓힘
            },
            // 새 보통 = 기존 어려움보다 약간 더 빡셈
            normal: {
                label: '보통',
                spawnInterval: 950,
                speedMin: 1.8,
                speedMax: 2.7,
                spawnRange: 420,   // 훨씬 넓게
            },
            // 새 어려움 = 하드코어 모드
            hard: {
                label: '어려움',
                spawnInterval: 700,
                speedMin: 2.2,
                speedMax: 3.2,
                spawnRange: 540,   // 거의 화면 전체
            },
        };
        let currentDifficulty = 'normal';

        gameArea.innerHTML = `
            <div id="game-controls" style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <label style="color:white; font-size:0.9em;">
                        난이도:
                        <select id="giftDifficulty" style="margin-left:4px; padding:4px 8px; border-radius:4px;">
                            <option value="easy">쉬움</option>
                            <option value="normal" selected>보통</option>
                            <option value="hard">어려움</option>
                        </select>
                    </label>
                    <button id="startGameBtn" class="button-red" style="margin-left:8px;">시작하기</button>
                </div>
                <div style="text-align:right;">
                    <div id="scoreDisplay" style="color: white; font-size: 1.0em;">점수: 0</div>
                    <div id="bestScoreDisplay" style="color: gold; font-size: 0.9em;">최고 점수: 0</div>
                    <button id="resetFallingBest" class="button-green" style="margin-top:4px; font-size:0.8em; padding:4px 8px;">
                        최고 점수 초기화
                    </button>
                </div>
            </div>
            <div style="font-size:0.85rem; color:#fff; margin-top:4px; opacity:0.8;">
                ⌨️ <strong>← →</strong> 키로 움직일 수 있어요!
            </div>
            <canvas id="fallingGiftsCanvas" width="600" height="400" style="background-color: transparent; border: 2px solid white; margin-top: 10px;"></canvas>
            <div id="gameOverMessage" style="color: red; font-size: 1.5em; display: none; margin-top:8px;">GAME OVER!</div>
        `;

        const canvas = document.getElementById('fallingGiftsCanvas');
        const ctx = canvas.getContext('2d');
        const startGameBtn = document.getElementById('startGameBtn');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const bestScoreDisplay = document.getElementById('bestScoreDisplay');
        const gameOverMessage = document.getElementById('gameOverMessage');
        const diffSelect = document.getElementById('giftDifficulty');
        const resetFallingBestBtn = document.getElementById('resetFallingBest');

        // 로컬스토리지에서 최고 점수 불러오기
        let bestScore = Number(localStorage.getItem('bestScore_fallingGifts')) || 0;
        bestScoreDisplay.textContent = `최고 점수: ${bestScore}`;

        // 최고 점수 초기화
        resetFallingBestBtn.addEventListener('click', () => {
            bestScore = 0;
            localStorage.removeItem('bestScore_fallingGifts');
            bestScoreDisplay.textContent = '최고 점수: 0';
        });
        // ===== 🎄 선물 잡기 랭킹 영역 생성 =====
        const rankingSection = document.createElement('section');
        rankingSection.id = 'fallingRanking';
        rankingSection.className = 'ranking-section';
        rankingSection.innerHTML = `
            <h3>🎄 선물 잡기 랭킹</h3>
            <p class="ranking-desc">상위 10명의 점수를 볼 수 있어요.</p>
            <div class="ranking-controls">
                <button id="refreshFallingRanking" class="button-green">랭킹 새로고침</button>
            </div>
            <ol id="fallingRankingList" class="ranking-list">
                <li>불러오는 중...</li>
            </ol>
        `;
        gameArea.appendChild(rankingSection);

        const rankingListEl = rankingSection.querySelector('#fallingRankingList');
        const refreshRankingBtn = rankingSection.querySelector('#refreshFallingRanking');

        function ensureDbForRanking() {
            if (!window.db) {
                rankingListEl.innerHTML = '<li>Firebase 설정이 없어 랭킹 기능을 사용할 수 없어요.</li>';
                return false;
            }
            return true;
        }

        // 🔽 Firestore에서 상위 10명 랭킹 읽어오기
        async function loadFallingRanking() {
            if (!ensureDbForRanking()) return;
            rankingListEl.innerHTML = '<li>불러오는 중...</li>';

            try {
                const snapshot = await window.db
                    .collection('falling-gifts-scores')
                    .orderBy('score', 'desc')
                    .orderBy('createdAt', 'asc')
                    .limit(10)
                    .get();

                if (snapshot.empty) {
                    rankingListEl.innerHTML = '<li>아직 등록된 점수가 없어요.</li>';
                    return;
                }

                let rank = 1;
                const items = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const rawNickname = (data.nickname || '익명').toString();
                    const safeNickname = rawNickname.replace(/[<>]/g, '');
                    const difficultyLabel = data.difficulty || '기본';

                    items.push(
                        `<li><strong>${rank}위</strong> ${safeNickname} — ${data.score}점 (${difficultyLabel})</li>`
                    );
                    rank++;
                });

                rankingListEl.innerHTML = items.join('');
            } catch (error) {
                console.error('랭킹 불러오기 오류', error);
                rankingListEl.innerHTML = '<li>랭킹을 불러오는 중 오류가 발생했어요.</li>';
            }
        }

        // 🔽 게임 끝난 점수 Firestore에 저장
        async function saveFallingScoreToRanking(scoreToSave) {
            if (!ensureDbForRanking()) return;
            if (scoreToSave <= 0) return;

            const storedNickname = localStorage.getItem('fallingNickname') || '';

            if (!confirm('이번 점수를 랭킹에 등록할까요?')) return;
            let nickname = prompt('랭킹에 표시할 닉네임을 입력해주세요 (최대 10자)', storedNickname || '');
            if (nickname === null) return;

            nickname = nickname.trim().slice(0, 10) || '익명';
            localStorage.setItem('fallingNickname', nickname);

            try {
                await window.db.collection('falling-gifts-scores').add({
                    nickname,
                    score: scoreToSave,
                    difficulty: currentDifficulty,
                    createdAt: window.firestoreTimestamp ? window.firestoreTimestamp() : Date.now(),
                });
                await loadFallingRanking();
            } catch (error) {
                console.error('랭킹 저장 오류', error);
                alert('랭킹을 저장하는 중 오류가 발생했어요.');
            }
        }

        // 버튼으로 랭킹 새로고침
        refreshRankingBtn.addEventListener('click', () => {
            loadFallingRanking();
        });

        // 페이지에 들어오면 한 번 랭킹 불러오기
        loadFallingRanking();

        diffSelect.addEventListener('change', () => {
            currentDifficulty = diffSelect.value;
        });

        let score = 0;
        let isGameOver = false;
        let animationFrameId = null;
        let giftInterval = null;

        const player = {
            width: 90,
            height: 40,
            x: canvas.width / 2 - 45,
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
            const cfg = DIFFICULTY[currentDifficulty];
            const randomGiftImg = fallingGiftImgs[Math.floor(Math.random() * fallingGiftImgs.length)];
            const size = Math.random() * 25 + 30;

            // 🎯 바구니 주변 기준으로, 난이도에 따라 더 넓은 범위에서 생성
            const range = cfg.spawnRange;
            const centerX = player.x + player.width / 2;
            let minX = centerX - range / 2;
            let maxX = centerX + range / 2 - size;

            if (minX < 0) minX = 0;
            if (maxX < 0) maxX = 0;
            if (maxX > canvas.width - size) maxX = canvas.width - size;

            const xPos = minX + Math.random() * (maxX - minX || 1);

            const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);

            const gift = {
                size: size,
                x: xPos,
                y: 0,
                speed: speed,
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

              function finishGame() {
            isGameOver = true;
            if (giftInterval) clearInterval(giftInterval);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            gameOverMessage.style.display = 'block';

            // 최고 점수 갱신 (내 컴퓨터 기준)
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore_fallingGifts', String(bestScore));
                bestScoreDisplay.textContent = `최고 점수: ${bestScore}`;
            }

            // 🔥 이번 점수를 랭킹에 저장 시도
            if (score > 0) {
                saveFallingScoreToRanking(score);
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
                // 바닥까지 떨어지면 게임 종료
                else if (gift.y > canvas.height) {
                    gifts.splice(i, 1);
                    i--;
                    finishGame();
                    return;
                }
            }

            if (!isGameOver) {
                animationFrameId = requestAnimationFrame(updateGame);
            }
        }

        function startGame() {
            const cfg = DIFFICULTY[currentDifficulty];

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
            giftInterval = setInterval(createGift, cfg.spawnInterval);
        }

        startGameBtn.addEventListener('click', startGame);

        // 🔚 cleanup 반환
        return function cleanupFallingGifts() {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (giftInterval) clearInterval(giftInterval);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }

    // ===================================================================
    // 2. 산타 피하기 게임 (SANTA DODGE)
    //    - 무제한 모드 + 난이도 조정 + 하이스코어 + 리셋 버튼
    // ===================================================================
    function loadSantaDodgeGame(gameArea) {
        // 난이도 설정 (전반적으로 더 어렵게)
        const DIFFICULTY = {
            // 새 쉬움 = 기존 보통 정도
            easy: {
                label: '쉬움',
                spawnInterval: 420,
                speedMin: 2.5,
                speedMax: 3.3,
            },
            // 새 보통 = 기존 어려움급
            normal: {
                label: '보통',
                spawnInterval: 300,
                speedMin: 3.0,
                speedMax: 4.0,
            },
            // 새 어려움 = 더 빡세게
            hard: {
                label: '어려움',
                spawnInterval: 210,
                speedMin: 3.5,
                speedMax: 4.8,
            },
        };
        let currentDifficulty = 'normal';

        gameArea.innerHTML = `
            <div id="game-controls" style="margin-bottom: 10px; width: 100%; display: flex; justify-content: space-between; align-items: center; gap:10px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <label style="color:white; font-size:0.9em;">
                        난이도:
                        <select id="santaDifficulty" style="margin-left:4px; padding:4px 8px; border-radius:4px;">
                            <option value="easy">쉬움</option>
                            <option value="normal" selected>보통</option>
                            <option value="hard">어려움</option>
                        </select>
                    </label>
                    <button id="startGameBtnDodge" class="button-green" style="margin-left:8px;">시작하기</button>
                </div>
                <div style="text-align:right;">
                    <div id="santaScoreDisplay" style="color: white; font-size: 1.0em;">점수: 0</div>
                    <div id="santaBestScoreDisplay" style="color: gold; font-size: 0.9em;">최고 점수: 0</div>
                    <button id="resetSantaBest" class="button-red" style="margin-top:4px; font-size:0.8em; padding:4px 8px;">
                        최고 점수 초기화
                    </button>
                </div>
            </div>
            <div style="font-size:0.85rem; color:#fff; margin-top:4px; opacity:0.8;">
                ⌨️ <strong>← →</strong> 키로 움직일 수 있어요!
            </div>
            <canvas id="santaDodgeCanvas" width="600" height="400" style="background-color: transparent; border: 2px solid white;"></canvas>
            <div id="resultMessage" style="color: red; font-size: 1.5em; margin-top: 10px; display: none;"></div>
        `;

        const canvas = document.getElementById('santaDodgeCanvas');
        const ctx = canvas.getContext('2d');
        const startGameBtn = document.getElementById('startGameBtnDodge');
        const resultMessage = document.getElementById('resultMessage');
        const santaScoreDisplay = document.getElementById('santaScoreDisplay');
        const santaBestScoreDisplay = document.getElementById('santaBestScoreDisplay');
        const diffSelect = document.getElementById('santaDifficulty');
        const resetSantaBestBtn = document.getElementById('resetSantaBest');

        // 하이스코어 불러오기
        let bestScore = Number(localStorage.getItem('bestScore_santaDodge')) || 0;
        santaBestScoreDisplay.textContent = `최고 점수: ${bestScore}`;

        // 최고 점수 초기화
        resetSantaBestBtn.addEventListener('click', () => {
            bestScore = 0;
            localStorage.removeItem('bestScore_santaDodge');
            santaBestScoreDisplay.textContent = '최고 점수: 0';
        });

        diffSelect.addEventListener('change', () => {
            currentDifficulty = diffSelect.value;
        });

        let isGameOver = false;
        let score = 0;
        let animationFrameId = null;
        let santaInterval = null;

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
            const cfg = DIFFICULTY[currentDifficulty];
            const size = Math.random() * 15 + 25;
            const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);

            const santa = {
                size: size,
                x: Math.random() * (canvas.width - size),
                y: 0,
                speed: speed,
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

        function endGame() {
            isGameOver = true;
            if (santaInterval) clearInterval(santaInterval);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            resultMessage.style.color = 'red';
            resultMessage.textContent = 'GAME OVER! 산타에게 잡혔습니다.';
            resultMessage.style.display = 'block';
            startGameBtn.textContent = '다시 시작';

            // 최고 점수 갱신
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore_santaDodge', String(bestScore));
                santaBestScoreDisplay.textContent = `최고 점수: ${bestScore}`;
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

                // 충돌 체크
                if (
                    player.x < santa.x + santa.size &&
                    player.x + player.size > santa.x &&
                    player.y < santa.y + santa.size &&
                    player.y + player.size > santa.y
                ) {
                    endGame();
                    return;
                } else if (santa.y > canvas.height) {
                    // 화면 아래로 나가면 "회피 성공" → 점수 +1
                    score += 1;
                    santaScoreDisplay.textContent = `점수: ${score}`;
                    santas.splice(i, 1);
                    i--;
                }
            }

            animationFrameId = requestAnimationFrame(updateGame);
        }

        function startGame() {
            const cfg = DIFFICULTY[currentDifficulty];

            isGameOver = false;
            santas = [];
            score = 0;
            player.x = canvas.width / 2 - player.size / 2;
            resultMessage.style.display = 'none';
            startGameBtn.textContent = '게임 중...';
            santaScoreDisplay.textContent = `점수: ${score}`;

            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (santaInterval) clearInterval(santaInterval);

            updateGame();
            santaInterval = setInterval(createSanta, cfg.spawnInterval);
        }

        startGameBtn.addEventListener('click', startGame);

        return function cleanupSantaDodge() {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (santaInterval) clearInterval(santaInterval);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }

    // ===================================================================
    // 3. 눈송이 클릭 게임 (SNOW CLICKER)
    //    - 난이도 조정 + 하이스코어 + 리셋 버튼
    // ===================================================================
    function loadSnowClickerGame(gameArea) {
        const DIFFICULTY = {
            // 새 쉬움 = 기존 보통
            easy: {
                label: '쉬움',
                duration: 15000,
                spawnInterval: 600,
                maxFlakes: 10,
            },
            // 새 보통 = 기존 어려움급
            normal: {
                label: '보통',
                duration: 12000,
                spawnInterval: 450,
                maxFlakes: 12,
            },
            // 새 어려움 = 더 짧은 시간 + 더 많은 눈송이
            hard: {
                label: '어려움',
                duration: 10000,
                spawnInterval: 350,
                maxFlakes: 14,
            },
        };
        let currentDifficulty = 'normal';

        gameArea.innerHTML = `
            <div id="clicker-controls" style="width: 100%; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <label style="color:white; font-size:0.9em;">
                        난이도:
                        <select id="clickerDifficulty" style="margin-left:4px; padding:4px 8px; border-radius:4px;">
                            <option value="easy">쉬움</option>
                            <option value="normal" selected>보통</option>
                            <option value="hard">어려움</option>
                        </select>
                    </label>
                    <button id="startGameBtnClicker" class="button-red" style="margin-left:8px;">게임 시작</button>
                </div>
                <div style="text-align: right;">
                    <div id="clickerTimeDisplay" style="color: white; font-size: 1.0em;">시간: 15.00초</div>
                    <div id="clickerScoreDisplay" style="color: white; font-size: 1.0em;">점수: 0</div>
                    <div id="clickerBestScoreDisplay" style="color: gold; font-size: 0.9em;">최고 점수: 0</div>
                    <button id="resetClickerBest" class="button-green" style="margin-top:4px; font-size:0.8em; padding:4px 8px;">
                        최고 점수 초기화
                    </button>
                </div>
            </div>
            <div id="snowClickerContainer"
                 style="width: 100%; min-height: 320px; position: relative;
                        border: 2px dashed #FFF; background-color: #2c3e50;
                        border-radius: 8px; overflow: hidden;"></div>
            <div id="clickerResultMessage" style="color: lime; font-size: 1.5em; margin-top: 10px; display: none;"></div>
        `;

        const startGameBtn = document.getElementById('startGameBtnClicker');
        const container = document.getElementById('snowClickerContainer');
        const timeDisplay = document.getElementById('clickerTimeDisplay');
        const scoreDisplay = document.getElementById('clickerScoreDisplay');
        const bestScoreDisplay = document.getElementById('clickerBestScoreDisplay');
        const resultMessage = document.getElementById('clickerResultMessage');
        const diffSelect = document.getElementById('clickerDifficulty');
        const resetClickerBestBtn = document.getElementById('resetClickerBest');

        let score = 0;
        let isGameRunning = false;
        let gameTimer = null;
        let snowflakeCreationInterval = null;

        // 하이스코어 불러오기
        let bestScore = Number(localStorage.getItem('bestScore_snowClicker')) || 0;
        bestScoreDisplay.textContent = `최고 점수: ${bestScore}`;

        // 최고 점수 초기화
        resetClickerBestBtn.addEventListener('click', () => {
            bestScore = 0;
            localStorage.removeItem('bestScore_snowClicker');
            bestScoreDisplay.textContent = '최고 점수: 0';
        });

        diffSelect.addEventListener('change', () => {
            currentDifficulty = diffSelect.value;
        });

        function createSnowflake() {
            const cfg = DIFFICULTY[currentDifficulty];
            if (container.children.length >= cfg.maxFlakes) return;

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

        function endGame() {
            isGameRunning = false;
            if (snowflakeCreationInterval) clearInterval(snowflakeCreationInterval);
            if (gameTimer) clearInterval(gameTimer);
            container.style.pointerEvents = 'none';
            startGameBtn.textContent = '다시 시작';

            // 하이스코어 갱신
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore_snowClicker', String(bestScore));
                bestScoreDisplay.textContent = `최고 점수: ${bestScore}`;
            }

            resultMessage.textContent = `게임 종료! 최종 점수: ${score}점`;
            resultMessage.style.display = 'block';
        }

        function startTimer() {
            const cfg = DIFFICULTY[currentDifficulty];
            const GAME_DURATION = cfg.duration;
            const startTime = Date.now();

            if (gameTimer) clearInterval(gameTimer);
            gameTimer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = GAME_DURATION - elapsed;

                if (remaining <= 0) {
                    timeDisplay.textContent = `시간: 0.00초`;
                    endGame();
                    return;
                }

                timeDisplay.textContent = `시간: ${(remaining / 1000).toFixed(2)}초`;
            }, 50);
        }

        function startGame() {
            const cfg = DIFFICULTY[currentDifficulty];

            score = 0;
            isGameRunning = true;
            resultMessage.style.display = 'none';
            scoreDisplay.textContent = `점수: ${score}`;
            timeDisplay.textContent = `시간: ${(cfg.duration / 1000).toFixed(2)}초`;
            container.innerHTML = '';
            container.style.pointerEvents = 'auto';
            startGameBtn.textContent = '게임 중...';

            startTimer();
            if (snowflakeCreationInterval) clearInterval(snowflakeCreationInterval);
            snowflakeCreationInterval = setInterval(createSnowflake, cfg.spawnInterval);
        }

        startGameBtn.addEventListener('click', startGame);

        return function cleanupSnowClicker() {
            if (gameTimer) clearInterval(gameTimer);
            if (snowflakeCreationInterval) clearInterval(snowflakeCreationInterval);
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
