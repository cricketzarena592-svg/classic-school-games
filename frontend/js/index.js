    const usernameInput = document.getElementById('usernameInput');
    const savedUser = localStorage.getItem('csg_username') || 'Player1';
    usernameInput.value = savedUser;

    usernameInput.addEventListener('input', () => {
      const val = usernameInput.value.trim() || 'Player1';
      localStorage.setItem('csg_username', val);
    });

    function launchGame(page) {
      const user = usernameInput.value.trim() || 'Player1';
      window.location.href = `${page}?user=${encodeURIComponent(user)}`;
    }

    /* Share Button Handler */
    const shareBtn = document.getElementById('shareBtn');
    const shareLabel = document.getElementById('shareLabel');
    const shareUrl = "https://cricketzarena592-svg.github.io/classic-school-games/index.html";

    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        shareLabel.textContent = "Copied!";
        setTimeout(() => {
          shareLabel.textContent = "Share";
        }, 2000);
      }).catch(err => {
        console.error("Could not copy URL: ", err);
      });
    });

    /* About Modal Handler */
    const aboutBtn = document.getElementById('aboutBtn');
    const closeAboutBtn = document.getElementById('closeAboutBtn');
    const aboutModal = document.getElementById('aboutModal');

    aboutBtn.addEventListener('click', () => {
      aboutModal.classList.add('active');
    });

    closeAboutBtn.addEventListener('click', () => {
      aboutModal.classList.remove('active');
    });

    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        aboutModal.classList.remove('active');
      }
    });

    /* Theme Engine - Toggles Green Board / Black Board */
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');

    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeLabel.textContent = 'Blackboard';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeLabel.textContent = 'Greenboard';
      }
    }

    let currentPreference = localStorage.getItem('themePreference') || 'light';
    applyTheme(currentPreference);

    themeToggleBtn.addEventListener('click', () => {
      currentPreference = currentPreference === 'light' ? 'dark' : 'light';
      localStorage.setItem('themePreference', currentPreference);
      applyTheme(currentPreference);
    });

