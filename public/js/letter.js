document.addEventListener('DOMContentLoaded', () => {
    const letterContainer = document.querySelector('.letter-container');
    const themeSelector = document.querySelector('.theme-selector');
    const themeButtons = document.querySelectorAll('.theme-button');
    const form = document.getElementById('letter-form');
    const feedback = document.getElementById('feedback');

    const themeInput = document.getElementById('theme_name');

    // --- 테마 선택 로직 ---
    const themes = ['theme-parchment', 'theme-chocolate', 'theme-white'];

    // 기본 테마 설정
    function setDefaultTheme() {
        const defaultTheme = 'theme-parchment';
        letterContainer.classList.add(defaultTheme);
        document.querySelector(`.theme-button[data-theme="${defaultTheme}"]`).classList.add('active');
        themeInput.value = defaultTheme; // 숨겨진 필드에 기본값 설정
    }

    themeSelector.addEventListener('click', (e) => {
        const clickedButton = e.target.closest('.theme-button');
        if (!clickedButton) return;

        const newTheme = clickedButton.dataset.theme;

        // 모든 버튼에서 active 클래스 제거
        themeButtons.forEach(button => button.classList.remove('active'));
        // 클릭된 버튼에 active 클래스 추가
        clickedButton.classList.add('active');

        // 컨테이너에서 모든 테마 클래스 제거
        letterContainer.classList.remove(...themes);
        // 새로운 테마 클래스 추가
        letterContainer.classList.add(newTheme);

        // 숨겨진 필드에 새로운 테마 값 설정
        themeInput.value = newTheme;
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
                feedback.textContent = '🎉 편지가 성공적으로 산타에게 전달되었습니다! 🎉';
                feedback.className = 'feedback-message feedback-success';
                form.reset();
            }, function(error) {
                console.log('전송 실패:', error);
                feedback.textContent = '❌ 편지 전송에 실패했습니다. (콘솔 확인 요망)';
                feedback.className = 'feedback-message feedback-error';
            });
    });
});