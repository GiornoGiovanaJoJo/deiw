document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('adminSidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const body = document.body;

  let isSidebarOpen = false;

  function openSidebar() {
    isSidebarOpen = true;
    sidebar.classList.add('open');
    body.classList.remove('sidebar-closed');
  }

  function closeSidebar() {
    isSidebarOpen = false;
    sidebar.classList.remove('open');
    body.classList.add('sidebar-closed');
  }

  function toggleSidebar() {
    if (isSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  // Обработчик клика на кнопку
  toggleBtn.addEventListener('click', toggleSidebar);

  // Закрытие меню при клике вне его (только на мобильных)
  document.addEventListener('click', (e) => {
    if (
      window.innerWidth <= 767 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      closeSidebar();
    }
  });

  // Функция для установки состояния сайдбара в зависимости от ширины окна
  function setSidebarState() {
    if (window.innerWidth <= 767) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  // Установка состояния при загрузке страницы
  setSidebarState();

  // Обработка изменения размера окна
  window.addEventListener('resize', setSidebarState);
});