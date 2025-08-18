import { el } from './ui.js';

export function renderSeatGrid(container, rows, seatsPerRow, taken=[], selected=[], onToggle=()=>{}) {
  container.innerHTML = '';
  const grid = el('div', { class: 'seats', style: `grid-template-columns: repeat(${seatsPerRow}, 28px)` });
  const takenSet = new Set(taken.map(t => `${t.row}-${t.seat}`));
  const selSet = new Set(selected.map(t => `${t.row}-${t.seat}`));
  for (let r=1; r<=rows; r++) {
    for (let s=1; s<=seatsPerRow; s++) {
      const key = `${r}-${s}`;
      const seat = el('div', { class: 'seat' }, String(s));
      if (takenSet.has(key)) seat.classList.add('taken');
      if (selSet.has(key)) seat.classList.add('selected');
      seat.addEventListener('click', () => {
        if (seat.classList.contains('taken')) return;
        if (selSet.has(key)) { selSet.delete(key); seat.classList.remove('selected'); onToggle({row:r, seat:s}, false); }
        else { selSet.add(key); seat.classList.add('selected'); onToggle({row:r, seat:s}, true); }
      });
      grid.appendChild(seat);
    }
  }
  container.appendChild(grid);
}
