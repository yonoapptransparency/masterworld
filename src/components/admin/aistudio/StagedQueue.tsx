import React, { useState } from 'react';
import { 
  Star, 
  Trash2, 
  Edit3, 
  Check, 
  Upload, 
  Clock, 
  X, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { StagedReview } from './types';

interface StagedQueueProps {
  stagedReviews: StagedReview[];
  onDeleteReview: (id: string) => void;
  onClearAll: () => void;
  onUpdateReview: (id: string, updates: Partial<StagedReview>) => void;
  onPublishAllToFirestore: () => Promise<void>;
  isPublishing: boolean;
}

export const StagedQueue: React.FC<StagedQueueProps> = ({
  stagedReviews,
  onDeleteReview,
  onClearAll,
  onUpdateReview,
  onPublishAllToFirestore,
  isPublishing
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editUserName, setEditUserName] = useState('');

  const startEdit = (review: StagedReview) => {
    setEditingId(review.id);
    setEditText(review.reviewText);
    setEditRating(review.rating);
    setEditUserName(review.userName);
  };

  const saveEdit = (id: string) => {
    onUpdateReview(id, {
      reviewText: editText.trim(),
      rating: editRating,
      userName: editUserName.trim()
    });
    setEditingId(null);
  };

  if (stagedReviews.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
        <div className="p-3 rounded-full bg-slate-800 text-slate-500">
          <Layers className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">Staging Deck is Empty</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Select catalog apps and use <strong>Brain 1 (Chat)</strong> or <strong>Brain 2 (AutoBot)</strong> to generate reviews. They will appear here for review before publishing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-full space-y-3">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">Staged Reviews Deck</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
            {stagedReviews.length} Ready to Publish
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onClearAll}
            disabled={isPublishing}
            className="text-xs px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 transition flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Deck</span>
          </button>

          <button
            onClick={onPublishAllToFirestore}
            disabled={isPublishing}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : `Publish All (${stagedReviews.length})`}</span>
          </button>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
        {stagedReviews.map(r => {
          const isEditing = editingId === r.id;

          return (
            <div
              key={r.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs space-y-2 hover:border-slate-700/80 transition"
            >
              {/* Header: App Name, User, Date, Rating */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  {r.appIcon ? (
                    <img src={r.appIcon} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[9px] text-slate-400">
                      {(r.appName || 'A')[0]}
                    </div>
                  )}
                  <span className="font-semibold text-slate-200 truncate">{r.appName}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 truncate">{r.userName}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {r.dateTag}
                  </span>

                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-slate-700'}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => (isEditing ? saveEdit(r.id) : startEdit(r))}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
                  >
                    {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit3 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onDeleteReview(r.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Body: Edit mode or display mode */}
              {isEditing ? (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editUserName}
                      onChange={e => setEditUserName(e.target.value)}
                      placeholder="Reviewer Name"
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                    <select
                      value={editRating}
                      onChange={e => setEditRating(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                    </select>
                  </div>
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(r.id)}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-300 text-xs leading-relaxed pl-7">{r.reviewText}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
