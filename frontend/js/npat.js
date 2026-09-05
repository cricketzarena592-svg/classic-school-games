    /* Category Word Bank for Bot */
    const DATABASE = {
      A: { name: ["ALEX", "ADAM", "ANNA"], place: ["AMERICA", "ARGENTINA", "AUSTRALIA"], animal: ["ALLIGATOR", "ANT", "APE"], thing: ["APPLE", "AXE", "ANCHOR"] },
      B: { name: ["BEN", "BRYAN", "BELLA"], place: ["BRAZIL", "BERLIN", "BELGIUM"], animal: ["BEAR", "BIRD", "BEE"], thing: ["BALL", "BOOK", "BOX"] },
      C: { name: ["CHRIS", "CHARLIE", "CLARA"], place: ["CANADA", "CHINA", "CUBA"], animal: ["CAT", "COW", "CAMEL"], thing: ["CAR", "CHAIR", "CLOCK"] },
      D: { name: ["DAVID", "DAN", "DIANA"], place: ["DENMARK", "DUBAI", "DELHI"], animal: ["DOG", "DEER", "DUCK"], thing: ["DOOR", "DESK", "DRUM"] },
      E: { name: ["ERIC", "EMMA", "ETHAN"], place: ["EGYPT", "ENGLAND", "ESTONIA"], animal: ["ELEPHANT", "EAGLE", "ELK"], thing: ["EGG", "ERASER", "ENGINE"] },
      F: { name: ["FRANK", "FIONA", "FELIX"], place: ["FRANCE", "FINLAND", "FIJI"], animal: ["FOX", "FROG", "FISH"], thing: ["FAN", "FORK", "FEATHER"] },
      G: { name: ["GEORGE", "GRACE", "GABRIEL"], place: ["GERMANY", "GREECE", "GEORGIA"], animal: ["GIRAFFE", "GOAT", "GORILLA"], thing: ["GLASS", "GUITAR", "GLOVES"] },
      H: { name: ["HARRY", "HANNAH", "HENRY"], place: ["HUNGARY", "HAWAII", "HAITI"], animal: ["HORSE", "HIPPO", "HAWK"], thing: ["HAT", "HAMMER", "HELMET"] },
      I: { name: ["IAN", "ISABELLA", "IVAN"], place: ["INDIA", "ITALY", "ICELAND"], animal: ["IGUANA", "IMPALA", "INSECT"], thing: ["INK", "IRON", "ICE"] },
      J: { name: ["JACK", "JOHN", "JULIA"], place: ["JAPAN", "JAMAICA", "JORDAN"], animal: ["JAGUAR", "JELLYFISH", "JACKAL"], thing: ["JAR", "JACKET", "JUG"] },
      K: { name: ["KEVIN", "KATE", "KENNY"], place: ["KENYA", "KOREA", "KUWAIT"], animal: ["KANGAROO", "KOALA", "KINGFISHER"], thing: ["KEY", "KITE", "KNIFE"] },
      L: { name: ["LEO", "LUCY", "LUKE"], place: ["LONDON", "LAOS", "LIBYA"], animal: ["LION", "LEOPARD", "LIZARD"], thing: ["LAMP", "LOCK", "LEAF"] },
      M: { name: ["MARK", "MARY", "MIKE"], place: ["MEXICO", "MADRID", "MUMBAI"], animal: ["MONKEY", "MOUSE", "MOOSE"], thing: ["MAP", "MIRROR", "MAGNET"] },
      N: { name: ["NICK", "NINA", "NOAH"], place: ["NEPAL", "NORWAY", "NIGERIA"], animal: ["NEWT", "NIGHTINGALE", "NARWHAL"], thing: ["NOTEBOOK", "NEEDLE", "NET"] },
      O: { name: ["OLIVER", "OLIVIA", "OWEN"], place: ["OMAN", "OHIO", "OSLO"], animal: ["OWL", "OSTRICH", "OCTOPUS"], thing: ["OVEN", "OIL", "ORGAN"] },
      P: { name: ["PAUL", "PETER", "PENNY"], place: ["PARIS", "PERU", "POLAND"], animal: ["PANDA", "PARROT", "PIG"], thing: ["PEN", "PENCIL", "PAPER"] },
      R: { name: ["RYAN", "ROSE", "RICK"], place: ["ROME", "RUSSIA", "ROMANIA"], animal: ["RABBIT", "RAT", "RHINO"], thing: ["RING", "ROPE", "RADIO"] },
      S: { name: ["SAM", "SARAH", "STEVE"], place: ["SPAIN", "SWEDEN", "SEOUL"], animal: ["SNAKE", "SHARK", "SEAL"], thing: ["SPOON", "SHOES", "SOAP"] },
      T: { name: ["TOM", "TINA", "TYLER"], place: ["TOKYO", "TEXAS", "TURKEY"], animal: ["TIGER", "TURTLE", "TOAD"], thing: ["TABLE", "TELEPHONE", "TOY"] }
    };

    /* Web Audio Synthesizer */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(type) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      } else if (type === 'finish') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
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

    /* Game State Variables */
    let currentRound = 1;
    const maxRounds = 3;
    let currentLetter = "";
    let userTotalScore = 0;
    let botTotalScore = 0;
    let timer = 45;
    let timerInterval = null;
    let gameMode = 'bot';
    let p1SubmittedInputs = null;
    let p2SubmittedInputs = null;
    let summaryShareText = '';

    /* Peer-to-Peer / WebRTC Multiplayer Infrastructure */
    let roomChannel = null;
    let peerConnection = null;
    let dataChannel = null;
    let currentRoomCode = '';
    let isHost = false;
    let peerConnected = false;
    let localPeerId = Math.random().toString(36).substring(2, 9);
    let remotePeerId = null;

    const rtcConfig = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    const availableLetters = Object.keys(DATABASE);

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
      document.getElementById('p2LabelText').textContent = mode === 'bot' ? 'Bot' : 'P2';
      document.getElementById('thP2Name').textContent = mode === 'bot' ? 'Bot' : 'P2';
      
      if (mode === 'bot') {
        if (roomChannel) { roomChannel.close(); roomChannel = null; }
        if (peerConnection) { peerConnection.close(); peerConnection = null; }
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
      if (roomChannel) roomChannel.close();
      if (peerConnection) peerConnection.close();

      currentRoomCode = code;
      isHost = host;
      updatePeerStatus(false, 'Connecting...');

      roomChannel = new BroadcastChannel(`npat_room_${code}`);
      
      roomChannel.onmessage = async (e) => {
        const data = e.data;
        if (data.targetId && data.targetId !== localPeerId) return;

        if (data.type === 'PEER_JOIN' && isHost) {
          remotePeerId = data.senderId;
          setupPeerConnection();
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          roomChannel.postMessage({
            type: 'SIGNAL_OFFER',
            senderId: localPeerId,
            targetId: remotePeerId,
            sdp: offer
          });
        } else if (data.type === 'SIGNAL_OFFER' && !isHost) {
          remotePeerId = data.senderId;
          setupPeerConnection();
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          roomChannel.postMessage({
            type: 'SIGNAL_ANSWER',
            senderId: localPeerId,
            targetId: remotePeerId,
            sdp: answer
          });
        } else if (data.type === 'SIGNAL_ANSWER' && isHost) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === 'ICE_CANDIDATE') {
          if (peerConnection) {
            try { await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch(err){}
          }
        }
      };

      if (!isHost) {
        roomChannel.postMessage({ type: 'PEER_JOIN', senderId: localPeerId });
      }
      resetGame(false);
    }

    function setupPeerConnection() {
      peerConnection = new RTCPeerConnection(rtcConfig);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && roomChannel) {
          roomChannel.postMessage({
            type: 'ICE_CANDIDATE',
            senderId: localPeerId,
            targetId: remotePeerId,
            candidate: event.candidate
          });
        }
      };

      if (isHost) {
        dataChannel = peerConnection.createDataChannel('gameData');
        bindDataChannelEvents();
      } else {
        peerConnection.ondatachannel = (event) => {
          dataChannel = event.channel;
          bindDataChannelEvents();
        };
      }
    }

    function bindDataChannelEvents() {
      dataChannel.onopen = () => {
        updatePeerStatus(true, 'Connected');
        showToast('P2P Connection Established!');
        if (isHost) {
          startRound();
        }
      };

      dataChannel.onclose = () => {
        updatePeerStatus(false, 'Disconnected');
      };

      dataChannel.onmessage = (e) => {
        const data = JSON.parse(e.data);
        handleP2PMessage(data);
      };
    }

    function sendP2PMessage(msg) {
      if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(msg));
      }
    }

    function handleP2PMessage(data) {
      if (data.type === 'LETTER') {
        currentLetter = data.letter;
        setupRoundUI();
      } else if (data.type === 'SUBMIT') {
        if (isHost) p2SubmittedInputs = data.inputs;
        else p1SubmittedInputs = data.inputs;
        checkMultiplayerRound();
      } else if (data.type === 'RESET') {
        resetGame(false);
      }
    }

    function startRound() {
      if (gameMode === 'bot' || isHost) {
        currentLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        if (gameMode === 'room') {
          sendP2PMessage({ type: 'LETTER', letter: currentLetter });
        }
      }
      setupRoundUI();
    }

    function setupRoundUI() {
      document.getElementById('letterTarget').textContent = currentLetter || '?';
      document.getElementById('roundText').textContent = `${currentRound}/${maxRounds}`;

      document.getElementById('inputName').value = "";
      document.getElementById('inputPlace').value = "";
      document.getElementById('inputAnimal').value = "";
      document.getElementById('inputThing').value = "";

      timer = 45;
      document.getElementById('timerText').textContent = timer;
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timerText').textContent = timer;
        if (timer <= 5 && timer > 0) playSound('tick');
        if (timer <= 0) {
          clearInterval(timerInterval);
          submitRound();
        }
      }, 1000);
    }

    function handleFormSubmit(e) {
      if (e) e.preventDefault();
      submitRound();
    }

    function submitRound() {
      clearInterval(timerInterval);
      playSound('finish');

      const userInputs = {
        name: document.getElementById('inputName').value.trim().toUpperCase(),
        place: document.getElementById('inputPlace').value.trim().toUpperCase(),
        animal: document.getElementById('inputAnimal').value.trim().toUpperCase(),
        thing: document.getElementById('inputThing').value.trim().toUpperCase()
      };

      if (gameMode === 'bot') {
        const botData = DATABASE[currentLetter];
        const botInputs = {
          name: botData.name[Math.floor(Math.random() * botData.name.length)],
          place: botData.place[Math.floor(Math.random() * botData.place.length)],
          animal: botData.animal[Math.floor(Math.random() * botData.animal.length)],
          thing: botData.thing[Math.floor(Math.random() * botData.thing.length)]
        };
        evaluateRound(userInputs, botInputs);
      } else {
        if (!peerConnected) { showToast('Waiting for P2P connection'); return; }
        if (isHost) p1SubmittedInputs = userInputs;
        else p2SubmittedInputs = userInputs;

        sendP2PMessage({ type: 'SUBMIT', inputs: userInputs });
        checkMultiplayerRound();
      }
    }

    function checkMultiplayerRound() {
      if (p1SubmittedInputs && p2SubmittedInputs) {
        evaluateRound(p1SubmittedInputs, p2SubmittedInputs);
        p1SubmittedInputs = null;
        p2SubmittedInputs = null;
      }
    }

    function evaluateRound(uInputs, bInputs) {
      const categories = ['name', 'place', 'animal', 'thing'];
      let roundUserScore = 0;
      let roundBotScore = 0;
      const breakdownBody = document.getElementById('breakdownBody');
      breakdownBody.innerHTML = "";

      categories.forEach(cat => {
        const uVal = uInputs[cat];
        const bVal = bInputs[cat];

        let uPts = 0;
        let bPts = 0;

        const uValid = uVal.length > 0 && uVal[0] === currentLetter;
        const bValid = bVal.length > 0 && bVal[0] === currentLetter;

        if (uValid && bValid) {
          if (uVal === bVal) {
            uPts = 5;
            bPts = 5;
          } else {
            uPts = 10;
            bPts = 10;
          }
        } else if (uValid && !bValid) {
          uPts = 10;
          bPts = 0;
        } else if (!uValid && bValid) {
          uPts = 0;
          bPts = 10;
        }

        roundUserScore += uPts;
        roundBotScore += bPts;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:700; text-transform:capitalize; color:var(--chalk-yellow);">${cat}</td>
          <td>${uVal || '-'} (${uPts}p)</td>
          <td>${bVal || '-'} (${bPts}p)</td>
          <td style="color:var(--chalk-green);">${uPts} / ${bPts}</td>
        `;
        breakdownBody.appendChild(tr);
      });

      userTotalScore += roundUserScore;
      botTotalScore += roundBotScore;

      document.getElementById('userScoreText').textContent = userTotalScore;
      document.getElementById('botScoreText').textContent = botTotalScore;

      document.getElementById('roundModal').style.display = 'flex';
    }

    function nextRound() {
      document.getElementById('roundModal').style.display = 'none';
      if (currentRound < maxRounds) {
        currentRound++;
        startRound();
      } else {
        const userWon = userTotalScore > botTotalScore;
        const draw = userTotalScore === botTotalScore;
        const title = draw ? "IT'S A DRAW!" : (userWon ? "YOU WIN!" : "YOU LOST!");
        const p2Label = gameMode === 'bot' ? 'Bot' : 'P2';
        const msg = `Final Scores -> You: ${userTotalScore} | ${p2Label}: ${botTotalScore}`;

        document.getElementById('finalTitle').textContent = title;
        document.getElementById('finalMsg').textContent = msg;

        summaryShareText = `✏️ Name Place Animal Thing Results:\nResult: ${title}\nScores: You ${userTotalScore} - ${botTotalScore} ${p2Label}\nPlay on ClassicSchoolGames!`;
        document.getElementById('shareResultText').textContent = `${title} | Score: ${userTotalScore}-${botTotalScore}`;

        document.getElementById('gameOverModal').style.display = 'flex';
      }
    }

    function shareResult() {
      if (navigator.share) {
        navigator.share({ title: 'NPAT Result', text: summaryShareText }).catch(() => {});
      } else {
        navigator.clipboard.writeText(summaryShareText);
        showToast('Result copied to clipboard!');
      }
    }

    function resetGame(broadcast = true) {
      currentRound = 1;
      userTotalScore = 0;
      botTotalScore = 0;
      p1SubmittedInputs = null;
      p2SubmittedInputs = null;

      document.getElementById('userScoreText').textContent = "0";
      document.getElementById('botScoreText').textContent = "0";
      document.getElementById('roundModal').style.display = 'none';
      document.getElementById('gameOverModal').style.display = 'none';

      if (broadcast && gameMode === 'room') {
        sendP2PMessage({ type: 'RESET' });
      }
      startRound();
    }

    // Auto-join via URL query parameter if present
    window.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        switchMode('room');
        document.getElementById('roomCodeInput').value = roomParam;
        joinRoom();
      } else {
        startRound();
      }
    });

