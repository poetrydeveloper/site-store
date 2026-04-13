import { getBrands, createProduct, updateProduct } from '../services/supabase.js';
import { Product } from '../models/Product.js';

export async function renderProductForm(product = null) {
    const brands = await getBrands();
    const isEdit = product !== null;
    const formData = product || new Product();
    
    return `
        <div class="form-container">
            <h2>${isEdit ? '✏️ Редактировать товар' : '➕ Новый товар'}</h2>
            <form id="product-form">
                <div class="form-group">
                    <label>Название *</label>
                    <input type="text" name="name" value="${escapeHtml(formData.name)}" required autofocus>
                </div>
                
                <div class="form-group">
                    <label>Артикул *</label>
                    <input type="text" name="code" value="${escapeHtml(formData.code)}" required>
                    <small>Уникальный код товара (например: FIX-001)</small>
                </div>
                
                <div class="form-group">
                    <label>Категория</label>
                    <select name="categoryId" id="category-select">
                        <option value="">— Без категории —</option>
                        <!-- Категории будут загружены отдельно -->
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Бренд</label>
                    <select name="brandId">
                        <option value="">— Без бренда —</option>
                        ${brands.map(b => `
                            <option value="${b.id}" ${formData.brandId == b.id ? 'selected' : ''}>
                                ${escapeHtml(b.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Главное изображение (URL)</label>
                    <input type="text" name="mainImage" placeholder="https://... или путь к файлу" value="${escapeHtml(formData.mainImage || '')}">
                    <small>Пока поддерживаются только URL. В будущем — загрузка из репозитория</small>
                </div>
                
                <div class="form-group">
                    <label>Описание</label>
                    <textarea name="description" rows="5" placeholder="Полное описание товара...">${escapeHtml(formData.description || '')}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">💾 Сохранить товар</button>
                    <button type="button" id="cancel-form" class="btn-secondary">Отмена</button>
                </div>
            </form>
        </div>
    `;
}

// Загрузка категорий для выпадающего списка
export async function loadCategoriesToSelect(selectedId = null) {
    const { getCategories } = await import('../services/supabase.js');
    const categories = await getCategories();
    const select = document.getElementById('category-select');
    if (!select) return;
    
    // Сохраняем выбранное значение, если есть
    const currentValue = select.value;
    
    // Очищаем и заполняем заново
    select.innerHTML = '<option value="">— Без категории —</option>';
    
    // Рекурсивная функция для вывода категорий с отступами
    function renderCategories(cats, level = 0) {
        for (const cat of cats) {
            const option = document.createElement('option');
            option.value = cat.id;
            const prefix = '—'.repeat(level) + (level > 0 ? ' ' : '');
            option.textContent = prefix + cat.name;
            if (selectedId == cat.id) option.selected = true;
            select.appendChild(option);
            
            if (cat.children && cat.children.length > 0) {
                renderCategories(cat.children, level + 1);
            }
        }
    }
    
    renderCategories(categories);
    
    // Если было сохранённое значение, восстанавливаем
    if (currentValue && !selectedId) {
        select.value = currentValue;
    }
}

export function attachProductFormEvents(onSave, onCancel) {
    const form = document.getElementById('product-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const product = new Product({
            id: window.currentProductId || null,
            name: formData.get('name').trim(),
            code: formData.get('code').trim(),
            categoryId: formData.get('categoryId') || null,
            brandId: formData.get('brandId') || null,
            mainImage: formData.get('mainImage') || '',
            description: formData.get('description') || ''
        });
        
        // Валидация
        const errors = product.validate();
        if (errors.length > 0) {
            alert('❌ Ошибки заполнения:\n• ' + errors.join('\n• '));
            return;
        }
        
        try {
            let saved;
            if (product.isNew()) {
                saved = await createProduct(product);
                alert('✅ Товар успешно создан!');
            } else {
                saved = await updateProduct(product.id, product);
                alert('✅ Товар успешно обновлён!');
            }
            if (onSave) onSave(saved);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('❌ Ошибка сохранения: ' + (error.message || 'Неизвестная ошибка'));
        }
    });
    
    const cancelBtn = document.getElementById('cancel-form');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
        });
    }
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}