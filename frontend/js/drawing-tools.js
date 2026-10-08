(function () {
  const frame = document.querySelector('.board-frame');
  if (!frame || frame.dataset.drawingToolsReady === 'true') return;
  frame.dataset.drawingToolsReady = 'true';

  const board = document.querySelector('.blackboard');
  if (!board) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'drawing-canvas';
  board.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const state = {
    activeGroup: 'pencil',
    tool: 'pen',
    color: '#f5f2e7',
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0
  };

  const toolbox = document.createElement('div');
  toolbox.className = 'drawing-toolbox';
  toolbox.innerHTML = `
    <div class="toolbox-row toolbox-top">
      <button type="button" class="box-toggle active" data-group="pencil">Pencil Box</button>
      <button type="button" class="box-toggle" data-group="geometry">Geometry Box</button>
    </div>

    <div class="toolbox-row toolbox-middle">
      <div class="tool-panel active" data-panel="pencil">
        <button type="button" class="tool-pill active" data-tool="pen"><span class="tool-icon">✏️</span><span>Pen</span></button>
        <button type="button" class="tool-pill" data-tool="rubber"><span class="tool-icon">🧽</span><span>Rubber</span></button>
        <button type="button" class="tool-pill" data-tool="chalk"><span class="tool-icon">🖍️</span><span>Chalk</span></button>
      </div>
      <div class="tool-panel" data-panel="geometry">
        <button type="button" class="tool-pill active" data-tool="pen"><span class="tool-icon">✏️</span><span>Pen</span></button>
        <button type="button" class="tool-pill" data-tool="compass"><span class="tool-icon">🧭</span><span>Compass</span></button>
        <button type="button" class="tool-pill" data-tool="rubber"><span class="tool-icon">🧽</span><span>Rubber</span></button>
        <button type="button" class="tool-pill" data-tool="chalk"><span class="tool-icon">🖍️</span><span>Chalk</span></button>
      </div>
      <button type="button" class="tool-clear">Clear</button>
    </div>

    <div class="chalk-strip" aria-label="Chalk colors">
      <button type="button" class="swatch active" data-color="#f5f2e7" style="--swatch:#f5f2e7" aria-label="White chalk"></button>
      <button type="button" class="swatch" data-color="#f3d976" style="--swatch:#f3d976" aria-label="Yellow chalk"></button>
      <button type="button" class="swatch" data-color="#e99cb5" style="--swatch:#e99cb5" aria-label="Pink chalk"></button>
      <button type="button" class="swatch" data-color="#92d4dc" style="--swatch:#92d4dc" aria-label="Blue chalk"></button>
      <button type="button" class="swatch" data-color="#a6dfab" style="--swatch:#a6dfab" aria-label="Green chalk"></button>
    </div>
  `;

  const chalkTray = frame.querySelector('.chalk-tray');
  if (chalkTray) {
    frame.insertBefore(toolbox, chalkTray);
  } else {
    frame.appendChild(toolbox);
  }

  function resizeCanvas() {
    const rect = board.getBoundingClientRect();
    canvas.width = Math.max(1, rect.width);
    canvas.height = Math.max(1, rect.height);
  }

  function setActiveTool(tool) {
    state.tool = tool;
    toolbox.querySelectorAll('.tool-pill').forEach((button) => {
      button.classList.toggle('active', button.dataset.tool === tool);
    });
  }

  function setActiveGroup(group) {
    state.activeGroup = group;
    toolbox.querySelectorAll('.box-toggle').forEach((button) => {
      button.classList.toggle('active', button.dataset.group === group);
    });
    toolbox.querySelectorAll('.tool-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.panel === group);
    });
  }

  function getPoint(event) {
    const rect = board.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function drawStroke(fromX, fromY, toX, toY) {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (state.tool === 'rubber') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 18;
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.tool === 'chalk' ? 8 : 4;
    ctx.stroke();
  }

  function beginDraw(event) {
    if (event.target.closest('button, input, textarea, select, a')) return;

    const point = getPoint(event);
    state.isDrawing = true;
    state.lastX = point.x;
    state.lastY = point.y;
    state.startX = point.x;
    state.startY = point.y;

    if (state.tool !== 'compass') {
      drawStroke(point.x, point.y, point.x, point.y);
    }
  }

  function moveDraw(event) {
    if (!state.isDrawing || state.tool === 'compass') return;

    const point = getPoint(event);
    drawStroke(state.lastX, state.lastY, point.x, point.y);
    state.lastX = point.x;
    state.lastY = point.y;
  }

  function finishDraw(event) {
    if (!state.isDrawing) return;

    if (state.tool === 'compass') {
      const point = getPoint(event || { clientX: state.startX, clientY: state.startY });
      const radius = Math.hypot(point.x - state.startX, point.y - state.startY);
      ctx.beginPath();
      ctx.arc(state.startX, state.startY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = state.color;
      ctx.lineWidth = state.tool === 'chalk' ? 8 : 4;
      ctx.stroke();
    }

    state.isDrawing = false;
  }

  toolbox.addEventListener('click', (event) => {
    const groupButton = event.target.closest('.box-toggle');
    if (groupButton) {
      setActiveGroup(groupButton.dataset.group);
      return;
    }

    const toolButton = event.target.closest('.tool-pill');
    if (toolButton) {
      setActiveTool(toolButton.dataset.tool);
      return;
    }

    const swatch = event.target.closest('.swatch');
    if (swatch) {
      state.color = swatch.dataset.color;
      toolbox.querySelectorAll('.swatch').forEach((button) => {
        button.classList.toggle('active', button === swatch);
      });
      return;
    }

    const clearButton = event.target.closest('.tool-clear');
    if (clearButton) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  board.addEventListener('pointerdown', beginDraw);
  board.addEventListener('pointermove', moveDraw);
  document.addEventListener('pointerup', finishDraw);
  document.addEventListener('pointercancel', finishDraw);
  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
})();
