import { Link } from 'react-router-dom';
import { safeHtml } from '../../lib/safeHtmlPublic';
import { AppConfig, BlogPost } from '../../types';

interface AppAboutSectionProps {
  app: AppConfig;
  relatedUpdates: BlogPost[];
}

export default function AppAboutSection({ app, relatedUpdates }: AppAboutSectionProps) {
  return (
    <div className="w-full mb-8 space-y-12">
      {app.custom_admin_box_html && (
        <div className="py-8 border-b border-black/5 dark:border-white/5 relative overflow-hidden w-full px-4 sm:px-6 md:px-10 transition-all duration-300">
          {app.custom_admin_box_heading && (
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 px-1 sm:px-0">
              {app.custom_admin_box_heading}
            </h2>
          )}
          <div 
            className="w-full text-zinc-800 dark:text-zinc-200"
            dangerouslySetInnerHTML={{ __html: safeHtml(app.custom_admin_box_html) }}
          />
        </div>
      )}

      <div className="py-8 w-full px-4 sm:px-6 md:px-10">
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 px-1 sm:px-0">
          About this app
        </h2>
        <div 
          className="w-full text-base text-zinc-700 dark:text-zinc-300 [&_strong]:font-semibold [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-blue-500 [&_a]:hover:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          dangerouslySetInnerHTML={{ __html: safeHtml(app.description_html, '<p>No details available.</p>') }}
        />

        {app.features_html && (
          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 px-1 sm:px-0">
              App Features
            </h2>
            <div 
              className="w-full text-base text-zinc-700 dark:text-zinc-300 [&_strong]:font-semibold [&_p]:mb-4 [&_p]:leading-relaxed [&_a]:text-blue-500 [&_a]:hover:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2"
              dangerouslySetInnerHTML={{ __html: safeHtml(app.features_html) }}
            />
          </div>
        )}
        
        {app.release_notes && (
          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">What's New</h3>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap border border-black/5 dark:border-white/5 line-clamp-4 hover:line-clamp-none transition-all">
              {app.release_notes}
            </div>
          </div>
        )}
        
        {relatedUpdates && relatedUpdates.length > 0 && (
          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 px-1 sm:px-0">
              Latest App Updates
            </h2>
            <div className="space-y-4">
              {relatedUpdates.map((update, idx) => (
                <Link key={`update-${update.id || idx}`} to={`/blog/${update.slug || update.id}`} className="block p-4 sm:p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
                    <span>Update</span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">{new Date(update.published_at!).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 transition-colors">
                    {update.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {update.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
