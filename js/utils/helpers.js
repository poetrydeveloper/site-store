// js/utils/helpers.js
export function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(price);
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleString('ru-RU');
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === '') {
        return `${fieldName} обязательно для заполнения`;
    }
    return null;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}