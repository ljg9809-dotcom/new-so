import React, { useState } from 'react';
import { X, MessageSquarePlus, Tag, User, FileText, Sparkles, Calendar } from 'lucide-react';
import { ConsultationCategory, ConsultationStatus } from '../types';

interface ConsultationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; author: string; category: ConsultationCategory; status: ConsultationStatus; consultation_date: string }) => Promise<void>;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<ConsultationCategory>('general');
  const [consultationDate, setConsultationDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert('모든 필드를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        category,
        status: 'pending',
        consultation_date: consultationDate,
      });
      setTitle('');
      setContent('');
      setAuthor('');
      setCategory('general');
      setConsultationDate(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">새 상담 신청하기</h3>
              <p className="text-xs text-slate-500">궁금하신 내용이나 문의사항을 작성해 주세요.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 작성자 & 상담 일자 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-500" /> 작성자명
              </label>
              <input
                type="text"
                required
                placeholder="예: 홍길동"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> 상담 일자
              </label>
              <input
                type="date"
                required
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white"
              />
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-slate-500" /> 상담 분류
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ConsultationCategory)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white"
            >
              <option value="general">일반 문의</option>
              <option value="technical">기술/시스템 문의</option>
              <option value="account">계정/로그인</option>
              <option value="billing">결제/요금</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" /> 상담 제목
            </label>
            <input
              type="text"
              required
              placeholder="상담 제목을 입력하세요 (예: 로그인 오류 해결 방법 문의)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              상담 내용
            </label>
            <textarea
              required
              rows={5}
              placeholder="궁금하신 내용이나 증상을 자세히 적어주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>저장 중...</>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>상담 등록하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
