import { createBrand, updateBrand } from '../services/supabase.js';
import { Brand } from '../models/Brand.js';

export function renderBrandForm(brand = null) {
    const isEdit = brand !== null;
    const formData = brand || new Brand();
    
    return `
        <div class="form-container">
            <h2>${isEdit ? '✏️ Редактировать бренд' : '➕ Новый бренд'}</h2>
            <form id="brand-form">
                <div class="form-group">
                    <label>Название *</label>
                    <input type="text" name="name" value="${escapeHtml(formData.name)}" required autofocus>
                </div>
                
                <div class="form-group">
                    <label>Логотип (URL)</label>
                    <input type="text" name="logo" value="${escapeHtml(formData.logo || '')}" placeholder="https://...">
                </div>
                
                <div class="form-group">
                    <label>Описание</label>
                    <textarea name="description" rows="3" placeholder="Описание бренда...">${escapeHtml(formData.description || '')}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">💾 Сохранить бренд</button>
                    <button type="button" id="cancel-brand-form" class="btn-secondary">Отмена</button>
                </div>
            </form>
        </div>
    `;
}

export function attachBrandFormEvents(onSave, onCancel) {
    const form = document.getElementById('brand-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const brand = new Brand({
            id: window.currentBrandId || null,
            name: formData.get('name').trim(),
            logo: formData.get('logo') || '',
            description: formData.get('description') || ''
        });
        
        const errors = brand.validate();
        if (errors.length > 0) {
            alert('❌ Ошибки:\n• ' + errors.join('\n• '));
            return;
        }
        
        try {
            let saved;
            if (brand.isNew()) {
                saved = await createBrand(brand);
                alert('✅ Бренд создан!');
            } else {
                saved = await updateBrand(brand.id, brand);
                alert('✅ Бренд обновлён!');
            }
            if (onSave) onSave(saved);
        } catch (error) {
            console.error('Ошибка сохранения бренда:', error);
            alert('❌ Ошибка: ' + error.message);
        }
    });
    
    const cancelBtn = document.getElementById('cancel-brand-form');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', onCancel);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}