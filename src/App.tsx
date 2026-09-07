import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchConsultations, 
  createConsultation, 
  updateConsultation, 
  deleteConsultation, 
  getSavedConfig 
} from './lib/supabase';
import { Consultation, ConsultationStatus, ConsultationCategory } from './types';
import { Navbar } from './components/Navbar';
import { ConsultationCard } from './components/ConsultationCard';
import { ConsultationForm } from './components/ConsultationForm';
import { ConsultationDetailModal } from './components/ConsultationDetailModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { Search, Database, RefreshCw, AlertTriangle, Plus, Sparkles, Filter, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export default function App() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // 필터 및 검색 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 모달 상태
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const result = await fetchConsultations();
    setConsultations(result.data);
    setIsSupabaseConnected(result.isSupabase);
    setErrorMessage(result.error);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 통계 계산
  const stats = useMemo(() => {
    const total = consultations.length;
    const pending = consultations.filter(c => c.status === 'pending').length;
    const inProgress = consultations.filter(c => c.status === 'in_progress').length;
    const completed = consultations.filter(c => c.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [consultations]);

  // 필터링된 상담 목록
  const filteredConsultations = useMemo(() => {
    return consultations.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [consultations, searchQuery, statusFilter, categoryFilter]);

  const handleCreate = async (newItem: Omit<Consultation, 'id' | 'created_at'>) => {
    const res = await createConsultation(newItem);
    if (res.error) {
      alert(res.error);
    }
    await loadData();
  };

  const handleUpdate = async (id: string, updates: Partial<Consultation>) => {
    const res = await updateConsultation(id, updates);
    if (res.error) {
      alert(res.error);
    }
    await loadData();
    // 상세 모달 열려있으면 업데이트된 아이템으로 갱신
    if (selectedConsultation && selectedConsultation.id === id) {
      const updatedList = (await fetchConsultations()).data;
      const found = updatedList.find(c => c.id === id);
      if (found) setSelectedConsultation(found);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteConsultation(id);
    if (res.error) {
      alert(res.error);
    }
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 상단 네비게이션 */}
      <Navbar
        isSupabaseConnected={isSupabaseConnected}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenCreate={() => setIsCreateOpen(true)}
        totalCount={stats.total}
        pendingCount={stats.pending}
      />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 비개발자 안내 및 Supabase 상태 배너 */}
        {!isSupabaseConnected && (
          <div className="bg-gradient-to-r from-amber-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Supabase 데이터베이스 연동 안내
              </span>
              <h2 className="text-lg font-bold">클라우드 데이터베이스를 연결해 보세요!</h2>
              <p className="text-xs text-white/90 max-w-xl">
                현재 브라우저 로컬 저장소로 작동 중입니다. Supabase를 연결하시면 여러 기기에서 실시간으로 상담 데이터를 동기화하고 영구 보관할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => setIsSetupOpen(true)}
              className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition shadow-md whitespace-nowrap"
            >
              Supabase 연결 설정하기
            </button>
          </div>
        )}

        {/* 통계 요약 카드 섹션 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">전체 상담</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600">답변 대기</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600">검토/처리중</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{stats.inProgress}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600">답변 완료</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.completed}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 검색 및 필터 컨트롤 바 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="제목, 내용, 작성자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* 상태 필터 */}
            <div className="flex items-center space-x-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">모든 상태</option>
                <option value="pending">답변 대기</option>
                <option value="in_progress">검토/처리중</option>
                <option value="completed">답변 완료</option>
              </select>
            </div>

            {/* 카테고리 필터 */}
            <div className="flex items-center space-x-1.5 text-xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">모든 카테고리</option>
                <option value="general">일반 문의</option>
                <option value="technical">기술/시스템</option>
                <option value="account">계정/로그인</option>
                <option value="billing">결제/요금</option>
                <option value="other">기타</option>
              </select>
            </div>

            <button
              onClick={loadData}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 상담 목록 그리드 */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <p>상담 데이터를 불러오는 중입니다...</p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">등록된 상담이 없습니다</h3>
              <p className="text-xs text-slate-500 mt-1">새로운 상담 제목과 내용을 작성하여 문의를 시작해 보세요.</p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              <span>새 상담 작성하기</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredConsultations.map(item => (
              <ConsultationCard
                key={item.id}
                consultation={item}
                onClick={() => setSelectedConsultation(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <p>Supabase 상담 서비스 &copy; {new Date().getFullYear()} — Powered by Supabase & Google AI Studio</p>
      </footer>

      {/* 모달들 */}
      <SupabaseSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSave={loadData}
        isSupabaseConnected={isSupabaseConnected}
      />

      <ConsultationForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ConsultationDetailModal
        consultation={selectedConsultation}
        isOpen={!!selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
