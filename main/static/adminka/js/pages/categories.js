document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('categoriesSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        var query = searchInput.value.trim().toLowerCase();
        var rows = document.querySelectorAll('.categories-table tbody tr');
        rows.forEach(function(row) {
            var name = row.getAttribute('data-name') || '';
            var nameEn = row.getAttribute('data-name-en') || '';
            var nameDe = row.getAttribute('data-name-de') || '';
            var id = row.getAttribute('data-id') || '';
            var match = !query || name.indexOf(query) !== -1 || nameEn.indexOf(query) !== -1 || nameDe.indexOf(query) !== -1 || id.indexOf(query) !== -1;
            row.style.display = match ? '' : 'none';
        });
    });
});
