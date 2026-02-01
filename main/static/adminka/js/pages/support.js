document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('requestSearchInput');
    const roleFilter = document.getElementById('roleFilter');
    if (!searchInput || !roleFilter) return;
  
    function filterRows() {
      const query = searchInput.value.trim().toLowerCase();
      const roleValue = roleFilter.value.toLowerCase();
      const rows = document.querySelectorAll('.requests-table tbody tr');
  
      rows.forEach(row => {
        const userCode = row.getAttribute('data-id') || '';
        const name = row.getAttribute('data-name') || '';
        const email = row.getAttribute('data-email') || '';
        const phone = row.getAttribute('data-phone') || '';
        const status = row.getAttribute('data-status') || ''; // Статус в 7-й ячейке (индекс 6)
  
        const matchesSearch = userCode.includes(query) ||
                              name.includes(query) ||
                              email.includes(query) ||
                              phone.includes(query);

  
        const matchesRole = roleValue === '' || status === roleValue;
  
        row.style.display = (matchesSearch && matchesRole) ? '' : 'none';
      });
    }
  
    searchInput.addEventListener('input', filterRows);
    roleFilter.addEventListener('change', filterRows);
  });


  function deleteRequest(id) {
    if (!confirm('Sind Sie sicher, dass Sie diese Anwendung löschen möchten?')) return;
    fetch('library/php/pages/support/support-delete.php?id=' + id, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const row = document.getElementById('request-row-' + id);
                if (row) row.remove();
            } else {
                alert('Fehler beim Löschen einer Anwendung');
            }
        })
        .catch(() => alert('Fehler beim Löschen einer Anwendung'));
}
