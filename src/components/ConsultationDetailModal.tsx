import React, { useState } from 'react';
import { X, User, Calendar, Tag, CheckCircle, Clock, AlertCircle, Send, Trash2, Edit3, Save } from 'lucide-react';
import { Consultation, ConsultationCategory, ConsultationStatus } from '../types';

interface ConsultationDetailModalProps {
  consultation: Consultation | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Consultation>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  consultation,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!isOpen || !consultation) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(consultation.title);
  const [editContent, setEditContent] = useState(consultation.content);
  const [editCategory, setEditCategory] = useState<ConsultationCategory>(consultation.category);
  
  const [answerInput, setAnswerInput] = useState(consultation.answer || '');
  const [status, setStatus] = useState<ConsultationStatus>(consultation.status);
  const [isSaving, setIsSaving] = useState(false);

  const getCategoryLabel = (cat: ConsultationCategory) => {
    switch (cat) {
      case 'general': return '일반 문의';
      case 'technical': return '기술/시스템';
      case 'account': return '계정/로그인';
      case 'billing': return '결제/요금';
      case 'other': return '기타';
      default: return cat;
    }
  };

  const getStatusBadge = (st: ConsultationStatus) => {
    switch (st) {
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>답변 대기</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <AlertCircle className="w-3 h-3" />
            <span>검토/처리중</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>답변 완료</span>
          </span>
        );
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    setIsSaving(true);
    await onUpdate(consultation.id, {
      title: editTitle,
      content: editContent,
      category: editCategory,
    });
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleSaveAnswer = async () => {
    setIsSaving(true);
    await onUpdate(consultation.id, {
      answer: answerInput,
      status: answerInput.trim() ? 'completed' : status,
    });
    setIsSaving(false);
    alert('답변이 등록되었습니다.');
  };

  const handleDelete = async () => {
    if (window.confirm('정말 이 상담을 삭제하시겠습니까?')) {
      await onDelete(consultation.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center space-x-2">
            {getStatusBadge(status)}
            <span className="text-xs text-slate-400 font-mono">ID: {consultation.id}</span>
          </div>
          <div className="flex items-center space-x-1">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
                title="상담 수정"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-xl transition"
              title="상담 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 메타 정보 */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">{consultation.author}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Tag className="w-4 h-4 text-slate-400" />
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                {getCategoryLabel(consultation.category)}
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>상담일: {consultation.consultation_date || new Date(consultation.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* 제목 & 내용 (수정 모드 또는 일반 모드) */}
          {isEditing ? (
            <div className="space-y-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-slate-800 text-sm">상담 내용 수정하기</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">카테고리</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as ConsultationCategory)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  <option value="general">일반 문의</option>
                  <option value="technical">기술/시스템 문의</option>
                  <option value="account">계정/로그인</option>
                  <option value="billing">결제/요금</option>
                  <option value="other">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">제목</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">내용</label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>저장</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">{consultation.title}</h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                {consultation.content}
              </div>
            </div>
          )}

          {/* 답변 섹션 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                상담 답변 및 피드백
              </h4>
              <div className="flex items-center space-x-2">
                <label className="text-xs text-slate-500">처리 상태:</label>
                <select
                  value={status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as ConsultationStatus;
                    setStatus(newStatus);
                    await onUpdate(consultation.id, { status: newStatus });
                  }}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white font-medium"
                >
                  <option value="pending">답변 대기</option>
                  <option value="in_progress">검토/처리중</option>
                  <option value="completed">답변 완료</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                rows={4}
                placeholder="상담원에 대한 답변이나 해결 가이드를 입력하세요..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveAnswer}
                  disabled={isSaving}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>답변 저장하기</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
