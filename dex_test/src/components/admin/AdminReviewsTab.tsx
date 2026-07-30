import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldAlert, MessageSquare, CheckCircle2, Search, AlertTriangle, CheckSquare } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface AdminReview {
  id: string;
  app_id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  is_approved: boolean;
  source?: string;
  type: 'review' | 'ticket' | 'feedback';
  email?: string;
  status?: string;
}

export const AdminReviewsTab = ({ db }: { db: any }) => {
  const [items, setItems] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'tickets' | 'reviews' | 'feedbacks'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchModerationItems = async () => {
    setLoading(true);
    try {
      const list: AdminReview[] = [];
      
      // 1. Fetch user reviews and missing link reports
      try {
        const snap = await getDocs(collection(db, 'reviews'));
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            type: data.source === 'missing_link_report' ? 'ticket' : 'review',
            app_id: data.app_id || '',
            username: data.username || '',
            rating: Number(data.rating || 0),
            comment: data.comment || '',
            created_at: data.created_at || '',
            helpful_count: Number(data.helpful_count || 0),
            is_approved: !!data.is_approved,
            source: data.source || 'reviews_db',
          });
        });
      } catch (err) {
        console.warn("Failed to load reviews:", err);
      }

      // 2. Fetch formal customer support tickets
      try {
        const snap = await getDocs(collection(db, 'support_tickets'));
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            type: 'ticket',
            app_id: 'Support Center Form',
            username: data.username || 'Anonymous User',
            email: data.email || '',
            rating: 0,
            comment: data.comment || '',
            created_at: data.created_at || '',
            helpful_count: 0,
            is_approved: data.status === 'resolved',
            status: data.status || 'pending',
            source: data.source || 'contact_page',
          });
        });
      } catch (err) {
        console.warn("Failed to load support_tickets:", err);
      }

      // 3. Fetch instant platform feedback loops
      try {
        const snap = await getDocs(collection(db, 'website_feedback'));
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            type: 'feedback',
            app_id: 'Website Feedback Hub',
            username: data.username || 'Anonymous User',
            rating: Number(data.rating || 0),
            comment: data.comment || '',
            created_at: data.created_at || '',
            helpful_count: 0,
            is_approved: true,
            source: data.source || 'website_feedback_db',
          });
        });
      } catch (err) {
        console.warn("Failed to load website_feedback:", err);
      }

      // Sort globally by created_at descending
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setItems(list);
    } catch (err: any) {
      console.warn("Error loading support dispatch items:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationItems();
  }, [db]);

  const handleApprove = async (id: string, type: 'review' | 'ticket' | 'feedback', isMissingLink: boolean) => {
    setActioning(id);
    try {
      if (type === 'ticket') {
        if (isMissingLink) {
          await updateDoc(doc(db, 'reviews', id), { is_approved: true });
        } else {
          await updateDoc(doc(db, 'support_tickets', id), { status: 'resolved' });
        }
      } else {
        await updateDoc(doc(db, 'reviews', id), { is_approved: true });
      }
      setItems(items.map(item => item.id === id ? { ...item, is_approved: true, status: 'resolved' } : item));
    } catch (err) {
      console.error("Failed to approve/resolve support item:", err);
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (id: string, type: 'review' | 'ticket' | 'feedback', isMissingLink: boolean) => {
    const isReport = type === 'ticket';
    const confirmationMsg = isReport 
      ? "Resolve and permanently close this support ticket? This confirms the application access link has been verified and updated."
      : "Permanently delete this customer case/review?";
    
    if (!confirm(confirmationMsg)) return;
    setActioning(id);
    try {
      if (type === 'ticket') {
        if (isMissingLink) {
          await deleteDoc(doc(db, 'reviews', id));
        } else {
          await deleteDoc(doc(db, 'support_tickets', id));
        }
      } else if (type === 'feedback') {
        await deleteDoc(doc(db, 'website_feedback', id));
      } else {
        await deleteDoc(doc(db, 'reviews', id));
      }
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete support item:", err);
    } finally {
      setActioning(null);
    }
  };

  const reports = items.filter(item => item.type === 'ticket');
  const reviews = items.filter(item => item.type === 'review');
  const feedbacks = items.filter(item => item.type === 'feedback');

  const pendingReviewsCount = reviews.filter(r => !r.is_approved).length;
  const pendingTicketsCount = reports.filter(t => t.status === 'pending' || !t.is_approved).length;

  const filteredItems = items.filter(item => {
    if (activeSubTab === 'tickets' && item.type !== 'ticket') return false;
    if (activeSubTab === 'reviews' && item.type !== 'review') return false;
    if (activeSubTab === 'feedbacks' && item.type !== 'feedback') return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchApp = (item.app_id || '').toLowerCase().includes(query);
      const matchComment = (item.comment || '').toLowerCase().includes(query);
      const matchUser = (item.username || '').toLowerCase().includes(query);
      const matchEmail = (item.email || '').toLowerCase().includes(query);
      return matchApp || matchComment || matchUser || matchEmail;
    }

    return true;
  });

  return (
    <div className="animate-fade-in space-y-8">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black/5 dark:border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 dark:text-zinc-500 font-mono">Unified Customer Service Desk</span>
          </div>
          <h2 className="text-3xl font-black dark:text-white uppercase italic tracking-tighter">
            Customer Support Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium font-sans">
            Triage active inbound support cases, resolve Google sign-in tickets, and reply to web platform ratings.
          </p>
        </div>
        <button 
          onClick={fetchModerationItems}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-slate-100 dark:bg-zinc-800 border-2 border-black/10 dark:border-white/10 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <RefreshCw className="w-12 h-12 text-pink-500 animate-spin" />
          <span className="text-xs font-black uppercase text-slate-400 tracking-widest font-mono">Fetching Unified Dispatch...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Support Telemetry Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-zinc-900 border-2 border-black/5 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Support Tickets</span>
                <div className="text-2xl font-black dark:text-white">{reports.length}</div>
                <p className="text-[9px] font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full w-fit">
                  {pendingTicketsCount} unresolved tickets
                </p>
              </div>
              <ShieldAlert className="w-10 h-10 text-rose-500 opacity-20" />
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900 border-2 border-black/5 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">App Reviews Queue</span>
                <div className="text-2xl font-black dark:text-white">{reviews.length}</div>
                <p className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full w-fit">
                  {pendingReviewsCount} to moderate
                </p>
              </div>
              <MessageSquare className="w-10 h-10 text-amber-500 opacity-20" />
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950 border-2 border-black/5 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Platform Feedback Items</span>
                <div className="text-2xl font-black text-indigo-500 dark:text-indigo-400">{feedbacks.length}</div>
                <p className="text-[9px] font-semibold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full w-fit">
                  Instant portal analytics
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-indigo-500 opacity-20" />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-50 dark:bg-zinc-900/60 border-2 border-black/5 dark:border-white/5 p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-zinc-800 rounded-xl border border-black/5 dark:border-white/5">
              <button
                onClick={() => setActiveSubTab('all')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeSubTab === 'all' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'text-slate-500 dark:text-zinc-400'}`}
              >
                All Cases ({items.length})
              </button>
              <button
                onClick={() => setActiveSubTab('tickets')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeSubTab === 'tickets' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 dark:text-zinc-400 hover:text-rose-500'}`}
              >
                Support Tickets ({reports.length})
              </button>
              <button
                onClick={() => setActiveSubTab('reviews')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeSubTab === 'reviews' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-500 dark:text-zinc-400 hover:text-pink-500'}`}
              >
                App Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setActiveSubTab('feedbacks')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeSubTab === 'feedbacks' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-zinc-400 hover:text-indigo-500'}`}
              >
                Website Feedback ({feedbacks.length})
              </button>
            </div>

            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-200" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or comment..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border-2 border-black/10 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-350 focus:outline-none focus:border-pink-500 transition-all dark:placeholder-zinc-500"
              />
            </div>
          </div>

          {/* List workspace */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="bg-black/5 dark:bg-white/5 border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl py-16 px-6 text-center">
                <AlertTriangle className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-3 opacity-60" />
                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider mb-1">No Active Tickets Found</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {searchQuery 
                    ? `No support tickets or customer reviews match your query: "${searchQuery}".`
                    : "Excellent, support dispatch queue is beautifully fully caught up!"
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                {filteredItems.map((item) => {
                  const isMissingLinkReport = item.source === 'missing_link_report';
                  
                  if (item.type === 'ticket') {
                    if (isMissingLinkReport) {
                      return (
                        <div 
                          key={item.id} 
                          className="bg-white dark:bg-zinc-900 border-2 border-rose-500/20 dark:border-rose-500/10 rounded-2.5xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:border-rose-500/40 relative overflow-hidden shadow-sm"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>

                          <div className="space-y-2 flex-1 pl-2">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-[9px] font-black uppercase tracking-widest bg-rose-500 text-white px-2.5 py-1 rounded-lg">
                                Link Clearance Ticket
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono">
                                App ID: <span className="font-bold underline text-slate-750 dark:text-zinc-300">{item.app_id}</span>
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 font-mono">
                                {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>

                            <div className="bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/10 p-3.5 rounded-xl">
                              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                {item.comment}
                              </p>
                            </div>

                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                              <span className="font-black text-rose-500">SLA Info:</span> Configure the active clearance/access link URL inside the App Catalog and mark this ticket as resolved.
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t border-black/5 md:border-none pt-4 md:pt-0 pl-2">
                            <button
                              disabled={actioning === item.id}
                              onClick={() => handleDelete(item.id, 'ticket', true)}
                              className="w-full md:w-auto px-5 py-2.5 bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-800 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-0"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              {actioning === item.id ? 'Loading...' : 'Mark Resolved'}
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      // Modern Contact Form Support Ticket
                      const isResolved = item.status === 'resolved' || item.is_approved;
                      return (
                        <div 
                          key={item.id} 
                          className={`bg-white dark:bg-zinc-900 border-2 ${isResolved ? 'border-zinc-205/50 dark:border-white/5' : 'border-emerald-500/20 dark:border-emerald-500/10'} rounded-2.5xl p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden`}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isResolved ? 'bg-zinc-300 dark:bg-zinc-800' : 'bg-emerald-500'}`}></div>

                          <div className="flex justify-between items-start flex-wrap gap-4 pl-2">
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2.5 py-1 rounded-lg">
                                  Contact Ticket Inquiry
                                </span>
                                <span className="text-xs font-black text-slate-800 dark:text-zinc-200">{item.username}</span>
                                {item.email && (
                                  <a 
                                    href={`mailto:${item.email}`}
                                    className="text-[10px] font-semibold text-blue-500 hover:underline hover:text-blue-600"
                                    title="Click to respond via mail client"
                                  >
                                    [{item.email}]
                                  </a>
                                )}
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${isResolved ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse'}`}>
                                  {isResolved ? 'Resolved' : 'Pending Action'}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono mt-1.5">
                                Submitted: {new Date(item.created_at).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isResolved && (
                                <button
                                  disabled={actioning === item.id}
                                  onClick={() => handleApprove(item.id, 'ticket', false)}
                                  className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-800 font-black text-[9px] uppercase tracking-wider rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer border-0"
                                >
                                  Mark Resolved
                                </button>
                              )}
                              <button
                                disabled={actioning === item.id}
                                onClick={() => handleDelete(item.id, 'ticket', false)}
                                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 disabled:bg-slate-200 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0"
                              >
                                Delete Ticket
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-50 dark:bg-zinc-850 p-4 rounded-xl border border-black/5 dark:border-white/5 pl-4 ml-2">
                            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                              {item.comment}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  } else if (item.type === 'feedback') {
                    // Website layout/feature rating feedback (from header widgets or quick links)
                    return (
                      <div 
                        key={item.id} 
                        className="bg-white dark:bg-zinc-900 border-2 border-indigo-500/20 dark:border-indigo-500/10 rounded-2.5xl p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>

                        <div className="flex justify-between items-start flex-wrap gap-4 pl-2">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500 text-white px-2.5 py-1 rounded-lg">
                                Website Platform Feedback
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-zinc-200">{item.username}</span>
                              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                                Portal Feedback
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-sm font-bold text-amber-500">
                                {'★'.repeat(item.rating)}
                                <span className="opacity-25">{'★'.repeat(Math.max(0, 5 - item.rating))}</span>
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono">
                                Logged: {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={actioning === item.id}
                              onClick={() => handleDelete(item.id, 'feedback', false)}
                              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 disabled:bg-slate-200 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-850 p-4 rounded-xl border border-black/5 dark:border-white/5 pl-4 ml-2">
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {item.comment}
                          </p>
                        </div>
                      </div>
                    );
                  } else {
                    // Standard App Review
                    return (
                      <div 
                        key={item.id} 
                        className="bg-white dark:bg-zinc-900 border-2 border-black/10 dark:border-white/10 rounded-2.5xl p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-pink-500"></div>

                        <div className="flex justify-between items-start flex-wrap gap-4 pl-2">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-xs font-black text-slate-800 dark:text-zinc-200">{item.username}</span>
                              <span className="text-[9px] font-black uppercase tracking-wider bg-pink-500/10 text-pink-500 px-2.5 py-0.5 rounded-md">
                                App ID Ref: {item.app_id}
                              </span>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${item.is_approved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                {item.is_approved ? 'Published' : 'Under Review'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-sm font-bold text-amber-500">
                                {'★'.repeat(item.rating)}
                                <span className="opacity-25">{'★'.repeat(Math.max(0, 5 - item.rating))}</span>
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono">
                                Created: {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!item.is_approved && (
                              <button
                                disabled={actioning === item.id}
                                onClick={() => handleApprove(item.id, 'review', false)}
                                className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-800 font-black text-[9px] uppercase tracking-wider rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer border-0"
                              >
                                Approve Publication
                              </button>
                            )}
                            <button
                              disabled={actioning === item.id}
                              onClick={() => handleDelete(item.id, 'review', false)}
                              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 disabled:bg-slate-200 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer border-0"
                            >
                              Delete Review
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-850 p-4 rounded-xl border border-black/5 dark:border-white/5 pl-4 ml-2">
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {item.comment}
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsTab;
