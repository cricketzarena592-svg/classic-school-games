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
    activeGroup: null,
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
    <div class="case-row">
      <section class="instrument-case pencil-case" data-case="pencil">
        <div class="case-base">
          <div class="case-interior">
            <button type="button" class="case-tool active" data-tool="pen"><span>✏️</span><small>Pen</small></button>
            <button type="button" class="case-tool" data-tool="rubber"><span>🧽</span><small>Rubber</small></button>
          </div>
          <div class="case-front">PENCIL SET</div>
        </div>
        <button type="button" class="case-lid" data-group="pencil" aria-expanded="false">
          <span class="case-lid-title">Pencil Box</span>
          <span class="case-lid-art" aria-hidden="true">✏︎ ✎ ✐</span>
          <span class="case-hinge" aria-hidden="true"></span>
        </button>
      </section>

      <section class="instrument-case geometry-case" data-case="geometry">
        <div class="case-base">
          <div class="case-interior">
            <button type="button" class="case-tool" data-tool="pen"><span>✏️</span><small>Pen</small></button>
            <button type="button" class="case-tool" data-tool="compass"><span>🧭</span><small>Compass</small></button>
            <button type="button" class="case-tool" data-tool="rubber"><span>🧽</span><small>Rubber</small></button>
          </div>
          <div class="case-front">GEOMETRY SET</div>
        </div>
        <button type="button" class="case-lid" data-group="geometry" aria-expanded="false">
          <span class="case-lid-title">Geometry Box</span>
          <span class="case-lid-art" aria-hidden="true">△ 〇 ∠</span>
          <span class="case-hinge" aria-hidden="true"></span>
        </button>
      </section>
      <button type="button" class="tool-clear">Clear board</button>
    </div>

    <div class="chalk-strip" aria-label="Choose chalk color">
      <button type="button" class="chalk-stick active" data-color="#f5f2e7" style="--swatch:#f5f2e7" aria-label="White chalk"></button>
      <button type="button" class="chalk-stick" data-color="#f3d976" style="--swatch:#f3d976" aria-label="Yellow chalk"></button>
      <button type="button" class="chalk-stick" data-color="#e99cb5" style="--swatch:#e99cb5" aria-label="Pink chalk"></button>
      <button type="button" class="chalk-stick" data-color="#92d4dc" style="--swatch:#92d4dc" aria-label="Blue chalk"></button>
      <button type="button" class="chalk-stick" data-color="#a6dfab" style="--swatch:#a6dfab" aria-label="Green chalk"></button>
    </div>
  `;

  const chalkTray = frame.querySelector('.chalk-tray');
  if (chalkTray) {
    frame.insertBefore(toolbox, chalkTray);
    const chalkStrip = toolbox.querySelector('.chalk-strip');
    chalkTray.replaceChildren(...chalkStrip.children);
    chalkStrip.remove();
    chalkTray.classList.add('drawing-chalk-tray');
    chalkTray.setAttribute('aria-label', 'Choose chalk color');
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
    toolbox.querySelectorAll('.case-tool').forEach((button) => {
      button.classList.toggle('active', button.dataset.tool === tool);
    });
  }

  function setActiveGroup(group) {
    state.activeGroup = state.activeGroup === group ? null : group;
    toolbox.querySelectorAll('.instrument-case').forEach((caseBox) => {
      const isOpen = caseBox.dataset.case === state.activeGroup;
      caseBox.classList.toggle('is-open', isOpen);
      caseBox.querySelector('.case-lid').setAttribute('aria-expanded', String(isOpen));
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

  frame.addEventListener('click', (event) => {
    const groupButton = event.target.closest('.case-lid');
    if (groupButton) {
      setActiveGroup(groupButton.dataset.group);
      return;
    }

    const toolButton = event.target.closest('.case-tool');
    if (toolButton) {
      setActiveTool(toolButton.dataset.tool);
      return;
    }

    const swatch = event.target.closest('.chalk-stick');
    if (swatch) {
      state.color = swatch.dataset.color;
      setActiveTool('chalk');
      frame.querySelectorAll('.chalk-stick').forEach((button) => {
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
