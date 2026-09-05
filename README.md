# ClassicSchoolGames

A chalk-themed web application that brings nostalgic classroom desk games into your browser. Built with a blackboard UI style, web audio synthesizer sounds, and local/P2P multiplayer support.

---

## 🎮 Included Games

* **🖋️ Pen Fighter** (`penfight.html`): Pass & Play / WebRTC Multiplayer pen-flicking battle.


* **🖐️ Matricks** (`matricks.html`): Hand gesture strategy battle against a bot.


* **🏏 Hand Cricket** (`handcricket.html`): Classic finger-cricket game featuring toss, batting, bowling, and Canvas hand-gesture drawings vs. Bot or WebRTC P2P.


* **🌍 Atlas** (`atlas.html`): Word-chain geographical game testing knowledge of countries, cities, and states vs. Bot or WebRTC Room Code.


* **📝 NPAT** (`npat.html`): Category word-battle challenge (Name, Place, Animal, Thing).


* **✂️ Stone Paper Scissors** (`sps.html`): Classic hand showdown vs. Bot.


* **👮 Thief and Police** (`thiefpolice.html`): Tactical role-guessing deduction game.



---

## 🚀 Key Features

* **🎨 Chalkboard Design Engine**: Greenboard and Blackboard dark-mode themes with hand-drawn typography (`Fredericka the Great`, `Cabin Sketch`, `Patrick Hand`).


* **🌐 P2P Online Multiplayer**: Room-code based connectivity powered by PeerJS for real-time player vs. player matches.


* **🎨 2D HTML5 Canvas Graphics**: Real-time programmatically rendered hand gestures and chalkboard elements.


* **🔊 Web Audio API**: Custom retro sound effects synthesized dynamically without external audio assets.


* **📱 Responsive & Interactive**: Touch-friendly interface with score tracking, result sharing, and local state persistence.



---

## 🛠️ Project Structure

```text
├── index.html        # Main chalkboard dashboard & game loader
├── handcricket.html  # Hand Cricket game implementation
├── atlas.html        # Atlas word-chain game implementation
├── matricks.html     # Matricks hand gesture game implementation
├── penfight.html     # Pen Fighter game
├── npat.html         # NPAT game
├── sps.html          # Stone Paper Scissors game
├── thiefpolice.html  # Thief and Police game
├── frontend/
│   ├── css/           # Page-specific stylesheets
│   └── js/            # Page-specific game and UI logic
├── backend/           # Reserved for future server-side features
└── scripts/           # Maintenance scripts

```

The current project is a static frontend. Multiplayer room connections are peer-to-peer through PeerJS/WebRTC, so there is no application backend to run today. Future server-side features such as accounts, saved scores, matchmaking, or authoritative game state belong in `backend/`.

---

## 🧰 Tech Stack

* **Frontend**: HTML5, CSS3, JavaScript (ES6+)


* **Graphics & Web APIs**: HTML5 Canvas API, Web Audio API


* **Networking**: PeerJS (WebRTC)


* **Fonts**: Google Fonts (`Fredericka the Great`, `Cabin Sketch`, `Patrick Hand`)



---
