// Конфигурация Supabase (замените на свои данные)
const SUPABASE_URL = 'https://katbfftwcnnyefjthevq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hhAdy8LqqKGBXRjgrbABfQ_ExpJckHw';

// Создаём клиент
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Функции для работы с товарами
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