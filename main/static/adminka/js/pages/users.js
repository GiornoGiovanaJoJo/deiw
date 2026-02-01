document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('userSearchInput');
    if (!searchInput) return;
  
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      const rows = document.querySelectorAll('.orders-table tbody tr');
  
      rows.forEach(row => {
        const userCode = row.cells[0].textContent.toLowerCase();
        const name = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();
        const phone = row.cells[3].textContent.toLowerCase();
        const role = row.cells[4].textContent.toLowerCase();
  
        const match = userCode.includes(query) ||
                      name.includes(query) ||
                      email.includes(query) ||
                      phone.includes(query) ||
                      role.includes(query);
  
        row.style.display = match ? '' : 'none';
      });
    });
  });


  function deleteUser(userId) {
    if (!confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
        return;
    }

    fetch('library/php/pages/users/user-delete-ajax.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            const row = document.getElementById('user-row-' + userId);
            if (row) row.remove();
        } else {
            alert('Fehler: ' + data.message);
        }
    })
    .catch(error => {
        alert('Fehler beim Anfordern: ' + error);
    });
}