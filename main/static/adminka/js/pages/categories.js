  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('categoriesSearchInput');
    if (!searchInput) return;
  
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      const rows = document.querySelectorAll('.requests-table tbody tr');
  
      rows.forEach(row => {
        const userCode = row.getAttribute('data-id') || '';
        const name = row.getAttribute('data-name') || '';
        
  
        const match = userCode.includes(query) ||
                      name.includes(query);
  
        row.style.display = match ? '' : 'none';
      });
    });
  });



  function deleteCategories(id) {
    if (!confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) return;
    fetch('library/php/pages/categories/categories-delete.php?id=' + id, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const row = document.getElementById('request-row-' + id);
                if (row) row.remove();
            } else {
                alert(data.message || 'Fehler beim Entfernen der Kategorie');
            }
        })
        .catch(() => alert('Fehler beim Entfernen der Kategorie'));
}
