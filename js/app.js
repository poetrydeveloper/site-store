// Временный код, чтобы увидеть, что всё работает
import { renderHeader } from './components/header.js';
import { renderCatalog } from './components/catalog.js';

// Тестовые данные
const testProducts = [
    { id: 1, name: 'Фиксаторы', code: 'FIX-001', price: 300 },
    { id: 2, name: 'Lego Castle', code: 'LEGO-001', price: 5000 },
    { id: 3, name: 'Силиконовая форма', code: 'SIL-002', price: 450 }
];

function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        ${renderHeader()}
        <main>
            <h1>Добро пожаловать в CRM</h1>
            ${renderCatalog(testProducts)}
        </main>
    `;
}

renderApp();