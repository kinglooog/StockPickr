/** API client for StockPickr backend. */

const BASE = '/api/v1';

export interface TopicBrief {
  id: string;
  name: string;
  code: string;
  heat_rank: number;
  up_down_pct: number | null;
  leading_stock: string | null;
  news_summary: string | null;
  update_date: string;
}

export interface StockOut {
  id: string;
  code: string;
  name: string;
  chain_level: string;
  logic: string | null;
  market_cap: number | null;
  pe_ratio: number | null;
}

export interface TopicDetail {
  id: string;
  name: string;
  code: string;
  concept_explanation: string | null;
  heat_rank: number;
  up_down_pct: number | null;
  leading_stock: string | null;
  news_summary: string | null;
  upstream_desc: string | null;
  midstream_desc: string | null;
  downstream_desc: string | null;
  update_date: string;
  created_at: string;
  upstream_stocks: StockOut[];
  midstream_stocks: StockOut[];
  downstream_stocks: StockOut[];
}

export interface TopicListResponse {
  topics: TopicBrief[];
  total: number;
  page: number;
  page_size: number;
}

export interface UpdateLog {
  id: string;
  update_date: string;
  status: string;
  topics_count: number;
  error_msg: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface RefreshResponse {
  status: string;
  message: string;
  log_id: string;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  topics: {
    list: (page = 1, pageSize = 20, date?: string) => {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
      if (date) params.set('date', date);
      return get<TopicListResponse>(`${BASE}/topics?${params}`);
    },
    hot: (limit = 10) => get<TopicBrief[]>(`${BASE}/topics/hot?limit=${limit}`),
    detail: (id: string) => get<TopicDetail>(`${BASE}/topics/${id}`),
  },
  stocks: {
    info: (code: string) => get<Record<string, unknown>>(`${BASE}/stocks/${code}`),
  },
  system: {
    refresh: () => post<RefreshResponse>(`${BASE}/refresh`),
    updateLogs: (limit = 10) => get<UpdateLog[]>(`${BASE}/update-log?limit=${limit}`),
  },
  dates: {
    list: () => get<{ dates: string[] }>(`${BASE}/dates`),
  },
};
