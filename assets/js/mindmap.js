(function () {
  const stage = document.getElementById("mindmap-stage");
  const svg = document.getElementById("mindmap-edges");
  if (!stage || !svg) return;

  const nodes = Array.from(stage.querySelectorAll(".mm-node"));
  if (!nodes.length) return;

  const childrenOf = {};
  nodes.forEach((node) => {
    const parentId = node.dataset.parent;
    if (!parentId) return;
    (childrenOf[parentId] ||= []).push(node);
  });

  function sizeOf(node) {
    return {
      w: Math.max(node.offsetWidth, 48),
      h: Math.max(node.offsetHeight, 28)
    };
  }

  function place() {
    const width = Math.max(stage.clientWidth, 320);
    const compact = width < 640;
    const height = Math.max(compact ? 620 : 680, Math.round(width * 0.86));
    stage.style.height = height + "px";
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.replaceChildren();

    const cx = width / 2;
    const cy = height / 2;
    const pos = {};
    const hub = nodes.find((node) => node.dataset.depth === "0") || nodes[0];
    pos[hub.dataset.id] = { x: cx, y: cy };

    const firstRing = childrenOf[hub.dataset.id] || [];
    const inner = Math.min(width, height) * (compact ? 0.26 : 0.23);

    firstRing.forEach((node, index) => {
      const turn =
        ((index + 0.5) / Math.max(firstRing.length, 1)) * Math.PI * 2 -
        Math.PI / 2;
      pos[node.dataset.id] = {
        x: cx + Math.cos(turn) * inner,
        y: cy + Math.sin(turn) * inner
      };
    });

    firstRing.forEach((parent) => {
      const kids = childrenOf[parent.dataset.id] || [];
      if (!kids.length) return;
      const origin = pos[parent.dataset.id];
      const outward = Math.atan2(origin.y - cy, origin.x - cx);
      const spread = Math.min(2.2, 0.7 + kids.length * 0.32);
      const reach = Math.min(width, height) * (compact ? 0.2 : 0.22);
      kids.forEach((node, index) => {
        const t =
          kids.length === 1
            ? outward
            : outward - spread / 2 + (index / (kids.length - 1)) * spread;
        pos[node.dataset.id] = {
          x: origin.x + Math.cos(t) * reach,
          y: origin.y + Math.sin(t) * reach
        };
      });
    });

    for (let pass = 0; pass < 36; pass += 1) {
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const pa = pos[a.dataset.id];
          const pb = pos[b.dataset.id];
          const sa = sizeOf(a);
          const sb = sizeOf(b);
          let dx = pb.x - pa.x;
          let dy = pb.y - pa.y;
          const gapX = sa.w / 2 + sb.w / 2 + 16;
          const gapY = sa.h / 2 + sb.h / 2 + 14;
          if (Math.abs(dx) >= gapX || Math.abs(dy) >= gapY) continue;
          if (dx === 0 && dy === 0) {
            dx = 0.01;
            dy = 0.01;
          }
          const ox = (gapX - Math.abs(dx)) / 2;
          const oy = (gapY - Math.abs(dy)) / 2;
          const pushX = Math.sign(dx || 1) * ox;
          const pushY = Math.sign(dy || 1) * oy;
          if (a.dataset.depth !== "0") {
            pa.x -= pushX;
            pa.y -= pushY;
          }
          if (b.dataset.depth !== "0") {
            pb.x += pushX;
            pb.y += pushY;
          }
        }
      }
    }

    nodes.forEach((node) => {
      const point = pos[node.dataset.id];
      const size = sizeOf(node);
      const padX = size.w / 2 + 16;
      const padY = size.h / 2 + 16;
      point.x = Math.min(width - padX, Math.max(padX, point.x));
      point.y = Math.min(height - padY, Math.max(padY, point.y));
      node.style.left = point.x + "px";
      node.style.top = point.y + "px";
    });

    nodes.forEach((node) => {
      const parentId = node.dataset.parent;
      if (!parentId || !pos[parentId]) return;
      const a = pos[parentId];
      const b = pos[node.dataset.id];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const midX = (a.x + b.x) / 2 - dy * 0.08;
      const midY = (a.y + b.y) / 2 + dx * 0.08;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute(
        "d",
        "M" + a.x + "," + a.y + " Q" + midX + "," + midY + " " + b.x + "," + b.y
      );
      path.setAttribute("class", "mindmap-edge");
      svg.appendChild(path);
    });

    stage.classList.add("is-ready");
  }

  place();
  window.addEventListener("resize", place);
})();
