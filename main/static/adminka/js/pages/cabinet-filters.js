/**
 * Фильтрация карточек в личном кабинете: статус, категория, поиск по номеру.
 * Подключать на страницах Заявки и Заказы.
 */
(function() {
    var statusFilter = document.getElementById('statusFilter');
    var categoryFilter = document.getElementById('categoryFilter');
    var searchInput = document.getElementById('searchInput');
    var sections = document.querySelectorAll('.cabinet-section');

    function filterCards() {
        var statusVal = (statusFilter && statusFilter.value) ? statusFilter.value.trim().toLowerCase() : '';
        var categoryVal = (categoryFilter && categoryFilter.value) ? categoryFilter.value.trim().toLowerCase() : '';
        var searchVal = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase().replace(/\s/g, '') : '';

        sections.forEach(function(section) {
            var cards = section.querySelectorAll('.cabinet-card');
            var visibleInSection = 0;
            cards.forEach(function(card) {
                var status = (card.getAttribute('data-status') || '').toLowerCase();
                var category = (card.getAttribute('data-category') || '').toLowerCase();
                var number = (card.getAttribute('data-number') || '').toLowerCase().replace(/\s/g, '');
                var show = true;
                if (statusVal && status !== statusVal) show = false;
                if (show && categoryVal && category.indexOf(categoryVal) === -1) show = false;
                if (show && searchVal && number.indexOf(searchVal) === -1) show = false;
                card.style.display = show ? '' : 'none';
                if (show) visibleInSection++;
            });
            section.style.display = visibleInSection > 0 ? '' : 'none';
        });
    }

    if (statusFilter) statusFilter.addEventListener('change', filterCards);
    if (categoryFilter) categoryFilter.addEventListener('change', filterCards);
    if (searchInput) searchInput.addEventListener('input', filterCards);
})();
