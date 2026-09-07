import React, { useState } from 'react';
import { X, Database, CheckCircle, ExternalLink, Copy, Check, AlertTriangle, Key, Globe } from 'lucide-react';
import { getSavedConfig, saveConfig } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSupabaseConnected: boolean;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSupabaseConnected,
}) => {
  const [config, setConfig] = useState(getSavedConfig());
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const sqlQuery = `create table if not exists consultations (
  id text primary key,
  title text not null,
  content text not null,
  author text not null,
  category text not null,
  status text not null,
  answer text,
  consultation_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- 만약 기존에 테이블이 있는 상태라면 상담일자 컬럼 추가 (date 타입)
alter table consultations add column if not exists consultation_date date;

-- Row Level Security (RLS) 설정
alter table consultations enable row level security;

-- 기존 정책이 있다면 삭제 후 재생성 (중복 에러 방지)
drop policy if exists "Allow public access to consultations" on consultations;

create policy "Allow public access to consultations"
  on consultations for all
  using (true)
  with check (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(config.url, config.anonKey);
    
    // 테스트 연결
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(config.url, config.anonKey);
      const { error } = await client.from('consultations').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116') {
        // 테이블이 아직 안 만들어졌을 수도 있음
        setTestStatus('success');
        setErrorMessage('연결은 성공했으나 "consultations" 테이블이 존재하지 않을 수 있습니다. 아래 SQL을 실행해 주세요.');
      } else {
        setTestStatus('success');
        setErrorMessage('');
      }
      onSave();
    } catch (err: any) {
      setTestStatus('error');
      setErrorMessage(err.message || 'Supabase 연결에 실패했습니다. URL과 Key를 확인해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Supabase 데이터베이스 연동 가이드</h3>
              <p className="text-xs text-slate-500">비개발자도 쉽게 Supabase를 연결하고 데이터를 관리할 수 있습니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 현재 연결 상태 배지 */}
          <div className={`p-4 rounded-xl flex items-center justify-between border ${
            isSupabaseConnected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center space-x-3">
              {isSupabaseConnected ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {isSupabaseConnected ? 'Supabase가 정상적으로 연결되어 있습니다.' : '현재 로컬 임시 저장소(LocalStorage) 모드로 동작 중입니다.'}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {isSupabaseConnected 
                    ? '클라우드 DB에 안전하게 상담 데이터가 저장되고 있습니다.' 
                    : '아래 정보를 입력하여 Supabase와 연동하시면 영구적인 클라우드 저장이 가능합니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* 단계별 가이드 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-xs mr-2">1</span>
              Supabase 프로젝트 만들기 & 키 가져오기
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 space-y-2 border border-slate-200">
              <p>1. <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium inline-flex items-center">Supabase 공식 홈페이지 <ExternalLink className="w-3 h-3 ml-0.5" /></a>에서 무료 프로젝트를 생성합니다.</p>
              <p>2. 프로젝트 대시보드 좌측 하단의 <strong>Project Settings</strong> (톱니바퀴 아이콘) &gt; <strong>API</strong> 메뉴로 이동합니다.</p>
              <p>3. <strong>Project URL</strong>과 <strong>anon public API Key</strong> 값을 복사하여 아래 입력창에 붙여넣으세요.</p>
            </div>
          </div>

          {/* 설정 입력 폼 */}
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-xs mr-2">2</span>
              Supabase 프로젝트 정보 입력
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1 text-slate-500" /> Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xxxxxx.supabase.co"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center">
                <Key className="w-3.5 h-3.5 mr-1 text-slate-500" /> Supabase Anon Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhGciOiJIUzI1NiIsIn..."
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            {testStatus === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage || '설정이 저장되었습니다!'}</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                닫기
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
              >
                설정 저장 및 연결 테스트
              </button>
            </div>
          </form>

          {/* SQL 테이블 생성 가이드 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 text-sm flex items-center">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-xs mr-2">3</span>
                상담 테이블(consultations) 생성 SQL (SQL Editor에 실행)
              </h4>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료!' : 'SQL 복사하기'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Supabase 대시보드 메뉴 중 <strong>SQL Editor</strong>로 이동하여 <strong>New Query</strong>를 누르고 아래 코드를 붙여넣은 뒤 <strong>Run</strong>을 누르세요.
            </p>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
              <pre>{sqlQuery}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
