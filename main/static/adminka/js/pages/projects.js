document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true });
    }

    var searchInput = document.getElementById('searchInput');
    var statusFilter = document.getElementById('statusFilter');
    if (!searchInput || !statusFilter) return;

    function filterProjects() {
        var query = searchInput.value.trim().toLowerCase();
        var statusVal = statusFilter.value;
        var cards = document.querySelectorAll('.project-card');
        cards.forEach(function(project) {
            var projectCode = project.getAttribute('data-project-code') || '';
            var projectName = project.getAttribute('data-project-name') || '';
            var year = project.getAttribute('data-year') || '';
            var category = project.getAttribute('data-category') || '';
            var status = project.getAttribute('data-status') || '';
            var matchSearch = !query || projectCode.indexOf(query) !== -1 || projectName.indexOf(query) !== -1 || year.indexOf(query) !== -1 || category.indexOf(query) !== -1;
            var matchStatus = !statusVal || status === statusVal;
            project.style.display = (matchSearch && matchStatus) ? '' : 'none';
        });
    }

    searchInput.addEventListener('input', filterProjects);
    statusFilter.addEventListener('change', filterProjects);
});
