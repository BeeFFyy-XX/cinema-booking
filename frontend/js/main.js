import { apiGet, apiPost, apiPut, apiDelete, setApiBase } from './api.js';
import { register, login, logout, currentUser } from './auth.js';
import { el, clear } from './ui.js';
import { renderSeatGrid } from './seats.js';

const app = document.getElementById('app');
const authZone = document.getElementById('auth-zone');
document.getElementById('nav-afisha').addEventListener('click', showAfisha);
document.getElementById('nav-bookings').addEventListener('click', showBookings);
document.getElementById('nav-admin').addEventListener('click', showAdminPanel);

initAuthZone();
showAfisha();

// ---------- auth UI ----------
function initAuthZone() {
  const u = currentUser();
  authZone.innerHTML = '';
  if (u) {
    authZone.appendChild(el('span', {}, `Вітаю, ${u.name}`));
    authZone.appendChild(el('button', { class:'ghost', onclick: () => { logout(); initAuthZone(); showAfisha(); } }, 'Вийти'));
  } else {
    const emailI = el('input', { class:'input', placeholder:'email' });
    const emailError = el('div', { class: 'error-text' });

    const passI = el('input', { class:'input', placeholder:'пароль', type:'password' });
    const passError = el('div', { class: 'error-text' });

    // Валідація email при введенні
    emailI.addEventListener('input', () => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailI.value);
      emailError.textContent = isValid ? '' : 'Некоректний формат email';
      emailI.style.border = isValid ? '' : '2px solid red';
    });

    // Валідація пароля при введенні
    passI.addEventListener('input', () => {
      const isValid = passI.value.length >= 6;
      passError.textContent = isValid ? '' : 'Мінімум 6 символів';
      passI.style.border = isValid ? '' : '2px solid red';
    });

    const nameI = el('input', { class:'input', placeholder:'імʼя' });
    const loginBtn = el('button', { onclick: async () => {
        // Перевірка перед відправкою
        let hasError = false;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailI.value)) {
          emailError.textContent = 'Введіть коректний email';
          emailI.style.border = '2px solid red';
          hasError = true;
        }

        if (passI.value.length < 6) {
          passError.textContent = 'Пароль закороткий (мін. 6 символів)';
          passI.style.border = '2px solid red';
          hasError = true;
        }

        if (hasError) return;

        try {
          await login(emailI.value, passI.value);
          initAuthZone();
          showAfisha();
        } catch (err) {
          // Показуємо повідомлення про помилку
          alert(err.message);
        }
      }}, 'Увійти');

    const regBtn = el('button', { class:'ghost', onclick: async () => {
        // Аналогічна перевірка для реєстрації
        let hasError = false;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailI.value)) {
          emailError.textContent = 'Введіть коректний email';
          emailI.style.border = '2px solid red';
          hasError = true;
        }

        if (passI.value.length < 6) {
          passError.textContent = 'Пароль закороткий (мін. 6 символів)';
          passI.style.border = '2px solid red';
          hasError = true;
        }

        if (nameI.value.trim().length < 2) {
          alert("Ім'я повинно містити мінімум 2 символи");
          hasError = true;
        }

        if (hasError) return;

        try {
          await register(nameI.value || 'Користувач', emailI.value, passI.value);
          initAuthZone();
          showAfisha();
        } catch (err) {
          alert('Помилка реєстрації: ' + err.message);
        }
      }}, 'Реєстрація');

    const apiI = el('input', { class:'input', placeholder:'API http://localhost:4000/api', style:'min-width:220px' });
    const setBtn = el('button', { class:'ghost', onclick: () => { setApiBase(apiI.value); alert('API base змінено'); } }, 'Задати API');

    const wrap = el('div', { class:'auth' }, [
      nameI,
      emailI,
      emailError,
      passI,
      passError,
      loginBtn,
      regBtn,
      apiI,
      setBtn
    ]);

    authZone.appendChild(wrap);
  }
  updateNavVisibility();
}

function updateNavVisibility() {
  const u = currentUser();
  const adminBtn = document.getElementById('nav-admin');
  adminBtn.style.display = (u && u.role === 'admin') ? 'inline-block' : 'none';
}

// ---------- Афіша ----------
async function showAfisha() {
  clear(app);
  const section = el('div', { class:'section' }, [
    el('div', { class:'toolbar' }, [ el('h2', {}, 'Афіша') ]),
    el('div', { class:'grid', id:'grid' })
  ]);
  app.appendChild(section);
  const grid = section.querySelector('#grid');
  const movies = await apiGet('/movies');
  const sessions = await apiGet('/sessions');
  const byMovie = {};
  sessions.forEach(s => {
    const m = (s.movie?._id) || s.movie;
    byMovie[m] = byMovie[m] || [];
    byMovie[m].push(s);
  });
  movies.forEach(m => {
    const card = document.querySelector('#tpl-movie-card').content.cloneNode(true);
    card.querySelector('.poster').src = m.posterUrl || 'https://picsum.photos/seed/'+(m._id)+'/600/400';
    card.querySelector('.title').textContent = m.title + (m.duration ? ` (${m.duration} хв)` : '');
    card.querySelector('.desc').textContent = m.description || '';
    card.querySelector('.btn-sessions').addEventListener('click', () => showMovieSessions(m, byMovie[m._id] || []));
    grid.appendChild(card);
  });
}

function showMovieSessions(movie, sessions) {
  clear(app);
  app.appendChild(el('div', { class:'section' }, [
    el('h2', {}, `Сеанси — ${movie.title}`),
    el('div', {}, sessions.map(s => {
      const dt = new Date(s.dateTime);
      return el('div', { class:'card' }, [
        el('div', {}, `${dt.toLocaleString()} — Зал: ${s.hall?.name || ''} — Ціна: ${s.price} грн`),
        el('div', {}, el('button', { onclick: () => showSessionBooking(s) }, 'Обрати місця'))
      ]);
    })),
    el('div', {}, el('button', { class:'ghost', onclick: showAfisha }, '← Назад'))
  ]));
}

async function showSessionBooking(session) {
  clear(app);
  const sDetail = await apiGet('/sessions/' + session._id);
  const rows = sDetail.hall.rows;
  const seatsPerRow = sDetail.hall.seatsPerRow;
  const taken = sDetail.takenSeats || [];
  const selected = [];
  const seatWrap = el('div');
  function onToggle(seat, add) {
    if (add) selected.push(seat);
    else {
      const idx = selected.findIndex(x => x.row===seat.row && x.seat===seat.seat);
      if (idx>=0) selected.splice(idx,1);
    }
    count.textContent = String(selected.length);
    total.textContent = String(selected.length * sDetail.price);
  }
  const count = el('strong', {}, '0');
  const total = el('strong', {}, '0');
  app.appendChild(el('div', { class:'section' }, [
    el('h2', {}, `Вибір місць — ${sDetail.movie.title}`),
    el('div', { class:'small' }, `Зал: ${sDetail.hall.name}, Рядів: ${rows}, Місць в ряду: ${seatsPerRow}`),
    seatWrap,
    el('div', { class:'toolbar' }, [
      el('div', {}, ['Обрано місць: ', count, ' | Сума: ', total, ' грн']),
      el('div', {}, el('button', { onclick: () => submitBooking(sDetail._id, selected) }, 'Забронювати'))
    ]),
    el('div', {}, el('button', { class:'ghost', onclick: showAfisha }, '← Назад'))
  ]));
  renderSeatGrid(seatWrap, rows, seatsPerRow, taken, selected, onToggle);
}

async function submitBooking(sessionId, tickets) {
  if (!currentUser()) { alert('Потрібно увійти'); return; }
  try {
    await apiPost('/bookings', { sessionId, tickets });
    alert('Заброньовано! Перейдіть у "Мої бронювання" щоб оплатити.');
  } catch (e) {
    alert(e.message);
  }
}

async function showBookings() {
  clear(app);
  if (!currentUser()) { app.appendChild(el('div', {}, 'Спочатку увійдіть')); return; }
  const list = await apiGet('/bookings');
  app.appendChild(el('div', { class:'section' }, [
    el('h2', {}, 'Мої бронювання'),
    el('table', {}, [
      el('thead', {}, el('tr', {}, [
        el('th', {}, 'Фільм'), el('th', {}, 'Час'), el('th', {}, 'Місця'), el('th', {}, 'Статус'), el('th', {}, 'Дії')
      ])),
      el('tbody', {}, list.map(b => {
        const dt = new Date(b.session?.dateTime);
        const places = b.tickets.map(t => `р${t.row}-м${t.seat}`).join(', ');
        const payBtn = el('button', { onclick: () => pay(b._id) }, 'Оплатити');
        const cancelBtn = el('button', { class:'ghost', onclick: () => cancelBooking(b._id) }, 'Скасувати');
        return el('tr', {}, [
          el('td', {}, b.session?.movie?.title || ''),
          el('td', {}, dt.toLocaleString()),
          el('td', {}, places),
          el('td', {}, b.paymentStatus),
          el('td', {}, [payBtn, ' ', cancelBtn])
        ]);
      }))
    ]),
    el('div', {}, el('button', { class:'ghost', onclick: showAfisha }, '← До афіші'))
  ]));
}

async function pay(bookingId) {
  try {
    await apiPost('/payments/pay', { bookingId, method:'mock' });
    alert('Оплачено!');
    showBookings();
  } catch (e) {
    alert(e.message);
  }
}

async function cancelBooking(id) {
  try {
    await apiPost(`/bookings/${id}/cancel`, {});
    alert('Скасовано');
    showBookings();
  } catch (e) {
    alert(e.message);
  }
}

// ---------- Admin Panel ----------
async function showAdminPanel() {
  if (!currentUser() || currentUser().role !== 'admin') { alert('Лише для адмінів'); return; }
  clear(app);
  const container = el('div', { class:'section' }, [
    el('h2', {}, 'Адмін-панель'),
    el('div', { class:'toolbar' }, [
      el('button', { onclick: showMoviesAdmin }, 'Фільми'),
      el('button', { onclick: showHallsAdmin }, 'Зали'),
      el('button', { onclick: showSessionsAdmin }, 'Сеанси'),
      el('button', { onclick: showScheduleAdmin }, 'Розклад'),
      el('button', { onclick: showBookingsAdmin }, 'Броні користувачів'),
      el('button', { class:'ghost', onclick: showAfisha }, '← Назад')
    ]),
    el('div', { id:'admin-content' })
  ]);
  app.appendChild(container);
  showMoviesAdmin();
}
// ---------- Bookings Admin ----------
async function showBookingsAdmin() {
  if (!currentUser() || currentUser().role !== 'admin') { alert('Лише для адмінів'); return; }
  clear(document.getElementById('admin-content'));
  const root = document.getElementById('admin-content');

  const list = await apiGet('/bookings/admin');

  root.appendChild(el('div', { class:'section' }, [
    el('h2', {}, 'Бронювання користувачів'),
    el('table', {}, [
      el('thead', {}, el('tr', {}, [
        el('th', {}, 'Користувач'),
        el('th', {}, 'Фільм'),
        el('th', {}, 'Час'),
        el('th', {}, 'Місця'),
        el('th', {}, 'Статус'),
        el('th', {}, 'Дії')
      ])),
      el('tbody', {}, list.map(b => {
        const dt = new Date(b.session?.dateTime);
        const places = b.tickets.map(t => `р${t.row}-м${t.seat}`).join(', ');

        // Кнопки дій
        const cancelBtn = el('button', { class:'ghost', onclick: async () => {
            if(confirm('Скасувати цю бронь?')) {
              try {
                await apiPost(`/bookings/${b._id}/cancel`, {});
                showBookingsAdmin();
              } catch(e) { alert(e.message); }
            }
          }}, 'Скасувати');

        const editBtn = el('button', { onclick: async () => {
            const newPlaces = prompt('Введіть нові місця у форматі р1-м1,р1-м2,...', places);
            if(!newPlaces) return;
            const tickets = newPlaces.split(',').map(p => {
              const [r, m] = p.replace('р','').replace('м','').split('-').map(Number);
              return { row:r, seat:m };
            });
            try {
              await apiPut(`/bookings/${b._id}`, { tickets });
              showBookingsAdmin();
            } catch(e) { alert(e.message); }
          }}, 'Редагувати');

        return el('tr', {}, [
          el('td', {}, b.user?.name || 'Анонім'),
          el('td', {}, b.session?.movie?.title || ''),
          el('td', {}, dt.toLocaleString()),
          el('td', {}, places),
          el('td', {}, b.paymentStatus),
          el('td', {}, [editBtn, ' ', cancelBtn])
        ]);
      }))
    ])
  ]));
}

function toRow(cells=[]) { return el('tr', {}, cells.map(td => el('td', {}, td))); }

// ---------- Schedule Admin ----------
async function showScheduleAdmin() {
  const root = document.getElementById('admin-content');
  clear(root);

  const sessions = await apiGet('/sessions?populate=movie,hall');

  if (!sessions.length) {
    root.appendChild(el('div', {}, 'Сеансів поки немає'));
    return;
  }

  const tbody = el('tbody', {}, sessions.map(s => {
    const dt = new Date(s.dateTime);
    return toRow([
      s.movie?.title || '',
      s.hall?.name || '',
      dt.toLocaleString('uk-UA'),
      s.price + ' грн'
    ]);
  }));

  root.appendChild(el('div', { class:'section' }, [
    el('h3', {}, 'Розклад сеансів'),
    el('table', {}, [
      el('thead', {}, el('tr', {}, [
        el('th', {}, 'Фільм'),
        el('th', {}, 'Зал'),
        el('th', {}, 'Дата/час'),
        el('th', {}, 'Ціна')
      ])),
      tbody
    ])
  ]));
}

// ---- Movies CRUD ----
async function showMoviesAdmin() {
  const root = document.getElementById('admin-content'); clear(root);
  const list = await apiGet('/movies');

  // create form
  const titleI = el('input', { class:'input', placeholder:'Назва' });
  const genreI = el('input', { class:'input', placeholder:'Жанр' });
  const durI = el('input', { class:'input', placeholder:'Тривалість (хв)', type:'number' });
  const posterI = el('input', { class:'input', placeholder:'Poster URL (необов.)' });
  const descI = el('input', { class:'input', placeholder:'Опис' });
  const addBtn = el('button', { onclick: async () => {
      await apiPost('/movies', { title:titleI.value, genre:genreI.value, duration:+durI.value||null, posterUrl:posterI.value, description:descI.value });
      showMoviesAdmin();
    } }, 'Додати');

  root.appendChild(el('div', { class:'section' }, [
    el('h3', {}, 'Фільми'),
    el('div', { class:'row' }, [titleI, genreI, durI, posterI, descI, addBtn])
  ]));

  // table
  const tbody = el('tbody', {}, list.map(m => {
    const tI = el('input', { class:'input', value: m.title });
    const gI = el('input', { class:'input', value: m.genre || '' });
    const dI = el('input', { class:'input', type:'number', value: m.duration || '' });
    const pI = el('input', { class:'input', value: m.posterUrl || '' });
    const dsI = el('input', { class:'input', value: m.description || '' });
    const save = el('button', { onclick: async () => {
        await apiPut('/movies/'+m._id, { title:tI.value, genre:gI.value, duration:+dI.value||null, posterUrl:pI.value, description:dsI.value });
        showMoviesAdmin();
      } }, 'Зберегти');
    const del = el('button', { class:'ghost', onclick: async () => { if(confirm('Видалити?')) { await apiDelete('/movies/'+m._id); showMoviesAdmin(); } } }, 'Видалити');
    return toRow([tI, gI, dI, pI, dsI, el('div', {}, [save, ' ', del])]);
  }));

  root.appendChild(el('table', {}, [
    el('thead', {}, el('tr', {}, [el('th', {}, 'Назва'), el('th', {}, 'Жанр'), el('th', {}, 'Хв'), el('th', {}, 'Постер'), el('th', {}, 'Опис'), el('th', {}, 'Дії')])),
    tbody
  ]));
}

// ---- Halls CRUD ----
async function showHallsAdmin() {
  const root = document.getElementById('admin-content'); clear(root);
  const list = await apiGet('/halls');

  const nameI = el('input', { class:'input', placeholder:'Назва залу' });
  const rowsI = el('input', { class:'input', placeholder:'Рядів', type:'number' });
  const seatsI = el('input', { class:'input', placeholder:'Місць у ряду', type:'number' });
  const addBtn = el('button', { onclick: async () => {
      await apiPost('/halls', { name:nameI.value, rows:+rowsI.value, seatsPerRow:+seatsI.value });
      showHallsAdmin();
    } }, 'Додати');

  root.appendChild(el('div', { class:'section' }, [
    el('h3', {}, 'Зали'),
    el('div', { class:'row' }, [nameI, rowsI, seatsI, addBtn])
  ]));

  const tbody = el('tbody', {}, list.map(h => {
    const nI = el('input', { class:'input', value: h.name });
    const rI = el('input', { class:'input', type:'number', value: h.rows });
    const sI = el('input', { class:'input', type:'number', value: h.seatsPerRow });
    const save = el('button', { onclick: async () => {
        await apiPut('/halls/'+h._id, { name:nI.value, rows:+rI.value, seatsPerRow:+sI.value }); showHallsAdmin();
      } }, 'Зберегти');
    const del = el('button', { class:'ghost', onclick: async () => { if(confirm('Видалити?')) { await apiDelete('/halls/'+h._id); showHallsAdmin(); } } }, 'Видалити');
    return toRow([nI, rI, sI, el('div', {}, [save, ' ', del])]);
  }));

  root.appendChild(el('table', {}, [
    el('thead', {}, el('tr', {}, [el('th', {}, 'Назва'), el('th', {}, 'Рядів'), el('th', {}, 'Місць/ряд'), el('th', {}, 'Дії')])),
    tbody
  ]));
}


// ---- Sessions CRUD ----
async function showSessionsAdmin() {
  const root = document.getElementById('admin-content'); clear(root);
  const [movies, halls, sessions] = await Promise.all([apiGet('/movies'), apiGet('/halls'), apiGet('/sessions'), apiGet('/sessions?populate=movie,hall')]);




  const movieSel = el('select', { class: 'input' }, movies.map(m => el('option', { value: m._id }, m.title)));
  const hallSel = el('select', { class: 'input' }, halls.map(h => el('option', { value: h._id }, h.name)));
  const dtI = el('input', { class:'input', type:'datetime-local' });
  const priceI = el('input', { class:'input', placeholder:'Ціна', type:'number' });

  const addBtn = el('button', { onclick: async () => {
      const iso = dtI.value ? new Date(dtI.value).toISOString() : null;

      // Перевірка на фронтенді
      if (!dtI.value) {
        alert('Будь ласка, введіть дату сеансу');
        return;
      }

      const selectedDate = new Date(dtI.value);
      const currentDate = new Date();

      if (selectedDate <= currentDate) {
        const formattedSelected = selectedDate.toLocaleString('uk-UA', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const formattedCurrent = currentDate.toLocaleString('uk-UA', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        alert(`Дата сеансу повинна бути в майбутньому!\n\nВибрана дата: ${formattedSelected}\nПоточна дата: ${formattedCurrent}`);
        return;
      }

      try {
        await apiPost('/sessions', { movie: movieSel.value, hall: hallSel.value, dateTime: iso, price: +priceI.value });
        showSessionsAdmin();
      } catch (e) {
        console.error(e);
        alert('Помилка при додаванні сеансу: ' + e.message);
      }
    }
  }, 'Додати сеанс');

  root.appendChild(el('div', { class:'section' }, [
    el('h3', {}, 'Сеанси'),
    el('div', { class:'row' }, [movieSel, hallSel, dtI, priceI, addBtn]),
    el('div', { class:'small' }, 'Час у форматі локали; у БД зберігається ISO UTC.')
  ]));

  const tbody = el('tbody', {}, sessions.map(s => {
    // Функція для отримання ID фільму незалежно від того, чи він попульований
    const getMovieId = () => {
      if (typeof s.movie === 'string') return s.movie; // Якщо це просто ID
      return s.movie?._id || s.movie; // Якщо це об'єкт
    };

    const currentMovieId = getMovieId();
    const mSel = el('select', { class:'input' }, movies.map(m => {
      const selected = currentMovieId === m._id;
      return el('option', {
        value: m._id,
        selected: selected
      }, m.title);
    }));
    // Аналогічно для залу
    const getHallId = () => {
      if (typeof s.hall === 'string') return s.hall;
      return s.hall?._id || s.hall;
    };

    const currentHallId = getHallId();
    const hSel = el('select', { class:'input' }, halls.map(h => {
      const selected = currentHallId === h._id;
      return el('option', {
        value: h._id,
        selected: selected
      }, h.name);
    }));
    const dt = new Date(s.dateTime);
    const dtLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0,16);
    const dtEdit = el('input', { class:'input', type:'datetime-local', value: dtLocal });
    const priceEdit = el('input', { class:'input', type:'number', value: s.price });

    const save = el('button', { onclick: async () => {
        const iso = dtEdit.value ? new Date(dtEdit.value).toISOString() : null;

        // Перевірка для редагування
        if (!dtEdit.value) {
          alert('Будь ласка, введіть дату сеансу');
          return;
        }

        const selectedDate = new Date(dtEdit.value);
        const currentDate = new Date();

        if (selectedDate <= currentDate) {
          const formattedSelected = selectedDate.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const formattedCurrent = currentDate.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          alert(`Дата сеансу повинна бути в майбутньому!\n\nВибрана дата: ${formattedSelected}\nПоточна дата: ${formattedCurrent}`);
          return;
        }

        try {
          await apiPut('/sessions/'+s._id, { movie:mSel.value, hall:hSel.value, dateTime: iso, price:+priceEdit.value });
          showSessionsAdmin();
        } catch (e) {
          console.error(e);
          alert('Помилка при оновленні сеансу: ' + e.message);
        }
      }
    }, 'Зберегти');

    const del = el('button', { class:'ghost', onclick: async () => {
        if (confirm('Видалити цей сеанс?')) {
          try {
            await apiDelete('/sessions/'+s._id);
            showSessionsAdmin();
          } catch (e) {
            alert('Помилка при видаленні: ' + e.message);
          }
        }
      }
    }, 'Видалити');

    return toRow([mSel, hSel, dtEdit, priceEdit, el('div', {}, [save, ' ', del])]);
  }));

  root.appendChild(el('table', {}, [
    el('thead', {}, el('tr', {}, [
      el('th', {}, 'Фільм'), el('th', {}, 'Зал'), el('th', {}, 'Дата/час'), el('th', {}, 'Ціна'), el('th', {}, 'Дії')
    ])),
    tbody
  ]));
}
