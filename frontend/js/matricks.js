    /* Vector SVG Hand Art */
    const SVG_TEMPLATES = {
      none: `<svg viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      load: `<svg viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 0 1 2 2v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-1.5"/></svg>`,
      shoot1: `<svg viewBox="0 0 24 24"><path d="M22 10H10a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2"/><path d="M10 10V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7"/><path d="M12 15v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3"/></svg>`,
      shield1: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      shoot2: `<svg viewBox="0 0 24 24"><path d="M22 8H10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2"/><path d="M22 14H10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2"/><path d="M12 18v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3"/></svg>`,
      shield2: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v8"/></svg>`,
      shoot3: `<svg viewBox="0 0 24 24"><path d="M22 6H10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2"/><path d="M22 12H10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2"/><path d="M22 18H10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2"/></svg>`,
      shield3: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 7v10M8 12h8"/></svg>`
    };

    function renderSVGs() {
      document.getElementById('p1Gesture').innerHTML = SVG_TEMPLATES.none;
      document.getElementById('p2Gesture').innerHTML = SVG_TEMPLATES.none;

      Object.keys(SVG_TEMPLATES).forEach(key => {
        const btnElem = document.getElementById(`svg-btn-${key}`);
        if (btnElem) {
          btnElem.innerHTML = SVG_TEMPLATES[key];
          const svg = btnElem.querySelector('svg');
          if (svg) svg.classList.add('btn-svg');
        }
      });
    }

    /* Web Audio Synthesizer */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'load') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      } else if (type === 'shoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      } else if (type === 'shield') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
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

    /* Game State & Interception Rules */
    let p1Loads = 0;
    let p2Loads = 0;
    let gameMode = 'bot';
    let p1Move = null;
    let p2Move = null;
    let summaryShareText = '';

    /* Peer-to-Peer / WebRTC Multiplayer Infrastructure */
    let peer = null;
    let dataConnection = null;
    let dataChannel = null;
    let currentRoomCode = '';
    let isHost = false;
    let peerConnected = false;
    const PEER_PREFIX = 'CSG_MATRICKS_';

    const MOVES = {
      load: { name: 'Load', cost: 0, tier: 0, type: 'load' },
      shoot1: { name: 'Gun (1)', cost: 1, tier: 1, type: 'gun' },
      shield1: { name: 'Shield (1)', cost: 0, tier: 1, type: 'shield' },
      shoot2: { name: 'Gun (2)', cost: 2, tier: 2, type: 'gun' },
      shield2: { name: 'Shield (2)', cost: 0, tier: 2, type: 'shield' },
      shoot3: { name: 'Gun (3)', cost: 3, tier: 3, type: 'gun' },
      shield3: { name: 'Shield (3)', cost: 0, tier: 3, type: 'shield' }
    };

    function showToast(msg) {
      const toast = document.getElementById('toastMsg');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }

    function updatePeerStatus(connected, text) {
      peerConnected = connected;
      const dot = document.getElementById('peerStatusDot');
      const label = document.getElementById('peerStatusText');
      if (dot) dot.classList.toggle('online', connected);
      if (label) label.textContent = text || (connected ? 'Connected' : 'Waiting...');
    }

    function switchMode(mode) {
      gameMode = mode;
      document.getElementById('modeBotBtn').classList.toggle('active', mode === 'bot');
      document.getElementById('modeRoomBtn').classList.toggle('active', mode === 'room');
      document.getElementById('roomControls').style.display = mode === 'room' ? 'flex' : 'none';

      if (mode === 'bot') {
        cleanupPeer();
        document.getElementById('p1Name').textContent = 'You';
        document.getElementById('p2Name').textContent = 'Opponent Bot';
        updatePeerStatus(false, 'Disconnected');
      }
      resetGame(false);
    }

    function createRoom() {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      document.getElementById('roomCodeInput').value = code;

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', code);
      window.history.pushState({}, '', newUrl);

      initRoom(code, true);
      navigator.clipboard.writeText(newUrl.href);
      showToast(`Room Created! Direct Link Copied: ${code}`);
    }

    function joinRoom() {
      const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
      if (!code) { showToast('Enter room code'); return; }

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', code);
      window.history.pushState({}, '', newUrl);

      initRoom(code, false);
      showToast(`Joining Room: ${code}`);
    }

    function initRoom(code, host) {
      cleanupPeer();

      currentRoomCode = code;
      isHost = host;
      updatePeerStatus(false, 'Connecting...');

      document.getElementById('p1Name').innerHTML = isHost ? 'You <span class="host-crown">👑</span>' : 'You';
      document.getElementById('p2Name').innerHTML = isHost ? 'Opponent' : 'Opponent <span class="host-crown">👑</span>';

      peer = new Peer(isHost ? PEER_PREFIX + code : undefined);
      peer.on('open', () => {
        if (isHost) {
          showToast(`Room Created: ${code}`);
        } else {
          dataConnection = peer.connect(PEER_PREFIX + code, { reliable: true });
          bindDataConnection(dataConnection);
        }
      });
      peer.on('connection', (connection) => {
        if (isHost) {
          dataConnection = connection;
          bindDataConnection(dataConnection);
        }
      });
      peer.on('error', (error) => {
        showToast(error.type === 'peer-unavailable' ? 'Room not found' : 'Connection failed');
        updatePeerStatus(false, 'Failed');
      });
      resetGame(false);
    }

    function cleanupPeer() {
      if (dataConnection) { dataConnection.close(); dataConnection = null; }
      if (peer) { peer.destroy(); peer = null; }
      dataChannel = null;
    }

    function bindDataConnection(connection) {
      connection.on('open', () => {
        dataChannel = connection;
        updatePeerStatus(true, 'Connected');
        showToast('P2P Connection Established!');
        if (isHost) {
          sendP2PMessage({ type: 'SYNC_STATE', p1Loads: p1Loads, p2Loads: p2Loads });
        }
      });
      connection.on('close', () => {
        updatePeerStatus(false, 'Disconnected');
        dataChannel = null;
      });
      connection.on('data', (data) => {
        handleP2PMessage(data);
      });
    }

    function sendP2PMessage(msg) {
      if (dataChannel && dataChannel.open) {
        dataChannel.send(msg);
      }
    }

    function handleP2PMessage(data) {
      if (data.type === 'MOVE') {
        if (isHost) p2Move = data.move;
        else p1Move = data.move;
        checkMultiplayerTurn();
      } else if (data.type === 'RESET') {
        resetGame(false);
      } else if (data.type === 'SYNC_STATE') {
        p1Loads = data.p2Loads;
        p2Loads = data.p1Loads;
        updateUI();
      }
    }

    function updateUI() {
      document.getElementById('p1Loads').textContent = `${p1Loads} Load${p1Loads === 1 ? '' : 's'}`;
      document.getElementById('p2Loads').textContent = `${p2Loads} Load${p2Loads === 1 ? '' : 's'}`;

      document.getElementById('btnShoot1').disabled = p1Loads < 1;
      document.getElementById('btnShoot2').disabled = p1Loads < 2;
      document.getElementById('btnShoot3').disabled = p1Loads < 3;
    }

    function getBotMove() {
      const valid = ['load', 'shield1', 'shield2', 'shield3'];
      if (p2Loads >= 1) valid.push('shoot1');
      if (p2Loads >= 2) valid.push('shoot2');
      if (p2Loads >= 3) valid.push('shoot3');

      if (p2Loads >= 3 && Math.random() < 0.7) return 'shoot3';
      if (p1Loads === 0 && Math.random() < 0.5) return 'load';

      return valid[Math.floor(Math.random() * valid.length)];
    }

    function playTurn(m1Key) {
      if (gameMode === 'bot') {
        const m2Key = getBotMove();
        processRound(m1Key, m2Key);
      } else {
        if (!peerConnected) { showToast('Waiting for P2P connection'); return; }
        if (isHost) p1Move = m1Key;
        else p2Move = m1Key;

        document.getElementById('statusBanner').textContent = "Waiting for Opponent move...";
        sendP2PMessage({ type: 'MOVE', move: m1Key });
        checkMultiplayerTurn();
      }
    }

    function checkMultiplayerTurn() {
      if (p1Move && p2Move) {
        processRound(p1Move, p2Move);
        p1Move = null;
        p2Move = null;
      }
    }

    function processRound(m1Key, m2Key) {
      const m1 = MOVES[m1Key];
      const m2 = MOVES[m2Key];

      p1Loads -= m1.cost;
      p2Loads -= m2.cost;

      if (m1Key === 'load') p1Loads++;
      if (m2Key === 'load') p2Loads++;

      document.getElementById('p1Gesture').innerHTML = SVG_TEMPLATES[m1Key];
      document.getElementById('p2Gesture').innerHTML = SVG_TEMPLATES[m2Key];

      playSound(m1.type === 'gun' ? 'shoot' : m1.type === 'shield' ? 'shield' : 'load');
      updateUI();

      setTimeout(() => evaluateMatch(m1, m2), 100);
    }

    function evaluateMatch(m1, m2) {
      let winner = null;
      let statusText = "Game Continues!";

      if (m1.type === 'gun' && m2.type === 'gun') {
        if (m1.tier > m2.tier) winner = 'p1';
        else if (m2.tier > m1.tier) winner = 'p2';
        else statusText = "Guns cancelled out!";
      } else if (m1.type === 'gun' && m2.type === 'shield') {
        if (m1.tier > m2.tier) winner = 'p1';
        else statusText = "Shield blocked the gun!";
      } else if (m1.type === 'shield' && m2.type === 'gun') {
        if (m2.tier > m1.tier) winner = 'p2';
        else statusText = "Shield blocked the gun!";
      } else if (m1.type === 'gun' && m2.type === 'load') {
        winner = 'p1';
      } else if (m1.type === 'load' && m2.type === 'gun') {
        winner = 'p2';
      }

      document.getElementById('statusBanner').textContent = statusText;

      if (winner) {
        const p1Won = winner === 'p1';
        const title = p1Won ? "YOU WIN!" : "YOU LOST!";
        const msg = p1Won ? `${m1.name} penetrated opponent's defense!` : `Opponent's ${m2.name} eliminated you!`;

        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMsg').textContent = msg;

        summaryShareText = `🖐️ Matricks Results:\nResult: ${title}\nFinal Action: ${m1.name} vs ${m2.name}\nPlay on ClassicSchoolGames!`;
        document.getElementById('shareResultText').textContent = `${title} | ${m1.name} vs ${m2.name}`;

        document.getElementById('gameOverModal').style.display = 'flex';
      }
    }

    function shareResult() {
      if (navigator.share) {
        navigator.share({ title: 'Matricks Result', text: summaryShareText }).catch(() => {});
      } else {
        navigator.clipboard.writeText(summaryShareText);
        showToast('Result copied to clipboard!');
      }
    }

    function resetGame(broadcast = true) {
      p1Loads = 0;
      p2Loads = 0;
      p1Move = null;
      p2Move = null;
      document.getElementById('p1Gesture').innerHTML = SVG_TEMPLATES.none;
      document.getElementById('p2Gesture').innerHTML = SVG_TEMPLATES.none;
      document.getElementById('statusBanner').textContent = "Choose your hand gesture!";
      document.getElementById('gameOverModal').style.display = 'none';
      if (broadcast && gameMode === 'room') {
        sendP2PMessage({ type: 'RESET' });
      }
      updateUI();
    }

    // Auto-join via URL query parameter if present
    window.addEventListener('DOMContentLoaded', () => {
      renderSVGs();
      updateUI();
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        switchMode('room');
        document.getElementById('roomCodeInput').value = roomParam;
        joinRoom();
      }
    });

