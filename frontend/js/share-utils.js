(function () {
  window.formatGameResultShare = function (gameTitle, resultDetails) {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = (
      urlParams.get('user') ||
      localStorage.getItem('csg_username') ||
      'Player1'
    ).trim();
    const gameUrl = new URL(window.location.href);
    gameUrl.search = '';
    gameUrl.hash = '';

    return `${gameTitle} Result\nPlayer: ${playerName}\n${resultDetails}\nPlay ${gameTitle} on ClassicSchoolGames:\n${gameUrl.href}`;
  };
})();
