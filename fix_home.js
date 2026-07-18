const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
content = content.replace(/import PlayStoreRatingSection from '\.\.\/components\/PlayStoreRatingSection';\n/g, '');
content = content.replace(/import StarRatingFeedback from '\.\.\/components\/StarRatingFeedback';\n/g, '');
content = content.replace(/<PlayStoreRatingSection appId="home_site_rating" appTitle="Website" \/>/g, '');
content = content.replace(/<StarRatingFeedback \/>/g, '');
fs.writeFileSync('src/pages/Home.tsx', content, 'utf-8');
