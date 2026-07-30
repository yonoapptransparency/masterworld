import YouTubePlayer from './YouTubePlayer';
import { AppConfig } from '../../types';

interface AppScreenshotsProps {
  app: AppConfig;
}

export default function AppScreenshots({ app }: AppScreenshotsProps) {
  if (!app.screenshots?.length && !app.video_url) return null;

  return (
    <div className="w-full mb-6">
      <div className="flex overflow-x-auto hide-scrollbar gap-2.5 px-4 sm:px-0 pb-2 snap-x items-center -mx-4 sm:-mx-0">
        {app.video_url && (
          <YouTubePlayer videoUrl={app.video_url} />
        )}
        {app.screenshots && app.screenshots.map((imgUrl, i) => (
          <div 
            key={`screenshot-${i}`} 
            className="flex-none w-[90px] sm:w-[125px] aspect-[9/16] rounded-xl overflow-hidden snap-center bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/10 select-none"
          >
            <img 
              src={imgUrl} 
              alt={`Screenshot ${i + 1}`} 
              loading="lazy" 
              width={125} 
              height={222} 
              className="w-full h-full object-cover select-none pointer-events-none" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
