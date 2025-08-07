// Configuración de base de datos híbrida - Neon + Supabase
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Configuración actual de Neon (mantenemos como fallback)
const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configuración de Supabase (nueva)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Función para decidir qué base de datos usar
const getDatabase = () => {
  if (supabase && process.env.USE_SUPABASE === 'true') {
    console.log('🚀 Usando Supabase como base de datos');
    return 'supabase';
  } else {
    console.log('🐘 Usando Neon PostgreSQL como base de datos');
    return 'neon';
  }
};

// Adaptador universal que funciona con ambas bases de datos
class DatabaseAdapter {
  constructor() {
    this.dbType = getDatabase();
  }

  async query(sql, params = []) {
    try {
      if (this.dbType === 'supabase') {
        return await this.supabaseQuery(sql, params);
      } else {
        return await this.neonQuery(sql, params);
      }
    } catch (error) {
      console.error(`${this.dbType} query error:`, error);
      throw error;
    }
  }

  async neonQuery(sql, params) {
    const result = await neonPool.query(sql, params);
    return result;
  }

  async supabaseQuery(sql, params) {
    // Para Supabase, convertimos queries SQL a métodos específicos
    if (sql.includes('SELECT * FROM "User"')) {
      const { data, error } = await supabase
        .from('User')
        .select('*');
      
      if (error) throw error;
      return { rows: data || [], rowCount: data?.length || 0 };
    }
    
    if (sql.includes('SELECT * FROM "Package"')) {
      const { data, error } = await supabase
        .from('Package')
        .select('*');
      
      if (error) throw error;
      return { rows: data || [], rowCount: data?.length || 0 };
    }

    if (sql.includes('SELECT * FROM "Session"')) {
      const { data, error } = await supabase
        .from('Session')
        .select('*');
      
      if (error) throw error;
      return { rows: data || [], rowCount: data?.length || 0 };
    }

    if (sql.includes('SELECT * FROM "CalendarEvent"')) {
      const { data, error } = await supabase
        .from('CalendarEvent')
        .select('*');
      
      if (error) throw error;
      return { rows: data || [], rowCount: data?.length || 0 };
    }

    // Para queries más complejas, usar RPC
    const { data, error } = await supabase.rpc('execute_sql', {
      query: sql,
      params: params
    });

    if (error) throw error;
    return { rows: data || [], rowCount: data?.length || 0 };
  }

  async testConnection() {
    try {
      if (this.dbType === 'supabase') {
        const { data, error } = await supabase
          .from('Package')
          .select('count', { count: 'exact' });
        
        if (error) throw error;
        console.log('✅ Supabase connection successful');
        return true;
      } else {
        await neonPool.query('SELECT 1');
        console.log('✅ Neon connection successful');
        return true;
      }
    } catch (error) {
      console.error(`❌ ${this.dbType} connection failed:`, error);
      return false;
    }
  }
}

// Crear instancia única
const db = new DatabaseAdapter();

module.exports = { db, neonPool, supabase };
