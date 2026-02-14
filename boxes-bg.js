// Boxes Grid Background Animation
class BoxesBackground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.interactionSurface =
      this.container.closest(".projects") || this.container.parentElement || this.container;

    this.palette = options.colors || [
      "rgb(125 211 252)",
      "rgb(249 168 212)",
      "rgb(134 239 172)",
      "rgb(253 224 71)",
      "rgb(252 165 165)",
      "rgb(216 180 254)",
      "rgb(147 197 253)",
      "rgb(165 180 252)",
      "rgb(196 181 253)",
    ];

    this.cellWidth = options.cellWidth || 64;
    this.cellHeight = options.cellHeight || 32;
    this.maxRows = options.maxRows || 100;
    this.maxCols = options.maxCols || 80;

    this.gridLayer = null;
    this.maskLayer = null;
    this.resizeHandler = () => this.buildGrid();
    this.pointerHandler = (event) => this.handlePointerMove(event);

    this.init();
  }

  init() {
    this.createLayers();
    this.buildGrid();
    window.addEventListener("resize", this.resizeHandler);
    this.interactionSurface.addEventListener("pointermove", this.pointerHandler, {
      passive: true,
    });
  }

  createLayers() {
    this.gridLayer = document.createElement("div");
    this.gridLayer.className = "projects-boxes-layer";

    this.maskLayer = document.createElement("div");
    this.maskLayer.className = "projects-boxes-mask";

    this.container.appendChild(this.gridLayer);
    this.container.appendChild(this.maskLayer);
  }

  randomColor() {
    return this.palette[Math.floor(Math.random() * this.palette.length)];
  }

  animateCell(cell) {
    if (!cell) return;

    cell.style.transition = "background-color 0s";
    cell.style.backgroundColor = this.randomColor();

    requestAnimationFrame(() => {
      cell.style.transition = "background-color 2s ease";
      cell.style.backgroundColor = "transparent";
    });
  }

  handlePointerMove(event) {
    const stack = document.elementsFromPoint(event.clientX, event.clientY);
    const targetCell = stack.find(
      (el) => el.classList && el.classList.contains("projects-boxes-cell")
    );

    if (targetCell) {
      this.animateCell(targetCell);
    }
  }

  buildGrid() {
    if (!this.gridLayer) return;

    const rect = this.container.getBoundingClientRect();
    const cols = Math.min(this.maxCols, Math.ceil((rect.width * 3) / this.cellWidth));
    const rows = Math.min(this.maxRows, Math.ceil((rect.height * 3) / this.cellHeight));

    this.gridLayer.textContent = "";

    const fragment = document.createDocumentFragment();

    for (let r = 0; r < rows; r++) {
      const row = document.createElement("div");
      row.className = "projects-boxes-row";

      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.className = "projects-boxes-cell";

        if (r % 2 === 0 && c % 2 === 0) {
          const plus = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          plus.setAttribute("viewBox", "0 0 24 24");
          plus.setAttribute("aria-hidden", "true");
          plus.classList.add("projects-boxes-plus");

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", "M12 6v12m6-6H6");
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          plus.appendChild(path);
          cell.appendChild(plus);
        }

        row.appendChild(cell);
      }

      fragment.appendChild(row);
    }

    this.gridLayer.appendChild(fragment);
  }

  destroy() {
    window.removeEventListener("resize", this.resizeHandler);
    this.interactionSurface.removeEventListener("pointermove", this.pointerHandler);
    if (this.gridLayer) this.gridLayer.remove();
    if (this.maskLayer) this.maskLayer.remove();
  }
}
