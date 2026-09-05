    /* Pre-populated Place Database */
    const PLACES = [
      "AFGHANISTAN", "ALBANIA", "ALGERIA", "ANDORRA", "ANGOLA", "ARGENTINA", "ARMENIA", "AUSTRALIA", "AUSTRIA", "AZERBAIJAN",
      "BAHAMAS", "BAHRAIN", "BANGLADESH", "BARBADOS", "BELGIUM", "BELIZE", "BENIN", "BHUTAN", "BOLIVIA", "BOTSWANA", "BRAZIL",
      "BULGARIA", "CAMBODIA", "CAMEROON", "CANADA", "CHILE", "CHINA", "COLOMBIA", "CONGO", "CROATIA", "CUBA", "CYPRUS", "CZECHIA",
      "DENMARK", "DJIBOUTI", "DOMINICA", "ECUADOR", "EGYPT", "ESTONIA", "ETHIOPIA", "FIJI", "FINLAND", "FRANCE", "GABON", "GAMBIA",
      "GEORGIA", "GERMANY", "GHANA", "GREECE", "GRENADA", "GUATEMALA", "GUINEA", "GUYANA", "HAITI", "HONDURAS", "HUNGARY", "ICELAND",
      "INDIA", "INDONESIA", "IRAN", "IRAQ", "IRELAND", "ISRAEL", "ITALY", "JAMAICA", "JAPAN", "JORDAN", "KAZAKHSTAN", "KENYA",
      "KIRIBATI", "KUWAIT", "LAOS", "LATVIA", "LEBANON", "LESOTHO", "LIBERIA", "LIBYA", "LITHUANIA", "LUXEMBOURG", "MADAGASCAR",
      "MALAWI", "MALAYSIA", "MALDIVES", "MALI", "MALTA", "MEXICO", "MICRONESIA", "MOLDOVA", "MONACO", "MONGOLIA", "MONTENEGRO",
      "MOROCCO", "MOZAMBIQUE", "MYANMAR", "NAMIBIA", "NEPAL", "NETHERLANDS", "NEW ZEALAND", "NICARAGUA", "NIGER", "NIGERIA",
      "NORWAY", "OMAN", "PAKISTAN", "PALAU", "PANAMA", "PARAGUAY", "PERU", "PHILIPPINES", "POLAND", "PORTUGAL", "QATAR", "ROMANIA",
      "RUSSIA", "RWANDA", "SAMOA", "SENEGAL", "SERBIA", "SINGAPORE", "SLOVAKIA", "SLOVENIA", "SOMALIA", "SPAIN", "SRI LANKA",
      "SUDAN", "SURINAME", "SWEDEN", "SWITZERLAND", "SYRIA", "TAIWAN", "TAJIKISTAN", "TANZANIA", "THAILAND", "TOGO", "TONGA",
      "TUNISIA", "TURKEY", "TURKMENISTAN", "TUVALU", "UGANDA", "UKRAINE", "URUGUAY", "UZBEKISTAN", "VANUATU", "VATICAN CITY",
      "VENEZUELA", "VIETNAM", "YEMEN", "ZAMBIA", "ZIMBABWE", "AMSTERDAM", "ATHENS", "BANGKOK", "BEIJING", "BERLIN", "DELHI",
      "DUBAI", "ISTANBUL", "LONDON", "MADRID", "MUMBAI", "NEW YORK", "PARIS", "ROME", "SEOUL", "TOKYO", "KERALA", "TEXAS", "CALIFORNIA"
    ];

    /* Helper: Retrieve Player Tag */
    function getMyTag() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('user') || localStorage.getItem('csg_username') || 'Player1';
    }

    /* Audio Synthesizer */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(type) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'valid') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      } else if (type === 'invalid') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      }
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    }

    /* Theme Engine */
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

    function showToast(msg) {
      const toast = document.getElementById('toastMsg');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }

    /* Modal System */
    function showInfoModal(title, msg) {
      document.getElementById('infoTitle').textContent = title;
      document.getElementById('infoMsg').textContent = msg;
      document.getElementById('infoModal').style.display = 'flex';
    }

    function closeInfoModal() {
      document.getElementById('infoModal').style.display = 'none';
      document.getElementById('placeInput').focus();
    }

    /* Game State Variables */
    let usedPlaces = new Set();
    let requiredLetter = "";
    let isPlayerTurn = true;
    let gameMode = 'bot';
    let peer = null;
    let activeConn = null;
    let currentRoomCode = '';
    let isHost = false;
    let opponentTag = 'Opponent';
    let summaryShareText = '';

    const PEER_PREFIX = 'CSG_ATLAS_';

    function switchMode(mode) {
      gameMode = mode;
      document.getElementById('modeBotBtn').classList.toggle('active', mode === 'bot');
      document.getElementById('modeRoomBtn').classList.toggle('active', mode === 'room');
      document.getElementById('roomControls').style.display = mode === 'room' ? 'flex' : 'none';
      cleanupPeer();
      resetGame();
    }

    function cleanupPeer() {
      if (activeConn) {
        activeConn.close();
        activeConn = null;
      }
      if (peer) {
        peer.destroy();
        peer = null;
      }
    }

    function copyRoomCode() {
      const inputElem = document.getElementById('roomCodeInput');
      const code = inputElem.value.trim();
      if (!code) {
        showToast('No code to copy');
        return;
      }
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Code ${code} copied!`);
      }).catch(() => {
        showToast(`Code: ${code}`);
      });
    }

    function setupDataConnection(conn) {
      activeConn = conn;

      activeConn.on('open', () => {
        showToast('Peer connected!');
        activeConn.send({ type: 'TAG_EXCHANGE', tag: getMyTag() });
        if (isHost) {
          setTurn(true);
        }
      });

      activeConn.on('data', (data) => {
        if (data.type === 'TAG_EXCHANGE') {
          opponentTag = data.tag || 'Opponent';
          if (!isPlayerTurn && gameMode === 'room') {
            document.getElementById('turnText').textContent = `${opponentTag}'s Turn...`;
          }
        } else if (data.type === 'MOVE') {
          processRemoteMove(data.word, data.player);
        } else if (data.type === 'RESET') {
          resetGame(false);
        }
      });

      activeConn.on('close', () => {
        showToast('Peer disconnected');
        activeConn = null;
      });

      activeConn.on('error', (err) => {
        showToast('Connection error');
      });
    }

    function createRoom() {
      cleanupPeer();
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const inputElem = document.getElementById('roomCodeInput');
      inputElem.value = code;
      currentRoomCode = code;
      isHost = true;

      const peerId = PEER_PREFIX + code;
      peer = new Peer(peerId);

      peer.on('open', () => {
        showToast(`Room Created: ${code}`);
      });

      peer.on('connection', (conn) => {
        setupDataConnection(conn);
      });

      peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          createRoom();
        } else {
          showToast('Failed to create room');
        }
      });

      resetGame(false);
      setTurn(false);
      document.getElementById('turnText').textContent = "Waiting for Opponent...";
    }

    function joinRoom() {
      const inputElem = document.getElementById('roomCodeInput');
      const code = inputElem.value.trim().toUpperCase();
      if (!code) { showToast('Enter room code'); return; }

      cleanupPeer();
      currentRoomCode = code;
      isHost = false;

      peer = new Peer();

      peer.on('open', () => {
        const hostPeerId = PEER_PREFIX + code;
        const conn = peer.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
          setupDataConnection(conn);
          showToast(`Joined Room: ${code}`);
        });

        conn.on('error', () => {
          showToast('Could not connect to host');
        });
      });

      peer.on('error', () => {
        showToast('Connection failed');
      });

      resetGame(false);
      setTurn(false);
      document.getElementById('turnText').textContent = `${opponentTag}'s Turn...`;
    }

    function handlePlayerSubmit(e) {
      e.preventDefault();
      if (!isPlayerTurn) return;

      const inputElem = document.getElementById('placeInput');
      const word = inputElem.value.trim().toUpperCase();

      if (!word) return;

      if (requiredLetter && word[0] !== requiredLetter) {
        playSound('invalid');
        showInfoModal("INVALID START LETTER", `Place must start with the letter '${requiredLetter}'!`);
        return;
      }

      if (usedPlaces.has(word)) {
        playSound('invalid');
        showInfoModal("ALREADY USED", `"${word}" has already been used in this game!`);
        return;
      }

      if (!PLACES.includes(word)) {
        playSound('invalid');
        showInfoModal("UNKNOWN PLACE", `"${word}" was not found in our atlas database!`);
        return;
      }

      playSound('valid');
      const myTag = getMyTag();
      addPlaceToHistory(myTag, word);
      inputElem.value = "";

      requiredLetter = word.slice(-1);
      updateBanner();

      if (gameMode === 'bot') {
        setTurn(false);
        setTimeout(botTurn, 1200);
      } else {
        if (activeConn && activeConn.open) {
          activeConn.send({ type: 'MOVE', word: word, player: myTag });
        }
        setTurn(false);
      }
    }

    function processRemoteMove(word, playerLabel) {
      playSound('valid');
      addPlaceToHistory(playerLabel, word);
      requiredLetter = word.slice(-1);
      updateBanner();
      setTurn(true);
    }

    function botTurn() {
      const candidates = PLACES.filter(p => p.startsWith(requiredLetter) && !usedPlaces.has(p));

      if (candidates.length === 0) {
        endGame("YOU WIN!", `Bot ran out of places starting with '${requiredLetter}'!`);
        return;
      }

      const botChoice = candidates[Math.floor(Math.random() * candidates.length)];
      playSound('valid');
      addPlaceToHistory('Bot', botChoice);

      requiredLetter = botChoice.slice(-1);
      updateBanner();
      setTurn(true);
    }

    function addPlaceToHistory(player, word) {
      usedPlaces.add(word);
      const historyBox = document.getElementById('historyBox');

      const entry = document.createElement('div');
      entry.className = 'history-entry';
      entry.innerHTML = `<span class="entry-player">${player}:</span> <span class="entry-word">${word.toLowerCase()}</span>`;

      historyBox.appendChild(entry);
      historyBox.scrollTop = historyBox.scrollHeight;
      document.getElementById('countText').textContent = usedPlaces.size;
    }

    function updateBanner() {
      document.getElementById('letterBanner').innerHTML = `Next place must start with: <span>${requiredLetter}</span>`;
    }

    function setTurn(playerTurn) {
      isPlayerTurn = playerTurn;
      const turnMsg = isPlayerTurn ? "Your Turn" : (gameMode === 'bot' ? "Bot Thinking..." : `${opponentTag}'s Turn...`);
      document.getElementById('turnText').textContent = turnMsg;
      document.getElementById('submitBtn').disabled = !isPlayerTurn;
      document.getElementById('placeInput').disabled = !isPlayerTurn;
      if (isPlayerTurn) document.getElementById('placeInput').focus();
    }

    function endGame(title, msg) {
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalMsg').textContent = msg;

      summaryShareText = `🌍 Atlas Game Results:\nResult: ${title}\nPlaces Named: ${usedPlaces.size}\nPlay on ClassicSchoolGames!`;
      document.getElementById('shareResultText').textContent = `${title} | ${usedPlaces.size} Places Named`;

      document.getElementById('gameOverModal').style.display = 'flex';
    }

    function shareResult() {
      if (navigator.share) {
        navigator.share({ title: 'Atlas Game Result', text: summaryShareText }).catch(() => {});
      } else {
        navigator.clipboard.writeText(summaryShareText);
        showToast('Result copied to clipboard!');
      }
    }

    function resetGame(broadcast = true) {
      usedPlaces.clear();
      requiredLetter = "";
      document.getElementById('historyBox').innerHTML = "";
      document.getElementById('countText').textContent = "0";
      document.getElementById('letterBanner').textContent = "Start the game with any place name!";
      document.getElementById('gameOverModal').style.display = 'none';
      if (broadcast && activeConn && activeConn.open) {
        activeConn.send({ type: 'RESET' });
      }
      setTurn(true);
    }

