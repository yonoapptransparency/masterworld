import React, { useState } from 'react';
import { Video as VideoIcon, Plus, Trash2, LayoutDashboard, Edit2, Save, ExternalLink } from 'lucide-react';
import { extractYoutubeId, formatNewsDate } from '../../lib/newsUtils';

interface AdminVideosTabProps {
  videosList: any[];
  handleAddVideo: () => void;
  handleDeleteVideo: (id: string) => void;
  handleVideosChange: (id: string, field: string, value: any) => void;
  handleSaveVideos: (e: React.FormEvent) => void;
  saving: boolean;
}

export const AdminVideosTab = React.memo(({
  videosList,
  handleAddVideo,
  handleDeleteVideo,
  handleVideosChange,
  handleSaveVideos,
  saving
}: AdminVideosTabProps) => {
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 dark:text-white">
            <VideoIcon className="w-5 h-5 text-blue-500" /> Videos &amp; Guides Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {videosList.length} {videosList.length === 1 ? 'video' : 'videos'} configured in catalog
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              handleAddVideo();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Video
          </button>
          <button
            type="button"
            onClick={handleSaveVideos}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {videosList.map((item: any) => {
          const rawUrl = item.youtube_url || item.video_url || item.url || '';
          const videoId = extractYoutubeId(rawUrl);
          const vSlug = item.slug || item.id;
          const dateLabel = formatNewsDate(item.created_at, item.published_at, item.created_at);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm relative overflow-hidden"
            >
              {editingVideoId === item.id ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/10 dark:border-white/10 pb-4 gap-3">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-blue-600 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Edit Video Guide
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        ID: {item.id} · /videos/{vSlug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(item.id)}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVideoId(null)}
                        className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-black/5 dark:border-white/5 pb-2">
                        Video Details &amp; Stream
                      </h4>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Video Title
                        </label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => handleVideosChange(item.id, 'title', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Video title"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Slug (URL Path)
                          </label>
                          <input
                            type="text"
                            value={item.slug || ''}
                            onChange={(e) => handleVideosChange(item.id, 'slug', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="my-video-guide"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            YouTube URL or Video ID
                          </label>
                          <input
                            type="text"
                            value={rawUrl}
                            onChange={(e) => handleVideosChange(item.id, 'youtube_url', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="https://youtu.be/..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Category Label
                          </label>
                          <input
                            type="text"
                            value={item.category || ''}
                            onChange={(e) => handleVideosChange(item.id, 'category', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Video Guide"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Duration (Optional)
                          </label>
                          <input
                            type="text"
                            value={item.duration || ''}
                            onChange={(e) => handleVideosChange(item.id, 'duration', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="04:30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Video Description
                        </label>
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => handleVideosChange(item.id, 'description', e.target.value)}
                          rows={4}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Detailed summary of the video walkthrough..."
                        />
                      </div>

                      {videoId ? (
                        <div className="pt-1">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                            loading="lazy"
                            width={480}
                            height={270}
                            className="w-full aspect-video object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                            alt="YouTube thumbnail preview"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-black/5 dark:border-white/5 pb-2">
                        Search Engine &amp; OpenGraph Metadata
                      </h4>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SEO Title
                        </label>
                        <input
                          type="text"
                          value={item.seo_title || ''}
                          onChange={(e) => handleVideosChange(item.id, 'seo_title', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder={item.title || 'SEO Title'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          SEO Meta Description
                        </label>
                        <textarea
                          value={item.seo_description || ''}
                          onChange={(e) => handleVideosChange(item.id, 'seo_description', e.target.value)}
                          rows={3}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Concise 150-160 character summary for search results..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Search Keywords
                        </label>
                        <input
                          type="text"
                          value={item.seo_keywords || ''}
                          onChange={(e) => handleVideosChange(item.id, 'seo_keywords', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="comma, separated, keywords"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Related App Slug or ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={item.related_app_id || ''}
                          onChange={(e) => handleVideosChange(item.id, 'related_app_id', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="e.g. jiocinema"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {videoId ? (
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        loading="lazy"
                        width={120}
                        height={68}
                        className="w-24 sm:w-28 aspect-video object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                        alt={item.title || 'Video'}
                      />
                    ) : (
                      <div className="w-24 sm:w-28 aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                        <VideoIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {item.title || 'Untitled Video'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                        /videos/{vSlug} · {dateLabel}
                      </p>
                      {item.description ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <a
                      href={`/videos/${encodeURIComponent(vSlug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl font-semibold text-xs transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </a>
                    <button
                      type="button"
                      onClick={() => setEditingVideoId(item.id)}
                      className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10 flex justify-end">
        <button
          type="button"
          onClick={handleSaveVideos}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-7 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {saving ? 'Saving Video Catalog...' : <><Save className="w-4 h-4" /> Publish Video Catalog</>}
        </button>
      </div>
    </div>
  );
});

AdminVideosTab.displayName = 'AdminVideosTab';

export default AdminVideosTab;
