const fs = require('fs');

let code = fs.readFileSync('src/pages/AppDetails.tsx', 'utf-8');

const screenshotsBlock = `

            {app.screenshots && app.screenshots.length > 0 && (
              <div className="w-full mb-6">
                <div className="flex overflow-x-auto hide-scrollbar gap-3 px-2 sm:px-0 pb-2 snap-x">
                  {app.screenshots.map((imgUrl, i) => (
                    <div key={i} className="flex-none w-[160px] sm:w-[220px] aspect-[9/19] rounded-2xl overflow-hidden snap-center bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/10">
                      <img src={imgUrl} alt={\`Screenshot \${i + 1}\`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <PlayStoreRatingSection
`;

code = code.replace('<PlayStoreRatingSection', screenshotsBlock + '<PlayStoreRatingSection');

fs.writeFileSync('src/pages/AppDetails.tsx', code);
console.log("Screenshots section added");
