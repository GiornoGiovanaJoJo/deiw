/**
 * Заявки в кабинете: модальное окно создания заявки, удаление, загрузка категорий/подкатегорий/вопросов.
 */
(function() {
    var modal = document.getElementById('modalCreateRequest');
    var btnOpen = document.getElementById('btnCreateRequest');
    var btnOpenEmpty = document.getElementById('btnCreateRequestEmpty');
    var form = document.getElementById('formCreateRequest');
    var modalCategory = document.getElementById('modalCategory');
    var modalSubcategory = document.getElementById('modalSubcategory');
    var modalQuestions = document.getElementById('modalQuestions');
    var csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    var getCsrf = function() { return csrfToken ? csrfToken.value : (document.querySelector('meta[name=csrf-token]') && document.querySelector('meta[name=csrf-token]').getAttribute('content')) || ''; };

    function openModal() {
        if (modal) {
            modal.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
            loadCategories();
        }
    }
    function closeModal() {
        if (modal) {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
        }
    }
    function loadCategories() {
        if (!modalCategory) return;
        modalCategory.innerHTML = '<option value="">— Выберите —</option>';
        modalSubcategory.innerHTML = '<option value="">— Выберите —</option>';
        modalQuestions.innerHTML = '';
        fetch('/api/request-categories/')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                (data.categories || []).forEach(function(c) {
                    var opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    modalCategory.appendChild(opt);
                });
            })
            .catch(function() {});
    }
    function loadSubcategories(categoryId) {
        if (!modalSubcategory) return;
        modalSubcategory.innerHTML = '<option value="">— Выберите —</option>';
        modalQuestions.innerHTML = '';
        if (!categoryId) return;
        fetch('/api/request-subcategories/?category_id=' + encodeURIComponent(categoryId))
            .then(function(r) { return r.json(); })
            .then(function(data) {
                (data.subcategories || []).forEach(function(s) {
                    var opt = document.createElement('option');
                    opt.value = s.id;
                    opt.textContent = s.name;
                    modalSubcategory.appendChild(opt);
                });
            })
            .catch(function() {});
    }
    function loadQuestions(subcategoryId) {
        modalQuestions.innerHTML = '';
        if (!subcategoryId) return;
        fetch('/api/request-questions/?subcategory_id=' + encodeURIComponent(subcategoryId))
            .then(function(r) { return r.json(); })
            .then(function(data) {
                (data.questions || []).forEach(function(q) {
                    var wrap = document.createElement('div');
                    wrap.className = 'form-group';
                    var label = document.createElement('label');
                    label.textContent = q.text;
                    label.setAttribute('for', 'extra_' + q.field_name);
                    var input = document.createElement('input');
                    input.type = 'text';
                    input.name = 'extra_' + q.field_name;
                    input.id = 'extra_' + q.field_name;
                    wrap.appendChild(label);
                    wrap.appendChild(input);
                    modalQuestions.appendChild(wrap);
                });
            })
            .catch(function() {});
    }

    if (modalCategory) modalCategory.addEventListener('change', function() { loadSubcategories(this.value); });
    if (modalSubcategory) modalSubcategory.addEventListener('change', function() { loadQuestions(this.value); });

    if (btnOpen) btnOpen.addEventListener('click', openModal);
    if (btnOpenEmpty) btnOpenEmpty.addEventListener('click', openModal);
    modal && modal.querySelectorAll('.cabinet-modal-close, .cabinet-modal-close-btn, .cabinet-modal-backdrop').forEach(function(el) {
        el.addEventListener('click', closeModal);
    });

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var fd = new FormData(form);
            var submitBtn = form.querySelector('button[type=submit]');
            if (submitBtn) submitBtn.disabled = true;
            fetch('/api/submit-request/', {
                method: 'POST',
                body: fd,
                headers: { 'X-CSRFToken': getCsrf() }
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.success) {
                    closeModal();
                    window.location.reload();
                } else {
                    alert(data.error || 'Ошибка отправки');
                }
            })
            .catch(function() { alert('Ошибка отправки'); })
            .finally(function() { if (submitBtn) submitBtn.disabled = false; });
        });
    }

    document.querySelectorAll('.cabinet-card-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var pk = this.getAttribute('data-pk');
            if (!pk || !confirm('Удалить эту заявку?')) return;
            var card = this.closest('.cabinet-card');
            fetch('/cabinet/requests/' + pk + '/delete/', {
                method: 'POST',
                headers: { 'X-CSRFToken': getCsrf(), 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'csrfmiddlewaretoken=' + encodeURIComponent(getCsrf())
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.success && card) card.remove();
                else if (data.error) alert(data.error);
            })
            .catch(function() { alert('Ошибка'); });
        });
    });
})();
