document.addEventListener('DOMContentLoaded', () => {
    const letterContainer = document.querySelector('.letter-container');
    const themeSelector = document.querySelector('.theme-selector');
    const themeButtons = document.querySelectorAll('.theme-button');
    const form = document.getElementById('letter-form');
    const feedback = document.getElementById('feedback');

    // 테마 및 색상 값 전송을 위한 숨겨진 입력 필드
    const themeInput = document.getElementById('theme_name');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const textColorInput = document.getElementById('textColor');

    // 테마별 색상 코드 매핑
    const themeColors = {
        'theme-parchment': { bg: '#FDF5E6', text: '#5D4037' },
        'theme-chocolate': { bg: '#5D4037', text: '#F5EFE6' },
        'theme-white': { bg: '#FFFFFF', text: '#000000' }
    };

    // --- 테마 및 색상 설정 로직 ---
    const themes = ['theme-parchment', 'theme-chocolate', 'theme-white'];

    function updateTheme(newTheme) {
        // UI 클래스 변경
        letterContainer.classList.remove(...themes);
        letterContainer.classList.add(newTheme);

        // 활성 버튼 표시
        themeButtons.forEach(button => button.classList.remove('active'));
        document.querySelector(`.theme-button[data-theme="${newTheme}"]`).classList.add('active');

        // 숨겨진 필드 값 설정
        themeInput.value = newTheme;
        const colors = themeColors[newTheme];
        if (colors) {
            backgroundColorInput.value = colors.bg;
            textColorInput.value = colors.text;
        }
    }

    // 기본 테마 설정
    function setDefaultTheme() {
        updateTheme('theme-parchment');
    }

    themeSelector.addEventListener('click', (e) => {
        const clickedButton = e.target.closest('.theme-button');
        if (!clickedButton) return;

        const newTheme = clickedButton.dataset.theme;
        updateTheme(newTheme);
    });

    setDefaultTheme();

    // --- 폼 제출 로직 ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // 폼 유효성 검사 (HTML5 required 속성 활용)
        if (!form.checkValidity()) {
            feedback.textContent = '모든 필드를 채워주세요!';
            feedback.className = 'feedback-message feedback-error';
            return;
        }

        feedback.textContent = "편지 전송 중...";
        feedback.className = 'feedback-message';

        emailjs.sendForm('service_obt6ibv', 'template_7ilulin', form)
            .then(function() {
                feedback.textContent = '🎉 편지가 성공적으로 전달되었습니다! 🎉';
                feedback.className = 'feedback-message feedback-success';
                form.reset(); // 폼 필드 초기화
                setDefaultTheme(); // 테마를 기본값으로 다시 설정
            }, function(error) {
                console.log('전송 실패:', error);
                feedback.textContent = '❌ 편지 전송에 실패했습니다. (콘솔 확인 요망)';
                feedback.className = 'feedback-message feedback-error';
            });
    });
});