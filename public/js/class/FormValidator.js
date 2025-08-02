

class FormValidator {
    static validar(elementId) {
        const form = document.getElementById(elementId);
        const fields = form.querySelectorAll('[name][required]');
        const validationErrors = [];

        for (const field of fields) {
            field.classList.remove('campo-invalido');
        }
        for (const field of fields) {
            if (!field.value) {
                field.classList.add('campo-invalido');
                const labelText = field.placeholder || field.previousElementSibling.textContent.trim();
                validationErrors.push(`Campo "${labelText}" é obrigatório e não foi preenchido.<br>`);
            }
        }

        if (validationErrors.length === 0) {
            return Promise.resolve(true);
        } else {
            const errorMessage = validationErrors.join('\n');
            SweetAlert.alertAutoClose("error", "Atenção", errorMessage);
            return Promise.resolve(false);
        }
    }
}


