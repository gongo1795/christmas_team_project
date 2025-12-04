document.addEventListener('DOMContentLoaded', () => {
    const snowContainer = document.getElementById('snow-container');
    const snowToggleButton = document.getElementById('snow-toggle');
    const NUM_FLAKES = 50;

    // 눈송이 생성
    function createSnowflakes() {
        snowContainer.innerHTML = '';

        for (let i = 0; i < NUM_FLAKES; i++) {
            const flake = document.createElement('div');
            flake.classList.add('snowflake');
            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.width = flake.style.height = `${Math.random() * 5 + 5}px`;
            flake.style.animationDuration = `${Math.random() * 10 + 5}s`;
            flake.style.animationDelay = `${Math.random() * 10}s`;
            snowContainer.appendChild(flake);
        }
    }

    // 눈 내리기 토글
    function toggleSnow(turnOn) {
        if (!snowToggleButton) return;

        if (turnOn) {
            createSnowflakes();
            snowToggleButton.textContent = '❄️';
            localStorage.setItem('snowEnabled', 'true');
        } else {
            snowContainer.innerHTML = '';
            snowToggleButton.textContent = '☁️';
            localStorage.setItem('snowEnabled', 'false');
        }
    }

    if (snowToggleButton) {
        snowToggleButton.addEventListener('click', () => {
            const isSnowEnabled = localStorage.getItem('snowEnabled') === 'true';
            toggleSnow(!isSnowEnabled);
        });

        const savedSnowState = localStorage.getItem('snowEnabled');
        if (savedSnowState === 'false') {
            toggleSnow(false);
        } else {
            toggleSnow(true);
        }
    }

    // D-Day 카운트다운
    function startCountdown() {
        const countdownEl = document.getElementById('countdown-timer');
        if (!countdownEl) return;

        const now = new Date();
        let targetDate = new Date(now.getFullYear(), 11, 25, 0, 0, 0);
        if (now > targetDate) {
            targetDate = new Date(now.getFullYear() + 1, 11, 25, 0, 0, 0);
        }

        function updateCountdown() {
            const currentTime = Date.now();
            const diff = targetDate - currentTime;

            if (diff < 0) {
                clearInterval(timerInterval);
                countdownEl.innerHTML = '🎄 MERRY CHRISTMAS! 🎄';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdownEl.innerHTML = `D-${days} <br> ${hours}시간 ${minutes}분 ${seconds}초`;
        }

        const timerInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    startCountdown();

    // 배경 음악 토글
    const audio = document.getElementById('christmas-carol');
    const musicToggleButton = document.getElementById('music-toggle');

    if (audio && musicToggleButton) {
        const savedMusicState = localStorage.getItem('musicEnabled') === 'true';
        musicToggleButton.textContent = savedMusicState ? '🔊' : '🔈';
        if (savedMusicState) {
            audio.play().catch(() => {
                musicToggleButton.textContent = '🔈';
                localStorage.setItem('musicEnabled', 'false');
            });
        }

        musicToggleButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.play()
                    .then(() => {
                        musicToggleButton.textContent = '🔊';
                        localStorage.setItem('musicEnabled', 'true');
                    })
                    .catch((error) => {
                        console.error('Audio playback failed:', error);
                        alert('오디오 재생에 실패했습니다. 브라우저 설정을 확인해주세요.');
                        musicToggleButton.textContent = '🔈';
                        localStorage.setItem('musicEnabled', 'false');
                    });
            } else {
                audio.pause();
                musicToggleButton.textContent = '🔈';
                localStorage.setItem('musicEnabled', 'false');
            }
        });
    }
});
