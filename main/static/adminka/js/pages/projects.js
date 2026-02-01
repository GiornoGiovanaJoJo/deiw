   // Инициализация AOS
   AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true
});

// Поиск и фильтрация
document.getElementById('searchInput').addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();

    const projects = document.querySelectorAll('.project-card');
    projects.forEach(project => {
        const projectCode = project.getAttribute('data-project-code') || '';
        const clientName = project.getAttribute('data-client-name') || '';
        const userCode = project.getAttribute('data-user-code') || '';
        const projectName = project.getAttribute('data-project-name') || '';
        const year = project.getAttribute('data-year') || '';
        const endDate = project.getAttribute('data-end-date') || '';
        const createdAt = project.getAttribute('data-created-at') || '';
        const category = project.getAttribute('data-category') || '';

        const match = projectCode.includes(query) ||
                      clientName.includes(query) ||
                      userCode.includes(query) ||
                      projectName.includes(query) ||
                      year.includes(query) ||
                      endDate.includes(query) ||
                      createdAt.includes(query) ||
                      category.includes(query);

        project.style.display = match ? '' : 'none';
    });
});

document.getElementById('statusFilter').addEventListener('change', function() {
    const statusFilter = this.value;
    const query = document.getElementById('searchInput').value.trim().toLowerCase();

    const projects = document.querySelectorAll('.project-card');
    projects.forEach(project => {
        const status = project.getAttribute('data-status') || '';
        const projectCode = project.getAttribute('data-project-code') || '';
        const clientName = project.getAttribute('data-client-name') || '';
        const userCode = project.getAttribute('data-user-code') || '';
        const projectName = project.getAttribute('data-project-name') || '';
        const year = project.getAttribute('data-year') || '';
        const endDate = project.getAttribute('data-end-date') || '';
        const createdAt = project.getAttribute('data-created-at') || '';
        const category = project.getAttribute('data-category') || '';

        const matchesStatus = !statusFilter || status === statusFilter;
        const matchesSearch = projectCode.includes(query) ||
                              clientName.includes(query) ||
                              userCode.includes(query) ||
                              projectName.includes(query) ||
                              year.includes(query) ||
                              endDate.includes(query) ||
                              createdAt.includes(query) ||
                              category.includes(query);

        project.style.display = (matchesStatus && matchesSearch) ? '' : 'none';
    });
});



function deleteProjectAjax(projectId) {
    if (!confirm('Sind Sie sicher, dass Sie dieses Projekt löschen möchten?')) {
        return;
    }

    fetch('library/php/pages/projects/project-delete.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: projectId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            // Удаляем строку проекта из таблицы или перезагружаем страницу
            const row = document.getElementById('project-row-' + projectId);
            if (row) row.remove();
        } else {
            alert('Ошибка: ' + data.message);
        }
    })
    .catch(error => {
        alert('Ошибка при запросе: ' + error);
    });
}
