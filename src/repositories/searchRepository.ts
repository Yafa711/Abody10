import { supabase } from '../services/supabase';

export const searchRepository = {
  async saveQuery(userId: string | null, query: string): Promise<void> {
    const { error } = await supabase
      .from('search_queries')
      .insert({ user_id: userId, query: query.toLowerCase().trim() });
    if (error) console.error('Failed to save search query:', error);
  },

  async incrementCount(query: string): Promise<void> {
    await supabase.rpc('increment_search_count', { search_query: query.toLowerCase().trim() });
  },

  async getTopSearches(limit = 10): Promise<{ query: string; count: number }[]> {
    const { data, error } = await supabase
      .from('search_queries')
      .select('query, count')
      .order('count', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as { query: string; count: number }[]) || [];
  },
};
