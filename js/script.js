document.addEventListener('DOMContentLoaded', () => {
    const snowContainer = document.getElementById('snow-container');
    const snowToggleButton = document.getElementById('snow-toggle');
    const NUM_FLAKES = 50; // 생성할 눈송이 개수
    let snowInterval; // 눈송이 생성/제거를 위한 인터벌 ID

    // --- 1. 눈송이 생성 ---
    function createSnowflakes() {
        // 기존 눈송이 모두 제거
        snowContainer.innerHTML = ''; 

        for (let i = 0; i < NUM_FLAKES; i++) {
            const flake = document.createElement('div');
            flake.classList.add('snowflake');
            
            // 초기 위치 및 크기 랜덤 설정
            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.width = flake.style.height = `${Math.random() * 5 + 5}px`;
            
            // 애니메이션 속도 및 딜레이 랜덤 설정
            flake.style.animationDuration = `${Math.random() * 10 + 5}s`; // 애니메이션 시간
            flake.style.animationDelay = `${Math.random() * 10}s`;       // 시작 딜레이

            snowContainer.appendChild(flake);
        }
    }

    // --- 2. 토글 기능 (생성/제거 방식) ---
    function toggleSnow(turnOn) {
        if (turnOn) {
            // 눈 내림 시작 (이미 눈이 있다면 다시 생성)
            createSnowflakes();
            snowToggleButton.textContent = '❄️';
            localStorage.setItem('snowEnabled', 'true');
        } else {
            // 눈 내림 정지 (눈송이 모두 제거)
            snowContainer.innerHTML = ''; // 모든 눈송이 제거
            snowToggleButton.textContent = '☀️';
            localStorage.setItem('snowEnabled', 'false');
        }
    }
    
    // --- 3. 버튼 이벤트 리스너 ---
    snowToggleButton.addEventListener('click', () => {
        const isSnowCurrentlyEnabled = localStorage.getItem('snowEnabled') === 'true';
        toggleSnow(!isSnowCurrentlyEnabled); // 현재 상태 반전
    });

    // --- 4. 초기 로드 및 상태 복원 ---
    const savedSnowState = localStorage.getItem('snowEnabled');
    if (savedSnowState === 'false') {
        toggleSnow(false); // 눈 내림 정지 상태로 시작
    } else {
        toggleSnow(true); // 기본적으로 눈 내림 상태로 시작
    }

    
    // --- NEW: 1. D-Day 카운터 로직 ---
    function startCountdown() {
        const countdownEl = document.getElementById('countdown-timer');

        // 메인 페이지가 아닐 경우 실행하지 않음
        if (!countdownEl) return; 
        
        // 목표 날짜: 현재 연도의 12월 25일 자정
        const now = new Date();
        // 월은 0부터 시작하므로 11이 12월입니다.
        let targetDate = new Date(now.getFullYear(), 11, 25, 0, 0, 0); 

        // 만약 올해 크리스마스가 이미 지났다면, 내년 크리스마스를 목표로 설정
        if (now > targetDate) {
            targetDate = new Date(now.getFullYear() + 1, 11, 25, 0, 0, 0);
        }
        
        function updateCountdown() {
            const currentTime = new Date().getTime();
            const difference = targetDate - currentTime;

            if (difference < 0) {
                clearInterval(timerInterval);
                countdownEl.innerHTML = "🎁 MERRY CHRISTMAS! 🎁";
                return;
            }

            // 남은 일, 시, 분, 초 계산
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            countdownEl.innerHTML = `D-${days} <br> ${hours}시 ${minutes}분 ${seconds}초`;
        }

        const timerInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // 페이지 로드 시 즉시 표시
    }
    
    // D-Day 카운터 시작
    startCountdown(); 

    // --- NEW: 2. 배경 음악 (캐롤) 토글 로직 ---
    const audio = document.getElementById('christmas-carol');
    const musicToggleButton = document.getElementById('music-toggle');
    
    // 오디오 요소가 존재하는지 확인 (index.html에서만 실행)
    if (audio && musicToggleButton) {
        
        // 초기 상태 로드 (로컬 저장소에서 마지막 상태 복구)
        const savedMusicState = localStorage.getItem('musicEnabled') === 'true';
        if (savedMusicState) {
            // Note: 브라우저 보안 정책으로 인해 자동 재생은 일반적으로 막힙니다.
            musicToggleButton.textContent = '🔊'; 
        } else {
            musicToggleButton.textContent = '🔇';
        }

        musicToggleButton.addEventListener('click', () => {
            if (audio.paused) {
                // 재생 시도
                audio.play()
                    .then(() => {
                        musicToggleButton.textContent = '🔊';
                        localStorage.setItem('musicEnabled', 'true');
                    })
                    .catch(error => {
                        // 재생 실패 시 (예: 사용자 상호작용 부족)
                        console.error("Audio playback failed:", error);
                        alert("음악 재생을 위해 페이지와 상호작용한 후 다시 시도해 주세요.");
                        musicToggleButton.textContent = '🔇'; 
                        localStorage.setItem('musicEnabled', 'false');
                    });
            } else {
                // 일시 정지
                audio.pause();
                musicToggleButton.textContent = '🔇';
                localStorage.setItem('musicEnabled', 'false');
            }
        });
    }
    


});