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

  function place() {
    const width = Math.max(stage.clientWidth, 320);
    const height = Math.max(560, 220 + nodes.length * 34);
    stage.style.height = height + "px";
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.replaceChildren();

    const cx = width / 2;
    const cy = height / 2;
    const pos = {};
    const hub = nodes.find((node) => node.dataset.depth === "0") || nodes[0];
    pos[hub.dataset.id] = { x: cx, y: cy };

    const firstRing = childrenOf[hub.dataset.id] || [];
    const radius = Math.min(width, height) * (width < 640 ? 0.33 : 0.3);

    firstRing.forEach((node, index) => {
      const turn =
        (index / Math.max(firstRing.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const wobble = 0.18 * Math.sin(index * 2.15 + 0.4);
      const r = radius * (1 + wobble);
      pos[node.dataset.id] = {
        x: cx + Math.cos(turn) * r,
        y: cy + Math.sin(turn) * r
      };
    });

    firstRing.forEach((parent) => {
      const kids = childrenOf[parent.dataset.id] || [];
      if (!kids.length) return;
      const origin = pos[parent.dataset.id];
      const outward = Math.atan2(origin.y - cy, origin.x - cx);
      const spread = Math.min(1.7, 0.42 + kids.length * 0.26);
      kids.forEach((node, index) => {
        const t =
          kids.length === 1
            ? outward
            : outward - spread / 2 + (index / (kids.length - 1)) * spread;
        const r = radius * (0.56 + (index % 2) * 0.09);
        pos[node.dataset.id] = {
          x: origin.x + Math.cos(t) * r,
          y: origin.y + Math.sin(t) * r
        };
      });
    });

    for (let pass = 0; pass < 12; pass += 1) {
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const pa = pos[a.dataset.id];
          const pb = pos[b.dataset.id];
          let dx = pb.x - pa.x;
          let dy = pb.y - pa.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const min =
            a.dataset.depth === "0" || b.dataset.depth === "0" ? 126 : 96;
          if (dist >= min) continue;
          const push = (min - dist) / 2;
          dx /= dist;
          dy /= dist;
          if (a.dataset.depth !== "0") {
            pa.x -= dx * push;
            pa.y -= dy * push;
          }
          if (b.dataset.depth !== "0") {
            pb.x += dx * push;
            pb.y += dy * push;
          }
        }
      }
    }

    nodes.forEach((node) => {
      const point = pos[node.dataset.id];
      const pad = node.dataset.depth === "0" ? 88 : 76;
      point.x = Math.min(width - pad, Math.max(pad, point.x));
      point.y = Math.min(height - pad, Math.max(pad, point.y));
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
      const midX = (a.x + b.x) / 2 - dy * 0.12;
      const midY = (a.y + b.y) / 2 + dx * 0.12;
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
