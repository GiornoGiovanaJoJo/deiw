document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('requestSearchInput');
    var roleFilter = document.getElementById('roleFilter');
    if (!searchInput || !roleFilter) return;

    function filterRows() {
        var query = searchInput.value.trim().toLowerCase();
        var statusVal = roleFilter.value;
        var rows = document.querySelectorAll('.requests-table tbody tr');
        rows.forEach(function(row) {
            var id = row.getAttribute('data-id') || '';
            var name = row.getAttribute('data-name') || '';
            var email = row.getAttribute('data-email') || '';
            var phone = row.getAttribute('data-phone') || '';
            var status = row.getAttribute('data-status') || '';
            var matchSearch = !query || id.indexOf(query) !== -1 || name.indexOf(query) !== -1 || (email && email.indexOf(query) !== -1) || (phone && phone.indexOf(query) !== -1);
            var matchStatus = !statusVal || status === statusVal;
            row.style.display = (matchSearch && matchStatus) ? '' : 'none';
        });
    }

    searchInput.addEventListener('input', filterRows);
    roleFilter.addEventListener('change', filterRows);
});
