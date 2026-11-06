import React, { useState } from 'react';
import { Video as VideoIcon, Plus, Trash2, LayoutDashboard, Edit2, Save, ExternalLink, Loader2, Check } from 'lucide-react';
import { extractYoutubeId, formatNewsDate } from '../../lib/newsUtils';

interface AdminVideosTabProps {
  videosList: any[];
  handleAddVideo: () => void;
  handleDeleteVideo: (id: string) => void;
  handleVideosChange: (id: string, field: string, value: any) => void;
  handleSaveVideos: (e: React.FormEvent) => void;
  handleSaveSingleVideo?: (item: any) => Promise<any>;
  saving: boolean;
}

export const AdminVideosTab = React.memo(({
  videosList,
  handleAddVideo,
  handleDeleteVideo,
  handleVideosChange,
  handleSaveVideos,
  handleSaveSingleVideo,
  saving
}: AdminVideosTabProps) => {
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSaveOne = async (item: any, closeAfter = false) => {
    setSavingId(item.id);
    try {
      if (handleSaveSingleVideo) {
        await handleSaveSingleVideo(item);
      } else {
        await handleSaveVideos({ preventDefault: () => {} } as any);
      }
      if (closeAfter) setEditingVideoId(null);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-2.5 pb-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <VideoIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Videos &amp; Guides</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {videosList.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Each video saves individually to minimize quota usage
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddVideo()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Video
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {videosList.map((item: any) => {
          const rawUrl = item.youtube_url || item.video_url || item.url || '';
          const videoId = extractYoutubeId(rawUrl);
          const vSlug = item.slug || item.id;
          const dateLabel = formatNewsDate(item.created_at, item.published_at, item.created_at);
          const isThisSaving = saving || savingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-2xs relative overflow-hidden"
            >
              {editingVideoId === item.id ? (
                <div className="space-y-3.5">
                  <div className="flex flex-wrap justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-blue-600 flex items-center gap-1.5">
                        <LayoutDashboard className="w-3.5 h-3.5" /> Edit Video Guide
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ID: {item.id} · /videos/{vSlug}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(item.id)}
                        className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 px-2.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer border-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVideoId(null)}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer border-0"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        disabled={isThisSaving}
                        onClick={() => handleSaveOne(item, true)}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer border-0 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Save &amp; Close
                      </button>
                      <button
                        type="button"
                        disabled={isThisSaving}
                        onClick={() => handleSaveOne(item, false)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer border-0 disabled:opacity-50"
                      >
                        {isThisSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{isThisSaving ? 'Saving...' : 'Save Video'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Video Title
                        </label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => handleVideosChange(item.id, 'title', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          placeholder="Video title"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Slug (URL Path)
                          </label>
                          <input
                            type="text"
                            value={item.slug || ''}
                            onChange={(e) => handleVideosChange(item.id, 'slug', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                            placeholder="my-video-guide"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            YouTube URL or Video ID
                          </label>
                          <input
                            type="text"
                            value={rawUrl}
                            onChange={(e) => handleVideosChange(item.id, 'youtube_url', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                            placeholder="https://youtu.be/..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Category Label
                          </label>
                          <input
                            type="text"
                            value={item.category || ''}
                            onChange={(e) => handleVideosChange(item.id, 'category', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="Video Guide"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Duration (Optional)
                          </label>
                          <input
                            type="text"
                            value={item.duration || ''}
                            onChange={(e) => handleVideosChange(item.id, 'duration', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                            placeholder="04:30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Video Description
                        </label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => handleVideosChange(item.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          placeholder="Detailed summary of the video walkthrough..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          SEO Title
                        </label>
                        <input
                          type="text"
                          value={item.seo_title || ''}
                          onChange={(e) => handleVideosChange(item.id, 'seo_title', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          placeholder={item.title || 'SEO Title'}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          SEO Meta Description
                        </label>
                        <textarea
                          value={item.seo_description || ''}
                          onChange={(e) => handleVideosChange(item.id, 'seo_description', e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          placeholder="Concise 150-160 character summary for search results..."
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Search Keywords
                          </label>
                          <input
                            type="text"
                            value={item.seo_keywords || ''}
                            onChange={(e) => handleVideosChange(item.id, 'seo_keywords', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            placeholder="comma, separated, keywords"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Related App Slug/ID
                          </label>
                          <input
                            type="text"
                            value={item.related_app_id || ''}
                            onChange={(e) => handleVideosChange(item.id, 'related_app_id', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                            placeholder="e.g. jiocinema"
                          />
                        </div>
                      </div>
                      {videoId ? (
                        <div className="pt-1">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            loading="lazy"
                            width={320}
                            height={180}
                            className="h-28 aspect-video object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                            alt="YouTube thumbnail preview"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {videoId ? (
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        loading="lazy"
                        width={112}
                        height={63}
                        className="w-20 sm:w-24 aspect-video object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                        onClick={() => setEditingVideoId(item.id)}
                        alt={item.title || 'Video'}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingVideoId(item.id)}
                        className="w-20 sm:w-24 aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                      >
                        <VideoIcon className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3
                        onClick={() => setEditingVideoId(item.id)}
                        className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                      >
                        {item.title || 'Untitled Video'}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        /videos/{vSlug} · {dateLabel}
                      </p>
                      {item.description ? (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`/videos/${encodeURIComponent(vSlug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg font-bold text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">View</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setEditingVideoId(item.id)}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer border-0"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

AdminVideosTab.displayName = 'AdminVideosTab';

export default AdminVideosTab;
