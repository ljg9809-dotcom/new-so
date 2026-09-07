import React from 'react';
import { Database, Plus, ShieldCheck, AlertCircle, Settings, HelpCircle } from 'lucide-react';

interface NavbarProps {
  isSupabaseConnected: boolean;
  onOpenSetup: () => void;
  onOpenCreate: () => void;
  totalCount: number;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSupabaseConnected,
  onOpenSetup,
  onOpenCreate,
  totalCount,
  pendingCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 로고 및 서비스명 */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Supabase 상담 센터
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Supabase 연동
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">제목과 내용을 작성하고 실시간으로 관리하는 상담 서비스</p>
          </div>
        </div>

        {/* 상태 및 액션 버튼 */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* 통계 뱃지 */}
          <div className="hidden md:flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span>전체 상담 <strong className="text-slate-900 font-semibold">{totalCount}</strong>건</span>
            <span className="text-slate-300">|</span>
            <span>답변 대기 <strong className="text-amber-600 font-semibold">{pendingCount}</strong>건</span>
          </div>

          {/* Supabase 연결 상태 배지 */}
          <button
            onClick={onOpenSetup}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Supabase 연결 설정"
          >
            {isSupabaseConnected ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Supabase 연결됨</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">로컬 모드 (설정 필요)</span>
              </>
            )}
            <Settings className="w-3.5 h-3.5 ml-1 opacity-70" />
          </button>

          {/* 상담 작성 버튼 */}
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>새 상담 작성</span>
          </button>
        </div>
      </div>
    </header>
  );
};
