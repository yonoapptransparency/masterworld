import React, { useState, useEffect } from 'react';
import { toast } from '../Toast';
import { ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';

const AdminCommunityTab: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/community/reviews/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
      toast('Failed to fetch pending reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActioning(id);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/community/reviews/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviewId: id })
      });
      
      if (res.ok) {
        toast('Review published successfully!', 'success');
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        toast('Failed to publish review', 'error');
      }
    } catch (err) {
      toast('Error processing request', 'error');
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this spam review?')) return;
    
    try {
      setActioning(id);
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/community/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        toast('Review deleted', 'success');
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        toast('Failed to delete review', 'error');
      }
    } catch (err) {
      toast('Error processing request', 'error');
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
            Community & Reviews
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mt-1">
            Sandboxed moderation queue connected exclusively to Database B (rummydexcommunity)
          </p>
        </div>
        <div className="bg-indigo-500/10 text-indigo-500 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border border-indigo-500/20">
          Total Pending: {reviews.length}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border-2 border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500" />
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300">All caught up!</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-500 mt-2">There are no pending community reviews.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-slate-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {review.appId}
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                      by {review.userName}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-5 h-5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-zinc-700'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {review.reviewText}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-3 min-w-[140px] w-full md:w-auto mt-4 md:mt-0">
                  <button
                    disabled={actioning === review.id}
                    onClick={() => handleApprove(review.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    disabled={actioning === review.id}
                    onClick={() => handleDelete(review.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunityTab;
