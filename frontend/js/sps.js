    /* Audio Synthesizer */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(type) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      } else if (type === 'lose') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      } else if (type === 'draw') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      }
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    }

    /* Chalkboard Theme Engine */
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

    /* Game Logic Variables */
    const icons = { stone: "🪨", paper: "📄", scissors: "✂️" };
    const choices = ["stone", "paper", "scissors"];
    let userScore = 0;
    let botScore = 0;
    const winningScore = 5;
    let gameMode = 'bot';
    let summaryShareText = '';

    /* PeerJS WebRTC Infrastructure */
    let peer = null;
    let dataChannel = null;
    let currentRoomCode = '';
    let isHost = false;
    let peerConnected = false;
    let p1Choice = null;
    let p2Choice = null;

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
        if (dataChannel) { dataChannel.close(); dataChannel = null; }
        if (peer) { peer.destroy(); peer = null; }
        document.getElementById('p1LabelText').textContent = 'YOU';
        document.getElementById('p2LabelText').textContent = 'BOT';
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
      if (dataChannel) { dataChannel.close(); dataChannel = null; }
      if (peer) { peer.destroy(); peer = null; }

      currentRoomCode = code;
      isHost = host;
      updatePeerStatus(false, 'Connecting...');

      document.getElementById('p1LabelText').innerHTML = isHost ? 'YOU <span class="host-crown">👑</span>' : 'YOU';
      document.getElementById('p2LabelText').innerHTML = isHost ? 'OPPONENT' : 'OPPONENT <span class="host-crown">👑</span>';

      const peerId = isHost ? `sps_${code}` : undefined;
      peer = new Peer(peerId);

      peer.on('open', () => {
        if (!isHost) {
          dataChannel = peer.connect(`sps_${code}`);
          bindDataChannelEvents();
        }
      });

      peer.on('connection', (conn) => {
        if (isHost) {
          dataChannel = conn;
          bindDataChannelEvents();
        }
      });

      peer.on('error', (err) => {
        showToast('Connection error');
        updatePeerStatus(false, 'Failed');
      });

      resetGame(false);
    }

    function bindDataChannelEvents() {
      dataChannel.on('open', () => {
        updatePeerStatus(true, 'Connected');
        showToast('P2P Connection Established!');
        
        if (isHost) {
          sendP2PMessage({
            type: 'SYNC_STATE',
            userScore: userScore,
            botScore: botScore
          });
        }
      });

      dataChannel.on('close', () => {
        updatePeerStatus(false, 'Disconnected');
      });

      dataChannel.on('data', (data) => {
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
        if (isHost) p2Choice = data.choice;
        else p1Choice = data.choice;
        checkMultiplayerTurn();
      } else if (data.type === 'RESET') {
        resetGame(false);
      } else if (data.type === 'SYNC_STATE') {
        userScore = data.botScore;
        botScore = data.userScore;
        document.getElementById('userScore').textContent = userScore;
        document.getElementById('botScore').textContent = botScore;
      }
    }

    function setControlsState(enabled) {
      document.getElementById('btnStone').disabled = !enabled;
      document.getElementById('btnPaper').disabled = !enabled;
      document.getElementById('btnScissors').disabled = !enabled;
    }

    function playTurn(userChoice) {
      if (userScore >= winningScore || botScore >= winningScore) return;

      if (gameMode === 'bot') {
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        processRound(userChoice, botChoice);
      } else {
        if (!peerConnected) { showToast('Waiting for P2P connection'); return; }
        if (isHost) p1Choice = userChoice;
        else p2Choice = userChoice;

        document.getElementById('resultBanner').textContent = "Waiting for Opponent...";
        sendP2PMessage({ type: 'MOVE', choice: userChoice });
        checkMultiplayerTurn();
      }
    }

    function checkMultiplayerTurn() {
      if (p1Choice && p2Choice) {
        processRound(p1Choice, p2Choice);
        p1Choice = null;
        p2Choice = null;
      }
    }

    function processRound(c1, c2) {
      const myChoice = isHost ? c1 : c2;
      const oppChoice = isHost ? c2 : c1;

      document.getElementById('userDisplay').textContent = icons[myChoice];
      document.getElementById('botDisplay').textContent = icons[oppChoice];

      if (myChoice === oppChoice) {
        playSound('draw');
        document.getElementById('resultBanner').textContent = "It's a Draw!";
      } else if (
        (myChoice === "stone" && oppChoice === "scissors") ||
        (myChoice === "paper" && oppChoice === "stone") ||
        (myChoice === "scissors" && oppChoice === "paper")
      ) {
        playSound('win');
        userScore++;
        document.getElementById('userScore').textContent = userScore;
        document.getElementById('resultBanner').textContent = "You win this round!";
      } else {
        playSound('lose');
        botScore++;
        document.getElementById('botScore').textContent = botScore;
        document.getElementById('resultBanner').textContent = "Opponent wins this round!";
      }

      checkWinner();
    }

    function checkWinner() {
      if (userScore >= winningScore) {
        endGame("VICTORY!", `You won ${userScore} to ${botScore}!`);
      } else if (botScore >= winningScore) {
        endGame("DEFEAT!", `Opponent won ${botScore} to ${userScore}.`);
      }
    }

    function endGame(title, msg) {
      setControlsState(false);
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalMsg').textContent = msg;

      summaryShareText = `✂️ Stone Paper Scissors Results:\nResult: ${title}\nFinal Score: ${userScore} - ${botScore}\nPlay on ClassicSchoolGames!`;
      document.getElementById('shareResultText').textContent = `${title} | Score: ${userScore} - ${botScore}`;

      document.getElementById('gameOverModal').style.display = 'flex';
    }

    function shareResult() {
      if (navigator.share) {
        navigator.share({ title: 'SPS Game Result', text: summaryShareText }).catch(() => {});
      } else {
        navigator.clipboard.writeText(summaryShareText);
        showToast('Result copied to clipboard!');
      }
    }

    function resetGame(broadcast = true) {
      userScore = 0;
      botScore = 0;
      p1Choice = null;
      p2Choice = null;
      setControlsState(true);
      document.getElementById('userScore').textContent = "0";
      document.getElementById('botScore').textContent = "0";
      document.getElementById('userDisplay').textContent = "❓";
      document.getElementById('botDisplay').textContent = "❓";
      document.getElementById('resultBanner').textContent = "Make your move!";
      document.getElementById('gameOverModal').style.display = 'none';

      if (broadcast && gameMode === 'room') {
        sendP2PMessage({ type: 'RESET' });
      }
    }

    // Auto-join via URL query parameter if present
    window.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        switchMode('room');
        document.getElementById('roomCodeInput').value = roomParam;
        joinRoom();
      }
    });

