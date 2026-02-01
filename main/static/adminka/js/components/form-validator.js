// form-validator.js - Общая функция для валидации форм
export function validateForm(formElement) {
    let isValid = true;
    const inputs = formElement.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        const errorElement = input.nextElementSibling; // Предполагаем, что элемент для ошибки идет сразу после инпута

        // Сброс предыдущих ошибок
        input.classList.remove('is-invalid');
        if (errorElement && errorElement.classList.contains('form-error')) {
            errorElement.textContent = '';
        }

        // Проверка на обязательные поля
        if (input.hasAttribute('required') && input.value.trim() === '') {
            input.classList.add('is-invalid');
            if (errorElement) {
                errorElement.textContent = 'Это поле обязательно для заполнения.';
            }
            isValid = false;
        }

        // Проверка email
        if (input.type === 'email' && input.value.trim() !== '' && !/\S+@\S+\.\S+/.test(input.value)) {
            input.classList.add('is-invalid');
            if (errorElement) {
                errorElement.textContent = 'Введите корректный email.';
            }
            isValid = false;
        }

        // Проверка пароля (пример: минимум 6 символов)
        if (input.type === 'password' && input.value.trim() !== '' && input.value.length < 6) {
            input.classList.add('is-invalid');
            if (errorElement) {
                errorElement.textContent = 'Пароль должен быть не менее 6 символов.';
            }
            isValid = false;
        }

        // Дополнительные проверки можно добавить здесь (например, min/max length, regex)
    });

    return isValid;
}