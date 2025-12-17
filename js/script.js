// Ключ для хранения данных в localStorage
    const STORAGE_KEY = 'food_expiry_items_v1';

    // Получаем ссылки на элементы DOM
    const form = document.getElementById('addForm');
    const nameInput = document.getElementById('name');
    const expiryInput = document.getElementById('expiry');
    const list = document.getElementById('list');
    const search = document.getElementById('search');
    const filter = document.getElementById('filter');
    const clearBtn = document.getElementById('clear');

    /* =====================================================
       Вспомогательные функции
       ===================================================== */

    // Загружаем данные из localStorage
    function loadItems() {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    // Сохраняем массив продуктов в localStorage
    function saveItems(items) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    // Создаёт HTML-разметку для одного продукта
    function createItemElement(item) {
      const div = document.createElement('div');
      div.className = 'item';

      // Вычисляем дни до истечения срока
      const today = new Date();
      const expiry = new Date(item.expiry);
      const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

      let tagClass = 'ok';
      let tagText = `${diff} дн.`;

      if (diff < 0) {
        tagClass = 'expired';
        tagText = 'Просрочено';
      } else if (diff <= 3) {
        tagClass = 'soon';
        tagText = `Осталось ${diff} дн.`;
      }


      // Текстовые данные
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `<div class="name">${item.name}</div><div class="muted">${item.expiry}</div>`;

      // Метка статуса
      const tag = document.createElement('div');
      tag.className = `tag ${tagClass}`;
      tag.textContent = tagText;

      // Кнопки управления
      const controls = document.createElement('div');
      controls.className = 'controls';

      const edit = document.createElement('button');
      edit.className = 'btn small';
      edit.textContent = '✏️';
      edit.onclick = () => editItem(item.id);

      const del = document.createElement('button');
      del.className = 'btn small ghost';
      del.textContent = '🗑';
      del.onclick = () => deleteItem(item.id);

      controls.append(edit, del);

      // Добавляем всё внутрь карточки
      div.append( meta, tag, controls);
      return div;
    }

    // Отрисовывает весь список
    function renderList() {
      const items = loadItems();
      list.innerHTML = '';

      // Фильтрация по поиску и статусу
      const q = search.value.toLowerCase();
      const f = filter.value;

      const filtered = items.filter(i => {
        const diff = Math.ceil((new Date(i.expiry) - new Date()) / (1000 * 60 * 60 * 24));
        const status = diff < 0 ? 'expired' : diff <= 3 ? 'soon' : 'ok';
        return (
          i.name.toLowerCase().includes(q) &&
          (f === 'all' || f === status)
        );
      });

      // Если нет данных
      if (!filtered.length) {
        list.innerHTML = '<div class="empty">Нет продуктов</div>';
        return;
      }

      // Рисуем каждую карточку
      filtered.forEach(i => list.append(createItemElement(i)));
    }

    /* =====================================================
       Основные действия: добавить / удалить / редактировать
       ===================================================== */

    // Добавление нового продукта
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const items = loadItems();
      const name = nameInput.value.trim();
      const expiry = expiryInput.value;

      items.push({ id: Date.now(), name, expiry });
      saveItems(items);
      form.reset();
      renderList();
    });

    // Удаление продукта
    function deleteItem(id) {
      const items = loadItems().filter(i => i.id !== id);
      saveItems(items);
      renderList();
    }

    // Редактирование продукта
    function editItem(id) {
      const items = loadItems();
      const item = items.find(i => i.id === id);
      const newName = prompt('Измени название:', item.name);
      if (!newName) return;
      item.name = newName;
      saveItems(items);
      renderList();
    }

    /* =====================================================
       Уведомления и вспомогательные элементы
       ===================================================== */

    // Очистить все данные
    clearBtn.onclick = () => {
      if (confirm('Удалить все продукты?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderList();
      }
    };

    // Уведомления о скором истечении срока
    document.getElementById('notify').onclick = () => {
      Notification.requestPermission().then(res => {
        if (res === 'granted') alert('Уведомления разрешены!');
      });
    };

    // Если разрешены уведомления — показываем предупреждения
    function showNotifications() {
      if (Notification.permission !== 'granted') return;
      const items = loadItems();
      const soon = items.filter(i => {
        const diff = Math.ceil((new Date(i.expiry) - new Date()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 2;
      });
      soon.forEach(i => {
        new Notification(`Скоро истечёт: ${i.name}`, { body: `До ${i.expiry}` });
      });
    }

    /* =====================================================
       События и инициализация
       ===================================================== */

    search.oninput = renderList;
    filter.onchange = renderList;

    // Первая отрисовка
    renderList();

    // Проверяем уведомления при загрузке страницы
    showNotifications();

    document.addEventListener('DOMContentLoaded', renderList);
 
  

  // Гамбургер-меню для мобильных
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  // Если элементов нет — выходим (на всякий случай)
  if (!hamburger || !navMenu) return;

  // Функция переключения меню
  function toggleMenu() {
    navMenu.classList.toggle('active');
  }

  // Всегда добавляем обработчик (даже если сейчас десктоп)
  hamburger.addEventListener('click', toggleMenu);

  // Закрываем меню при клике на ссылку
  navMenu.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });

  // При изменении размера окна (поворот экрана и т.д.)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 640) {
      navMenu.classList.remove('active'); // Закрываем на десктопе
    }
  });
});



