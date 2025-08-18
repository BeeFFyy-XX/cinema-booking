export function el(tag, attrs={}, children=[]) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.substring(2), v);
    else if (v !== null && v !== undefined) e.setAttribute(k, v);
  });
  if (!Array.isArray(children)) children = [children];
  children.filter(Boolean).forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
