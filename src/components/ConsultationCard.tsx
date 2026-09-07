import React from 'react';
import { User, Calendar, Tag, CheckCircle, Clock, AlertCircle, ChevronRight, MessageSquare } from 'lucide-react';
import { Consultation, ConsultationCategory, ConsultationStatus } from '../types';

interface ConsultationCardProps {
  consultation: Consultation;
  onClick: () => void;
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({ consultation, onClick }) => {
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
            <span>검토중</span>
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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            <Tag className="w-3 h-3 mr-1 text-slate-400" />
            {getCategoryLabel(consultation.category)}
          </span>
          {getStatusBadge(consultation.status)}
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
          {consultation.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {consultation.content}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center font-medium text-slate-700">
            <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {consultation.author}
          </span>
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {consultation.consultation_date || new Date(consultation.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
          {consultation.answer ? (
            <span className="flex items-center text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
              <MessageSquare className="w-3 h-3 mr-1" /> 답변 있음
            </span>
          ) : null}
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
