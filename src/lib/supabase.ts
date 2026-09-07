import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Consultation } from '../types';

const LOCAL_STORAGE_KEY = 'supabase_consultation_local_data';
const CONFIG_STORAGE_KEY = 'supabase_config_settings';

// 기본 로컬 데이터 샘플
const DEFAULT_CONSULTATIONS: Consultation[] = [
  {
    id: '1',
    title: '로그인 후 메인 화면으로 이동되지 않는 문제가 있습니다.',
    content: '아이디와 비밀번호를 정확히 입력하고 로그인 버튼을 눌렀는데, 로딩 스피너만 계속 돌고 메인 화면으로 전환되지 않네요. 크롬 브라우저 최신 버전 사용 중입니다.',
    author: '김민수',
    category: 'technical',
    status: 'in_progress',
    answer: '안녕하세요 김민수 고객님. 브라우저 캐시 및 쿠키 삭제 후 다시 시도 부탁드립니다. 문제가 지속될 경우 콘솔 에러 캡처본을 남겨주시면 빠르게 확인해 드리겠습니다.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    title: '결제 영수증 재발급 문의드립니다.',
    content: '지난달에 결제했던 서비스 이용 요금 영수증을 회사 제출용으로 PDF 다운로드 받고 싶은데 어디서 받을 수 있나요?',
    author: '이지영',
    category: 'billing',
    status: 'completed',
    answer: '안녕하세요 이지영 고객님. [마이페이지] > [결제 내역] 메뉴에서 지난 결제 건별로 영수증 다운로드가 가능합니다. 추가 문의가 있으시면 언제든 말씀해 주세요.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '3',
    title: '상담 서비스 이용 방법 및 제휴 문의',
    content: '사내 고객 응대용으로 이 상담 서비스를 도입하고 싶은데, 커스텀 도메인 연결이나 API 연동 지원이 가능한지 궁금합니다.',
    author: '박준호',
    category: 'general',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

export function getSavedConfig(): { url: string; anonKey: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (envUrl && envKey && envUrl !== 'YOUR_SUPABASE_URL') {
    return { url: envUrl, anonKey: envKey };
  }

  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { url: parsed.url || '', anonKey: parsed.anonKey || '' };
    }
  } catch (e) {
    console.error(e);
  }

  return { url: '', anonKey: '' };
}

export function saveConfig(url: string, anonKey: string) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ url, anonKey }));
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedConfig();
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch (e) {
    console.error('Supabase client creation error:', e);
    return null;
  }
}

// 통합 데이터 관리 함수 (Supabase 우선 사용, 실패 또는 미설정 시 localStorage 폴백)
export async function fetchConsultations(): Promise<{ data: Consultation[]; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      const { data, error } = await client
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, falling back to local storage:', error.message);
        return { data: getLocalConsultations(), isSupabase: false, error: error.message };
      }
      return { data: data || [], isSupabase: true };
    } catch (err: any) {
      console.warn('Supabase connection exception:', err);
      return { data: getLocalConsultations(), isSupabase: false, error: err.message };
    }
  } else {
    return { data: getLocalConsultations(), isSupabase: false };
  }
}

function getLocalConsultations(): Consultation[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_CONSULTATIONS));
  return DEFAULT_CONSULTATIONS;
}

function saveLocalConsultations(items: Consultation[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export async function createConsultation(newItem: Omit<Consultation, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Consultation; error?: string }> {
  const client = getSupabaseClient();
  const id = 'cons_' + Math.random().toString(36).substring(2, 9);
  const created_at = new Date().toISOString();
  const item: Consultation = { ...newItem, id, created_at };

  if (client) {
    try {
      const { data, error } = await client
        .from('consultations')
        .insert([item])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert error, saving locally:', error.message);
        // Supabase 에러 시 로컬에라도 저장
        const items = getLocalConsultations();
        const updated = [item, ...items];
        saveLocalConsultations(updated);
        return { success: true, data: item, error: `Supabase 저장 실패로 로컬에 저장되었습니다: ${error.message}` };
      }
      return { success: true, data: data || item };
    } catch (err: any) {
      const items = getLocalConsultations();
      const updated = [item, ...items];
      saveLocalConsultations(updated);
      return { success: true, data: item, error: `Supabase 연결 오류로 로컬에 저장되었습니다: ${err.message}` };
    }
  } else {
    const items = getLocalConsultations();
    const updated = [item, ...items];
    saveLocalConsultations(updated);
    return { success: true, data: item };
  }
}

export async function updateConsultation(id: string, updates: Partial<Consultation>): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  const updated_at = new Date().toISOString();
  const payload = { ...updates, updated_at };

  if (client) {
    try {
      const { error } = await client
        .from('consultations')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.warn('Supabase update error, updating locally:', error.message);
        updateLocalItem(id, payload);
        return { success: true, error: `Supabase 수정 실패로 로컬만 수정되었습니다: ${error.message}` };
      }
      return { success: true };
    } catch (err: any) {
      updateLocalItem(id, payload);
      return { success: true, error: `Supabase 연결 오류로 로컬만 수정되었습니다: ${err.message}` };
    }
  } else {
    updateLocalItem(id, payload);
    return { success: true };
  }
}

function updateLocalItem(id: string, payload: Partial<Consultation>) {
  const items = getLocalConsultations();
  const updated = items.map(item => item.id === id ? { ...item, ...payload } : item);
  saveLocalConsultations(updated);
}

export async function deleteConsultation(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { error } = await client
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase delete error, deleting locally:', error.message);
        deleteLocalItem(id);
        return { success: true, error: `Supabase 삭제 실패로 로컬만 삭제되었습니다: ${error.message}` };
      }
      return { success: true };
    } catch (err: any) {
      deleteLocalItem(id);
      return { success: true, error: `Supabase 연결 오류로 로컬만 삭제되었습니다: ${err.message}` };
    }
  } else {
    deleteLocalItem(id);
    return { success: true };
  }
}

function deleteLocalItem(id: string) {
  const items = getLocalConsultations();
  const updated = items.filter(item => item.id !== id);
  saveLocalConsultations(updated);
}
