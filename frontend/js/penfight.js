    /* Web Audio API Synthesizer */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playFlickSound(power) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 + power * 15, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    }

    function playHitSound(impact) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(80 + Math.min(impact * 10, 200), audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    }

    function playOutSound() {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    }

    /* Toast Helper */
    function showToast(msg) {
      const toast = document.getElementById('toastMsg');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }

    /* Eraser Theme Controls */
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

    /* Pen Class & Rendering */
    class Pen {
      constructor(x, y, angle, color, name, id, capStyle = 'standard') {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = angle;
        this.va = 0;
        this.length = 130;
        this.width = 14;
        this.color = color;
        this.name = name;
        this.id = id;
        this.radius = 28;
        this.capStyle = capStyle;
        this.isEliminated = false;

        this.mass = capStyle === 'heavy' ? 1.4 : capStyle === 'aerodynamic' ? 0.8 : 1.0;
        this.friction = capStyle === 'aerodynamic' ? 0.975 : 0.965;
      }

      update() {
        if (this.isEliminated) return;
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.va;

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.va *= 0.88;

        if (Math.hypot(this.vx, this.vy) < 0.08) { this.vx = 0; this.vy = 0; }
        if (Math.abs(this.va) < 0.001) this.va = 0;
      }

      draw(ctx) {
        if (this.isEliminated) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const halfL = this.length / 2;
        const halfW = this.width / 2;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.beginPath();
        ctx.roundRect(-halfL + 5, -halfW + 5, this.length, this.width, 4);
        ctx.fill();

        // Main Barrel
        ctx.fillStyle = 'rgba(240, 240, 255, 0.85)';
        ctx.strokeStyle = 'rgba(180, 180, 200, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-halfL, -halfW, this.length - 25, this.width, 3);
        ctx.fill();
        ctx.stroke();

        // Ink Tube
        ctx.fillStyle = this.color;
        ctx.fillRect(-halfL + 10, -2, this.length - 45, 4);

        // Metallic Tip
        ctx.fillStyle = '#d0d0d5';
        ctx.beginPath();
        ctx.moveTo(halfL - 25, -halfW);
        ctx.lineTo(halfL - 8, -2.5);
        ctx.lineTo(halfL - 8, 2.5);
        ctx.lineTo(halfL - 25, halfW);
        ctx.closePath();
        ctx.fill();

        // Visible Pen Caps
        if (this.capStyle === 'heavy') {
          ctx.fillStyle = '#111';
          ctx.fillRect(-halfL - 12, -halfW - 3, 30, this.width + 6);
          ctx.fillStyle = this.color;
          ctx.fillRect(-halfL + 8, -halfW - 5, 8, this.width + 10);
        } else if (this.capStyle === 'aerodynamic') {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(-halfL + 20, -halfW - 2);
          ctx.lineTo(-halfL - 18, 0);
          ctx.lineTo(-halfL + 20, halfW + 2);
          ctx.closePath();
          ctx.fill();
        } else {
          // Standard Cap
          ctx.fillStyle = this.color;
          ctx.fillRect(-halfL - 8, -halfW - 1, 28, this.width + 2);
          ctx.fillStyle = '#a0a0a5';
          ctx.fillRect(-halfL + 2, -halfW - 4, 16, 3);
        }

        ctx.restore();
      }

      isOffTable(width, height) {
        return (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20);
      }
    }

    /* Core Game State */
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const turnStatus = document.getElementById('turnStatus');
    const roomCodeDisplay = document.getElementById('roomCodeDisplay');
    
    let pens = [];
    let turnIndex = 0;
    let isDragging = false;
    let dragStart, dragCurrent, gameOver = false, lastMatchResult = '';
    let gameMode = '2p';

    /* PeerJS Connectivity & Multiplayer State */
    let peer = null, peerConn = null;
    let isOnlineMode = false;
    let isHost = false;
    let myPlayerId = 1; // 1 for Host, 2 for Joiner

    function initDesk(broadcast = true) {
      pens = [];
      const userColor = document.getElementById('penColorInput').value;
      const userCap = document.getElementById('penCapSelect').value;

      if (isOnlineMode) {
        // Player 1 (Host) and Player 2 (Joiner)
        pens.push(new Pen(180, 240, 0, isHost ? userColor : '#0055ff', isHost ? 'You (P1)' : 'Host (P1)', 1, isHost ? userCap : 'standard'));
        pens.push(new Pen(670, 240, Math.PI, !isHost ? userColor : '#ff3333', !isHost ? 'You (P2)' : 'Opponent (P2)', 2, !isHost ? userCap : 'standard'));
      } else {
        if (gameMode === '3p') {
          pens.push(new Pen(200, 150, 0, userColor, 'Player 1', 1, userCap));
          pens.push(new Pen(650, 150, Math.PI, '#ff3333', 'Player 2', 2));
          pens.push(new Pen(425, 380, -Math.PI / 2, '#33cc66', 'Player 3', 3));
        } else if (gameMode === '4p') {
          pens.push(new Pen(180, 140, 0, userColor, 'Player 1', 1, userCap));
          pens.push(new Pen(670, 140, Math.PI, '#ff3333', 'Player 2', 2));
          pens.push(new Pen(180, 340, 0, '#33cc66', 'Player 3', 3));
          pens.push(new Pen(670, 340, Math.PI, '#ff9900', 'Player 4', 4));
        } else {
          pens.push(new Pen(180, 240, 0, userColor, 'Player 1', 1, userCap));
          pens.push(new Pen(670, 240, Math.PI, '#ff3333', 'Player 2', 2));
        }
      }

      turnIndex = 0;
      isDragging = false;
      gameOver = false;
      document.getElementById('gameOverModal').style.display = 'none';
      updateTurnUI();

      if (broadcast && isOnlineMode && peerConn && peerConn.open) {
        peerConn.send({ type: 'RESET_DESK' });
      }
    }

    function isMoving() {
      return pens.some(p => Math.hypot(p.vx, p.vy) > 0.1);
    }

    function updateTurnUI() {
      if (gameOver) return;
      const active = pens[turnIndex];
      if (isOnlineMode) {
        const isMyTurn = active.id === myPlayerId;
        turnStatus.textContent = isMyTurn ? `Your Turn (${active.name})` : `Waiting for Opponent (${active.name})...`;
      } else {
        turnStatus.textContent = `${active.name}'s Turn`;
      }
    }

    function getMousePos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function startDrag(e) {
      if (gameOver || isMoving()) return;
      const activePen = pens[turnIndex];

      // Security/Control Fix: Lock input if playing online and active pen is NOT yours
      if (isOnlineMode && activePen.id !== myPlayerId) {
        return;
      }

      const pos = getMousePos(e);
      if (Math.hypot(pos.x - activePen.x, pos.y - activePen.y) < 60) {
        isDragging = true;
        dragStart = { x: activePen.x, y: activePen.y };
        dragCurrent = pos;
      }
    }

    function moveDrag(e) {
      if (isDragging) dragCurrent = getMousePos(e);
    }

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;

      const activePen = pens[turnIndex];
      const dx = dragStart.x - dragCurrent.x;
      const dy = dragStart.y - dragCurrent.y;
      const pullDist = Math.hypot(dx, dy);

      if (pullDist > 8) {
        const power = Math.min(pullDist * 0.18, 18);
        const angle = Math.atan2(dy, dx);

        activePen.vx = Math.cos(angle) * power;
        activePen.vy = Math.sin(angle) * power;
        activePen.angle = angle;
        activePen.va = (Math.random() - 0.5) * 0.04;

        playFlickSound(power);
        broadcastMove({ penId: activePen.id, vx: activePen.vx, vy: activePen.vy, angle: activePen.angle, va: activePen.va, x: activePen.x, y: activePen.y });
        nextTurn();
      }
    }

    function nextTurn() {
      do {
        turnIndex = (turnIndex + 1) % pens.length;
      } while (pens[turnIndex].isEliminated && activeCount() > 1);
      updateTurnUI();
    }

    function activeCount() {
      return pens.filter(p => !p.isEliminated).length;
    }

    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);
    canvas.addEventListener('touchstart', (e) => { startDrag(e); e.preventDefault(); });
    canvas.addEventListener('touchmove', (e) => { moveDrag(e); e.preventDefault(); });
    window.addEventListener('touchend', endDrag);

    function handleCollisions() {
      for (let i = 0; i < pens.length; i++) {
        for (let j = i + 1; j < pens.length; j++) {
          const p1 = pens[i];
          const p2 = pens[j];
          if (p1.isEliminated || p2.isEliminated) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = p1.radius + p2.radius;

          if (dist < minDist && dist > 0) {
            const angle = Math.atan2(dy, dx);
            const overlap = minDist - dist;

            p1.x -= Math.cos(angle) * overlap * 0.5;
            p1.y -= Math.sin(angle) * overlap * 0.5;
            p2.x += Math.cos(angle) * overlap * 0.5;
            p2.y += Math.sin(angle) * overlap * 0.5;

            const totalSpeed = (Math.hypot(p1.vx, p1.vy) + Math.hypot(p2.vx, p2.vy)) * 0.82;
            playHitSound(totalSpeed);

            p1.vx = -Math.cos(angle) * (totalSpeed / p1.mass + 2);
            p1.vy = -Math.sin(angle) * (totalSpeed / p1.mass + 2);
            p2.vx = Math.cos(angle) * (totalSpeed / p2.mass + 2);
            p2.vy = Math.sin(angle) * (totalSpeed / p2.mass + 2);
          }
        }
      }
    }

    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pens.forEach(p => p.update());
      handleCollisions();
      pens.forEach(p => p.draw(ctx));

      if (isDragging) {
        const activePen = pens[turnIndex];
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;

        ctx.beginPath();
        ctx.moveTo(activePen.x, activePen.y);
        ctx.lineTo(activePen.x + dx, activePen.y + dy);
        ctx.strokeStyle = '#fff3a0';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (!gameOver) {
        pens.forEach(p => {
          if (!p.isEliminated && p.isOffTable(canvas.width, canvas.height)) {
            p.isEliminated = true;
            playOutSound();
          }
        });

        if (activeCount() <= 1) {
          gameOver = true;
          const winner = pens.find(p => !p.isEliminated);
          let title = "DRAW!";
          if (winner) {
            title = (isOnlineMode && winner.id === myPlayerId) ? "VICTORY!" : `${winner.name} WINS!`;
          }
          lastMatchResult = winner ? `${winner.name} survived the desk!` : "Everyone fell off!";
          document.getElementById('modalHeaderTitle').textContent = title;
          document.getElementById('winnerText').textContent = lastMatchResult;
          document.getElementById('gameOverModal').style.display = 'flex';
        }
      }

      requestAnimationFrame(gameLoop);
    }

    /* WebRTC Live Multiplayer Sync */
    function broadcastMove(data) {
      if (isOnlineMode && peerConn && peerConn.open) {
        peerConn.send({ type: 'MOVE', data: data });
      }
    }

    function initHostRoom(code) {
      if (peer) peer.destroy();
      isOnlineMode = true;
      isHost = true;
      myPlayerId = 1;

      peer = new Peer(`pf_${code}`);
      peer.on('open', (id) => {
        const cleanCode = id.replace('pf_', '');
        roomCodeDisplay.textContent = `Room: ${cleanCode}`;
        document.getElementById('roomModal').style.display = 'none';

        const url = new URL(window.location.href);
        url.searchParams.set('room', cleanCode);
        window.history.pushState({}, '', url);
        navigator.clipboard.writeText(url.href);
        showToast(`Room Created! Link Copied: ${cleanCode}`);
      });

      peer.on('connection', (conn) => {
        peerConn = conn;
        setupPeerListeners();
        showToast('Opponent Connected!');
        initDesk();
      });

      peer.on('error', () => {
        showToast('Room Creation Failed');
      });
    }

    function initJoinRoom(code) {
      if (peer) peer.destroy();
      isOnlineMode = true;
      isHost = false;
      myPlayerId = 2;

      peer = new Peer();
      peer.on('open', () => {
        peerConn = peer.connect(`pf_${code}`);
        setupPeerListeners();
        roomCodeDisplay.textContent = `Room: ${code}`;
        document.getElementById('roomModal').style.display = 'none';

        const url = new URL(window.location.href);
        url.searchParams.set('room', code);
        window.history.pushState({}, '', url);
        showToast(`Joining Room: ${code}`);
      });

      peer.on('error', () => {
        showToast('Could not connect to room');
      });
    }

    document.getElementById('hostRoomBtn').onclick = () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      document.getElementById('roomCodeInput').value = code;
      initHostRoom(code);
    };

    document.getElementById('joinRoomBtn').onclick = () => {
      const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
      if (!code) { showToast('Enter Code'); return; }
      initJoinRoom(code);
    };

    function setupPeerListeners() {
      peerConn.on('data', (msg) => {
        if (msg.type === 'MOVE') {
          const targetPen = pens.find(p => p.id === msg.data.penId);
          if (targetPen) {
            targetPen.x = msg.data.x;
            targetPen.y = msg.data.y;
            targetPen.vx = msg.data.vx;
            targetPen.vy = msg.data.vy;
            targetPen.angle = msg.data.angle;
            targetPen.va = msg.data.va;
            playFlickSound(Math.hypot(msg.data.vx, msg.data.vy));
            nextTurn();
          }
        } else if (msg.type === 'RESET_DESK') {
          initDesk(false);
        }
      });

      peerConn.on('close', () => {
        showToast('Opponent Disconnected');
        isOnlineMode = false;
        roomCodeDisplay.textContent = 'Local Pass & Play';
      });
    }

    /* Modals & UI Event Handlers */
    document.getElementById('customizeBtn').onclick = () => document.getElementById('customizationModal').style.display = 'flex';
    document.getElementById('saveCustomizationBtn').onclick = () => {
      gameMode = document.getElementById('gameModeSelect').value;
      document.getElementById('customizationModal').style.display = 'none';
      initDesk();
    };

    document.getElementById('roomBtn').onclick = () => document.getElementById('roomModal').style.display = 'flex';
    document.getElementById('closeRoomBtn').onclick = () => document.getElementById('roomModal').style.display = 'none';

    document.getElementById('resetBtn').onclick = () => initDesk(true);
    document.getElementById('playAgainBtn').onclick = () => initDesk(true);

    document.getElementById('shareResultBtn').onclick = () => {
      const shareData = `🖊️ Pen Fighter Result:\nOutcome: ${lastMatchResult}\nPlayed on ClassicSchoolGames!`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData);
        showToast('Result copied to clipboard!');
      }
    };

    // Auto Join via URL
    window.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        document.getElementById('roomCodeInput').value = roomParam;
        initJoinRoom(roomParam);
      } else {
        initDesk(false);
      }
    });

    gameLoop();

