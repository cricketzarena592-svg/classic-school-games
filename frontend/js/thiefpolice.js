    const urlParams = new URLSearchParams(window.location.search);
    const myTag = urlParams.get('user') || localStorage.getItem('csg_username') || ('Player_' + Math.floor(100 + Math.random() * 900));

    let peer = null;
    let connections = [];
    let hostConn = null;
    let isHost = false;
    let myIndex = -1;

    let players = [];
    let scores = [0, 0, 0, 0];
    let mySecretRole = null;

    const rolesConfig = [
      { title: '👑 KING (Raja)', pts: 1000, key: 'king' },
      { title: '📜 MINISTER (Mantri)', pts: 800, key: 'minister' },
      { title: '👮 POLICE (Sipahi)', pts: 500, key: 'police' },
      { title: '🕵️ THIEF (Chor)', pts: 0, key: 'thief' }
    ];

    function showToast(msg) {
      const toast = document.getElementById('toastMsg');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    function hostGame() {
      if (peer) peer.destroy();
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      peer = new Peer('csg-tp-' + code);

      peer.on('open', (id) => {
        isHost = true;
        myIndex = 0;
        players = [{ id: id, name: myTag }];
        document.getElementById('roomStatus').textContent = `ROOM CODE: ${code}`;
        
        const url = new URL(window.location.href);
        url.searchParams.set('room', code);
        window.history.pushState({}, '', url);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url.href);
          showToast(`Room Code ${code} copied!`);
        }
        updateLobbyUI();

        peer.on('connection', (conn) => {
          conn.on('open', () => {
            if (players.length >= 4) {
              conn.send({ type: 'FULL' });
              setTimeout(() => conn.close(), 500);
              return;
            }
            connections.push(conn);
            conn.on('data', (data) => handleHostData(data, conn));
            conn.on('close', () => handlePeerDisconnect(conn.peer));
          });
        });
      });

      peer.on('error', (err) => showToast('Room creation failed: ' + err.type));
    }

    function joinGame(codeOverride) {
      const code = codeOverride || document.getElementById('joinCodeInput').value.trim();
      if (!code || code.length !== 4) return showToast('Enter a valid 4-digit room code');

      if (peer) peer.destroy();
      peer = new Peer();

      peer.on('open', (myPeerId) => {
        hostConn = peer.connect('csg-tp-' + code);
        
        hostConn.on('open', () => {
          hostConn.send({ type: 'JOIN', name: myTag, peerId: myPeerId });
          document.getElementById('roomStatus').textContent = `CONNECTED TO ROOM: ${code}`;
        });

        hostConn.on('data', (data) => handleClientData(data));
        hostConn.on('close', () => {
          showToast('Disconnected from host.');
          location.reload();
        });
      });

      peer.on('error', () => showToast('Unable to connect to room code.'));
    }

    function handlePeerDisconnect(peerId) {
      players = players.filter(p => p.id !== peerId);
      connections = connections.filter(c => c.peer !== peerId);
      updateLobbyUI();
      broadcastState({ type: 'LOBBY_UPDATE', players: players });
    }

    function handleHostData(data, conn) {
      if (data.type === 'JOIN') {
        players.push({ id: conn.peer, name: data.name });
        updateLobbyUI();
        broadcastState({ type: 'LOBBY_UPDATE', players: players });
      } else if (data.type === 'ACCUSE') {
        evaluateAccusation(data.accusedIndex);
      }
    }

    function handleClientData(data) {
      if (data.type === 'LOBBY_UPDATE') {
        players = data.players;
        myIndex = players.findIndex(p => p.id === peer.id);
        if (myIndex === -1) myIndex = players.findIndex(p => p.name === myTag);
        updateLobbyUI();
      } else if (data.type === 'START_ROUND') {
        scores = data.scores;
        mySecretRole = data.assignedRole;
        setupPlayArea();
      } else if (data.type === 'SHOW_POLICE_ACCUSE') {
        renderPolicePhase(data.policeIndex);
      } else if (data.type === 'ROUND_RESULT') {
        scores = data.scores;
        showResults(data);
      }
    }

    function broadcastState(msg) {
      connections.forEach(conn => {
        if (conn.open) conn.send(msg);
      });
    }

    function updateLobbyUI() {
      const list = document.getElementById('playerListDisplay');
      list.innerHTML = players.map((p, i) => `
        <li class="player-item">
          <span>P${i+1}: ${p.name} ${i === myIndex ? '(You)' : ''}</span> 
          <span>${i===0 ? '👑 Host' : ''}</span>
        </li>
      `).join('');

      if (isHost) {
        const startBtn = document.getElementById('startGameBtn');
        startBtn.style.display = 'block';
        startBtn.textContent = `Start Game (${players.length}/4)`;
        startBtn.disabled = players.length < 4;
      }
    }

    function startMultiplayerRound() {
      if (!isHost) return;
      document.getElementById('roundModal').style.display = 'none';

      const shuffled = [...rolesConfig].sort(() => Math.random() - 0.5);
      window.hostRoundSecret = players.map((p, i) => ({ playerIndex: i, name: p.name, role: shuffled[i] }));

      // Send private role info to each joined peer
      connections.forEach((conn) => {
        const pIdx = players.findIndex(p => p.id === conn.peer);
        if (pIdx !== -1) {
          conn.send({
            type: 'START_ROUND',
            scores: scores,
            assignedRole: window.hostRoundSecret[pIdx].role
          });
        }
      });

      // Host local state setup
      mySecretRole = window.hostRoundSecret[0].role;
      setupPlayArea();

      const policeIndex = window.hostRoundSecret.findIndex(r => r.role.key === 'police');
      broadcastState({ type: 'SHOW_POLICE_ACCUSE', policeIndex: policeIndex });
      renderPolicePhase(policeIndex);
    }

    function setupPlayArea() {
      document.getElementById('lobbyScreen').style.display = 'none';
      document.getElementById('gamePlayArea').style.display = 'flex';

      players.forEach((p, i) => {
        const nameElem = document.getElementById(`sbP${i}`);
        const scoreElem = document.getElementById(`scP${i}`);
        if (nameElem && scoreElem) {
          nameElem.textContent = p.name;
          scoreElem.textContent = scores[i] || 0;
        }
      });

      document.getElementById('phaseRole').style.display = 'flex';
      document.getElementById('phasePolice').style.display = 'none';
      hideMyCard();
    }

    function revealMyCard() {
      if (!mySecretRole) return;
      document.getElementById('cardContent').innerHTML = `<span class="card-title">${mySecretRole.title}</span><br><span class="card-pts">${mySecretRole.pts} Pts</span>`;
    }

    function hideMyCard() {
      document.getElementById('cardContent').textContent = "HOLD TO VIEW ROLE";
    }

    function renderPolicePhase(policeIndex) {
      if (myIndex === policeIndex) {
        document.getElementById('phasePolice').style.display = 'flex';
        document.getElementById('waitingForPoliceMsg').style.display = 'none';
        
        const grid = document.getElementById('policeVoteGrid');
        grid.innerHTML = '';

        players.forEach((p, idx) => {
          if (idx !== policeIndex) {
            const btn = document.createElement('button');
            btn.className = 'vote-btn';
            btn.textContent = p.name;
            btn.onclick = () => submitAccusation(idx);
            grid.appendChild(btn);
          }
        });
      } else {
        document.getElementById('phasePolice').style.display = 'none';
        document.getElementById('waitingForPoliceMsg').style.display = 'block';
        document.getElementById('waitingForPoliceMsg').textContent = `👮 ${players[policeIndex].name} is Police! Waiting for accusation...`;
      }
    }

    function submitAccusation(accusedIndex) {
      if (isHost) {
        evaluateAccusation(accusedIndex);
      } else {
        hostConn.send({ type: 'ACCUSE', accusedIndex: accusedIndex });
      }
    }

    function evaluateAccusation(accusedIndex) {
      const secrets = window.hostRoundSecret;
      const police = secrets.find(s => s.role.key === 'police');
      const thief = secrets.find(s => s.role.key === 'thief');
      const isCorrect = accusedIndex === thief.playerIndex;

      secrets.forEach(s => {
        let pts = s.role.pts;
        if (s.role.key === 'police') pts = isCorrect ? 500 : 0;
        if (s.role.key === 'thief') pts = isCorrect ? 0 : 500;
        scores[s.playerIndex] += pts;
      });

      const payload = {
        type: 'ROUND_RESULT',
        scores: scores,
        allRoles: secrets,
        policeName: police.name,
        thiefName: thief.name,
        accusedName: secrets[accusedIndex].name,
        isCorrect: isCorrect
      };

      broadcastState(payload);
      showResults(payload);
    }

    function showResults(data) {
      const modalRoles = document.getElementById('modalRoles');
      modalRoles.innerHTML = data.allRoles.map(r => `<div><strong>${r.name}:</strong> ${r.role.title}</div>`).join('');

      document.getElementById('modalOutcome').textContent = data.isCorrect
        ? `🎯 ${data.policeName} correctly caught ${data.thiefName}! (+500 pts)`
        : `❌ ${data.policeName} accused ${data.accusedName}! ${data.thiefName} (Thief) stole points!`;

      document.getElementById('nextRoundBtn').style.display = isHost ? 'inline-block' : 'none';
      document.getElementById('roundModal').style.display = 'flex';

      players.forEach((p, i) => {
        const scoreElem = document.getElementById(`scP${i}`);
        if (scoreElem) scoreElem.textContent = data.scores[i];
      });
    }

    // Auto Join via URL
    window.addEventListener('DOMContentLoaded', () => {
      const roomParam = urlParams.get('room');
      if (roomParam) {
        document.getElementById('joinCodeInput').value = roomParam;
        joinGame(roomParam);
      }
    });

