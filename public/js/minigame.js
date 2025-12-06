// =========================
// 공통 이미지 로드
// =========================
const giftBasketImg = new Image();
giftBasketImg.src = 'assets/images/basket.png';

const santaImg = new Image();
santaImg.src = 'assets/images/santa.png';

const rudolphImg = new Image();
rudolphImg.src = 'assets/images/rudolph.png';

const GIFT_IMAGE_SOURCES = [
    'assets/images/gift_red.png',
    'assets/images/gift_blue.png',
    'assets/images/gift_green.png',
];

const fallingGiftImgs = [];
GIFT_IMAGE_SOURCES.forEach((src) => {
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

    // 🔑 현재 실행 중인 게임 정리용
    let currentCleanup = null;

    // 공통: Firebase 사용 가능 여부 체크
    function hasDb(listEl) {
        if (!window.db) {
            if (listEl) {
                listEl.innerHTML = '<li>Firebase 설정이 없어 랭킹 기능을 사용할 수 없어요.</li>';
            }
            console.warn('window.db가 없습니다. Firebase 초기화를 확인하세요.');
            return false;
        }
        return true;
    }

    // --- 게임 선택 카드 클릭 핸들러 ---
    gameSelection.addEventListener('click', (e) => {
        const card = e.target.closest('.game-card');
        if (!card) return;

        // 이전 게임 정리
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
    //    - 난이도 + 내 컴 최고 점수(localStorage)
    //    - 전체 랭킹(Firestore: falling-gifts-scores)
    // ===================================================================
    function loadFallingGiftsGame(gameArea) {
        const DIFFICULTY = {
            easy: {
                label: '쉬움',
                spawnInterval: 1300,
                speedMin: 1.4,
                speedMax: 2.1,
                spawnRange: 320,
            },
            normal: {
                label: '보통',
                spawnInterval: 950,
                speedMin: 1.8,
                speedMax: 2.7,
                spawnRange: 420,
            },
            hard: {
                label: '어려움',
                spawnInterval: 700,
                speedMin: 2.2,
                speedMax: 3.2,
                spawnRange: 540,
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
                    <div id="bestScoreDisplay" style="color: gold; font-size: 0.9em;">최고 점수(내 컴퓨터): 0</div>
                    <button id="resetFallingBest" class="button-green" style="margin-top:4px; font-size:0.8em; padding:4px 8px;">
                        내 최고 점수 초기화
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

        // 내 컴퓨터 최고 점수
        let bestScore = Number(localStorage.getItem('bestScore_fallingGifts')) || 0;
        bestScoreDisplay.textContent = `최고 점수(내 컴퓨터): ${bestScore}`;

        resetFallingBestBtn.addEventListener('click', () => {
            bestScore = 0;
            localStorage.removeItem('bestScore_fallingGifts');
            bestScoreDisplay.textContent = '최고 점수(내 컴퓨터): 0';
        });

        // ===== 🎄 Firestore 랭킹 영역 =====
        const rankingSection = document.createElement('section');
        rankingSection.id = 'fallingRanking';
        rankingSection.className = 'ranking-section';
        rankingSection.innerHTML = `
            <h3>🎄 선물 잡기 랭킹</h3>
            <p class="ranking-desc">이 Firebase 프로젝트
