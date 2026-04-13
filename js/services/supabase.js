// Конфигурация Supabase
const SUPABASE_URL = 'https://katbfftwcnnyefjthevq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LFdIXDm_u_mFjlzxTMDOTQ_PaHwExaQ';

// Создаём клиент с отключением realtime (убирает ошибку payload)
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { enabled: false }
});

// ==================== ТОВАРЫ ====================
export async function getProducts() {
    const { data, error } = await window.supabaseClient
        .from('products')
        .select('*');
    
    if (error) {
        console.error('Ошибка загрузки товаров:', error);
        return [];
    }
    return data;
}

export async function getProductsWithRelations() {
    const { data, error } = await window.supabaseClient
        .from('products')
        .select(`
            *,
            brands:brandId (id, name, logo),
            categories:categoryId (id, name, slug)
        `);
    
    if (error) {
        console.error('Ошибка загрузки товаров с связями:', error);
        return [];
    }
    return data;
}

export async function getProductById(id) {
    const { data, error } = await window.supabaseClient
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Ошибка загрузки товара:', error);
        return null;
    }
    return data;
}

export async function createProduct(product) {
    const { data, error } = await window.supabaseClient
        .from('products')
        .insert([product])
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function updateProduct(id, updates) {
    const { data, error } = await window.supabaseClient
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function deleteProduct(id) {
    const { error } = await window.supabaseClient
        .from('products')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
}

// ==================== БРЕНДЫ ====================
export async function getBrands() {
    const { data, error } = await window.supabaseClient
        .from('brands')
        .select('*')
        .order('name');
    
    if (error) {
        console.error('Ошибка загрузки брендов:', error);
        return [];
    }
    return data;
}

export async function getBrandById(id) {
    const { data, error } = await window.supabaseClient
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Ошибка загрузки бренда:', error);
        return null;
    }
    return data;
}

export async function createBrand(brand) {
    const { data, error } = await window.supabaseClient
        .from('brands')
        .insert([brand])
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function updateBrand(id, updates) {
    const { data, error } = await window.supabaseClient
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function deleteBrand(id) {
    const { error } = await window.supabaseClient
        .from('brands')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
}

// ==================== КАТЕГОРИИ ====================
export async function getCategories() {
    const { data, error } = await window.supabaseClient
        .from('categories')
        .select('*')
        .order('level', { ascending: true })
        .order('name');
    
    if (error) {
        console.error('Ошибка загрузки категорий:', error);
        return [];
    }
    
    // Преобразуем плоский список в дерево
    return buildCategoryTree(data);
}

export async function getCategoriesFlat() {
    const { data, error } = await window.supabaseClient
        .from('categories')
        .select('*')
        .order('level', { ascending: true })
        .order('name');
    
    if (error) {
        console.error('Ошибка загрузки категорий:', error);
        return [];
    }
    return data;
}

function buildCategoryTree(categories, parentId = null) {
    const result = [];
    for (const cat of categories) {
        if (cat.parentId === parentId || (parentId === null && !cat.parentId)) {
            const children = buildCategoryTree(categories, cat.id);
            result.push({
                ...cat,
                children: children
            });
        }
    }
    return result;
}

export async function getCategoryById(id) {
    const { data, error } = await window.supabaseClient
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Ошибка загрузки категории:', error);
        return null;
    }
    return data;
}

export async function createCategory(category) {
    const { data, error } = await window.supabaseClient
        .from('categories')
        .insert([category])
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function updateCategory(id, updates) {
    const { data, error } = await window.supabaseClient
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select();
    
    if (error) throw error;
    return data[0];
}

export async function deleteCategory(id) {
    const { error } = await window.supabaseClient
        .from('categories')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
}