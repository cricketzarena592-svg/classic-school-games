    /* 2D HTML5 Canvas Human Hand Drawing Engine */
    function drawHumanHand(canvas, number) {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      
      ctx.clearRect(0, 0, w, h);
      if (number === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Colors
      const skinGrad = ctx.createLinearGradient(0, 0, w, h);
      skinGrad.addColorStop(0, '#ffdbac');
      skinGrad.addColorStop(1, '#e0ac69');
      
      const strokeColor = '#8d5b4c';
      const detailColor = '#c68642';

      ctx.fillStyle = skinGrad;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = w * 0.035;

      const fingersExtended = {
        thumb:  number === 5 || number === 6,
        index:  number >= 1 && number <= 5,
        middle: number >= 2 && number <= 5,
        ring:   number >= 3 && number <= 5,
        pinky:  number >= 4 && number <= 5
      };

      // Wrist & Base Palm
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h);
      ctx.lineTo(w * 0.32, h * 0.75);
      ctx.bezierCurveTo(w * 0.2, h * 0.7, w * 0.18, h * 0.55, w * 0.28, h * 0.45);
      ctx.bezierCurveTo(w * 0.35, h * 0.38, w * 0.65, h * 0.38, w * 0.75, h * 0.48);
      ctx.bezierCurveTo(w * 0.82, h * 0.6, w * 0.8, h * 0.72, w * 0.68, h * 0.75);
      ctx.lineTo(w * 0.68, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      function drawExtendedFinger(x, yUp, yDown, width, angle = 0) {
        ctx.save();
        ctx.translate(x, yDown);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.rect(-width / 2, -(yDown - yUp), width, yDown - yUp);
        ctx.arc(0, -(yDown - yUp), width / 2, Math.PI, 0);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = detailColor;
        ctx.lineWidth = width * 0.2;
        ctx.beginPath();
        ctx.moveTo(-width * 0.3, -(yDown - yUp) * 0.5);
        ctx.lineTo(width * 0.3, -(yDown - yUp) * 0.5);
        ctx.stroke();
        ctx.restore();
      }

      function drawFoldedFinger(x, y, width) {
        ctx.beginPath();
        ctx.arc(x, y, width / 1.8, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
      }

      if (fingersExtended.index) drawExtendedFinger(w * 0.36, h * 0.12, h * 0.45, w * 0.11, -0.05);
      else drawFoldedFinger(w * 0.36, h * 0.45, w * 0.11);

      if (fingersExtended.middle) drawExtendedFinger(w * 0.48, h * 0.08, h * 0.44, w * 0.11, 0);
      else drawFoldedFinger(w * 0.48, h * 0.44, w * 0.11);

      if (fingersExtended.ring) drawExtendedFinger(w * 0.6, h * 0.12, h * 0.45, w * 0.10, 0.05);
      else drawFoldedFinger(w * 0.6, h * 0.45, w * 0.10);

      if (fingersExtended.pinky) drawExtendedFinger(w * 0.71, h * 0.2, h * 0.48, w * 0.09, 0.1);
      else drawFoldedFinger(w * 0.71, h * 0.48, w * 0.09);

      ctx.save();
      if (fingersExtended.thumb) {
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.62);
        ctx.bezierCurveTo(w * 0.12, h * 0.55, w * 0.08, h * 0.38, w * 0.22, h * 0.38);
        ctx.bezierCurveTo(w * 0.32, h * 0.38, w * 0.34, h * 0.52, w * 0.34, h * 0.55);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(w * 0.28, h * 0.62);
        ctx.quadraticCurveTo(w * 0.42, h * 0.58, w * 0.52, h * 0.62);
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = detailColor;
      ctx.lineWidth = w * 0.02;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.55);
      ctx.quadraticCurveTo(w * 0.48, h * 0.6, w * 0.68, h * 0.52);
      ctx.moveTo(w * 0.32, h * 0.65);
      ctx.quadraticCurveTo(w * 0.52, h * 0.72, w * 0.66, h * 0.62);
      ctx.stroke();

      ctx.restore();
    }

    function renderAllHands() {
      drawHumanHand(document.getElementById('p1Canvas'), 0);
      drawHumanHand(document.getElementById('p2Canvas'), 0);

      for (let i = 1; i <= 6; i++) {
        const btnCanvas = document.getElementById(`btnCanvas${i}`);
        if (btnCanvas) {
          drawHumanHand(btnCanvas, i);
        }
      }
    }

    /* Web Audio Synthesizer */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      } else if (type === 'out') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      }
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
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

    /* Modal Handler */
    let onModalCloseCallback = null;

    function showInfoModal(title, msg, callback = null) {
      document.getElementById('infoTitle').textContent = title;
      document.getElementById('infoMsg').textContent = msg;
      document.getElementById('infoModal').style.display = 'flex';
      onModalCloseCallback = callback;
    }

    function closeInfoModal() {
      document.getElementById('infoModal').style.display = 'none';
      if (onModalCloseCallback) {
        const cb = onModalCloseCallback;
        onModalCloseCallback = null;
        cb();
      }
    }

    /* Game State Variables */
    let p1Role = ''; 
    let currentInnings = 1;
    let currentScore = 0;
    let targetScore = null;
    let gameMode = 'bot';
    let p1RunChoice = null;
    let p2RunChoice = null;
    let summaryShareText = '';

    /* PeerJS WebRTC Infrastructure */
    let peer = null;
    let dataChannel = null;
    let currentRoomCode = '';
    let isHost = false;
    let peerConnected = false;

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
        document.getElementById('p1Name').textContent = 'You';
        document.getElementById('p2Name').textContent = 'Bot';
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

      document.getElementById('p1Name').innerHTML = isHost ? 'You <span class="host-crown">👑</span>' : 'You';
      document.getElementById('p2Name').innerHTML = isHost ? 'Opponent' : 'Opponent <span class="host-crown">👑</span>';

      const peerId = isHost ? `handcricket_${code}` : undefined;
      peer = new Peer(peerId);

      peer.on('open', () => {
        if (!isHost) {
          dataChannel = peer.connect(`handcricket_${code}`);
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
          document.getElementById('tossHeading').textContent = 'Toss Time!';
          document.getElementById('tossSubtext').textContent = 'Choose Heads or Tails';
          document.getElementById('tossOptionsBox').style.display = 'flex';
          document.getElementById('tossModal').style.display = 'flex';

          sendP2PMessage({
            type: 'SYNC_STATE',
            innings: currentInnings,
            score: currentScore,
            target: targetScore,
            p1Role: p1Role
          });
        } else {
          document.getElementById('tossHeading').textContent = 'Toss Time!';
          document.getElementById('tossSubtext').textContent = 'Waiting for Host to flip the coin...';
          document.getElementById('tossOptionsBox').style.display = 'none';
          document.getElementById('tossModal').style.display = 'flex';
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
        if (isHost) p2RunChoice = data.run;
        else p1RunChoice = data.run;
        checkMultiplayerTurn();
      } else if (data.type === 'RESET') {
        resetGame(false);
      } else if (data.type === 'TOSS_RESULT') {
        processTossOutcome(data.winnerIsHost, data.coinResult, data.calledValue);
      } else if (data.type === 'ROLE_CHOICE') {
        applyRoleChoice(data.role);
      } else if (data.type === 'SYNC_STATE') {
        currentInnings = data.innings;
        currentScore = data.score;
        targetScore = data.target;
        p1Role = data.p1Role === 'Batting' ? 'Bowling' : 'Batting';
        if (currentInnings > 1 || p1Role) startInnings();
      }
    }

    function setControlsState(enabled) {
      for (let i = 1; i <= 6; i++) {
        document.getElementById(`btn${i}`).disabled = !enabled;
      }
    }

    function makeTossCall(call) {
      if (gameMode === 'room') {
        if (!peerConnected) { showToast('Waiting for opponent connection...'); return; }
        if (!isHost) return;

        const coinResult = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const hostWon = call === coinResult;

        sendP2PMessage({ 
          type: 'TOSS_RESULT', 
          winnerIsHost: hostWon,
          coinResult: coinResult,
          calledValue: call
        });

        processTossOutcome(hostWon, coinResult, call);
      } else {
        document.getElementById('tossModal').style.display = 'none';
        const tossWin = Math.random() < 0.5;

        if (tossWin) {
          document.getElementById('tossResultTitle').textContent = `Toss came up ${call}! You Won!`;
          document.getElementById('roleModal').style.display = 'flex';
        } else {
          const botRole = Math.random() < 0.5 ? 'Batting' : 'Bowling';
          p1Role = botRole === 'Batting' ? 'Bowling' : 'Batting';
          showInfoModal("TOSS LOST", `Toss came up opposite! Opponent chose to ${botRole.toLowerCase()} first.`, () => {
            startInnings();
          });
        }
      }
    }

    function processTossOutcome(winnerIsHost, coinResult, calledValue) {
      document.getElementById('tossModal').style.display = 'none';
      const userIsWinner = (isHost && winnerIsHost) || (!isHost && !winnerIsHost);

      if (userIsWinner) {
        document.getElementById('tossResultTitle').textContent = `Coin was ${coinResult}! You Won the Toss!`;
        document.getElementById('roleModal').style.display = 'flex';
      } else {
        showInfoModal("TOSS RESULT", `Coin landed on ${coinResult}. Opponent won the toss and is choosing role...`);
      }
    }

    function setRole(role) {
      p1Role = role;
      document.getElementById('roleModal').style.display = 'none';
      if (gameMode === 'room') {
        sendP2PMessage({ type: 'ROLE_CHOICE', role: role });
      }
      startInnings();
    }

    function applyRoleChoice(chosenRole) {
      document.getElementById('infoModal').style.display = 'none';
      p1Role = chosenRole === 'Batting' ? 'Bowling' : 'Batting';
      startInnings();
    }

    function startInnings() {
      document.getElementById('p1Role').textContent = p1Role;
      document.getElementById('p2Role').textContent = p1Role === 'Batting' ? 'Bowling' : 'Batting';
      document.getElementById('inningsText').textContent = currentInnings === 1 ? '1st' : '2nd';
      document.getElementById('targetText').textContent = targetScore !== null ? targetScore : '-';
      document.getElementById('scoreText').textContent = currentScore;
      document.getElementById('statusBanner').textContent = p1Role === 'Batting' ? 'You are Batting! Tap a run.' : 'You are Bowling! Try to match opponent.';
      setControlsState(true);
    }

    function playRun(run) {
      if (gameMode === 'bot') {
        const botRun = Math.floor(Math.random() * 6) + 1;
        processDelivery(run, botRun);
      } else {
        if (!peerConnected) { showToast('Waiting for P2P connection'); return; }
        if (isHost) p1RunChoice = run;
        else p2RunChoice = run;

        document.getElementById('statusBanner').textContent = "Waiting for Opponent run...";
        sendP2PMessage({ type: 'MOVE', run: run });
        checkMultiplayerTurn();
      }
    }

    function checkMultiplayerTurn() {
      if (p1RunChoice !== null && p2RunChoice !== null) {
        processDelivery(p1RunChoice, p2RunChoice);
        p1RunChoice = null;
        p2RunChoice = null;
      }
    }

    function processDelivery(p1Run, p2Run) {
      drawHumanHand(document.getElementById('p1Canvas'), p1Run);
      drawHumanHand(document.getElementById('p2Canvas'), p2Run);

      if (p1Run === p2Run) {
        playSound('out');
        if (currentInnings === 1) {
          targetScore = currentScore + 1;
          showInfoModal("WICKET! OUT!", `1st Innings complete. Score: ${currentScore}. Target for 2nd Innings: ${targetScore}`, () => {
            currentInnings = 2;
            currentScore = 0;
            p1Role = p1Role === 'Batting' ? 'Bowling' : 'Batting';
            startInnings();
          });
        } else {
          evaluateGameResult(false);
        }
      } else {
        playSound('hit');
        const batsmanRun = p1Role === 'Batting' ? p1Run : p2Run;
        currentScore += batsmanRun;
        document.getElementById('scoreText').textContent = currentScore;

        if (currentInnings === 2 && currentScore >= targetScore) {
          evaluateGameResult(true);
        }
      }
    }

    function evaluateGameResult(chaseSuccessful) {
      setControlsState(false);
      let title = "";
      let msg = "";

      if (p1Role === 'Batting') { 
        if (currentScore >= targetScore) {
          title = "YOU WIN!";
          msg = `You successfully chased the target of ${targetScore}!`;
        } else {
          title = "YOU LOST!";
          msg = `You were OUT! Fell short of the target ${targetScore}.`;
        }
      } else { 
        if (currentScore >= targetScore) {
          title = "YOU LOST!";
          msg = `Opponent chased down your score of ${targetScore - 1}!`;
        } else {
          title = "YOU WIN!";
          msg = `Opponent was OUT! Failed to reach target ${targetScore}.`;
        }
      }

      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalMsg').textContent = msg;

      summaryShareText = `🏏 Hand Cricket Results:\nResult: ${title}\nFinal Score: ${currentScore}\nTarget: ${targetScore || '-'}\nPlay on ClassicSchoolGames!`;
      document.getElementById('shareResultText').textContent = `${title} | Score: ${currentScore}`;

      document.getElementById('gameOverModal').style.display = 'flex';
    }

    function shareResult() {
      if (navigator.share) {
        navigator.share({ title: 'Hand Cricket Result', text: summaryShareText }).catch(() => {});
      } else {
        navigator.clipboard.writeText(summaryShareText);
        showToast('Result copied to clipboard!');
      }
    }

    function resetGame(broadcast = true) {
      currentInnings = 1;
      currentScore = 0;
      targetScore = null;
      p1RunChoice = null;
      p2RunChoice = null;
      drawHumanHand(document.getElementById('p1Canvas'), 0);
      drawHumanHand(document.getElementById('p2Canvas'), 0);
      document.getElementById('gameOverModal').style.display = 'none';

      if (gameMode === 'bot') {
        document.getElementById('tossHeading').textContent = 'Toss Time!';
        document.getElementById('tossSubtext').textContent = 'Choose Heads or Tails';
        document.getElementById('tossOptionsBox').style.display = 'flex';
        document.getElementById('tossModal').style.display = 'flex';
      } else {
        document.getElementById('tossModal').style.display = 'none';
      }

      if (broadcast && gameMode === 'room') {
        sendP2PMessage({ type: 'RESET' });
      }
    }

    // Auto-join via URL query parameter if present
    window.addEventListener('DOMContentLoaded', () => {
      renderAllHands();
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        switchMode('room');
        document.getElementById('roomCodeInput').value = roomParam;
        joinRoom();
      }
    });

