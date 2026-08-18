import fs from 'fs';

let imgUpload = fs.readFileSync('src/components/ImageUpload.tsx', 'utf8');

// Add format prop
imgUpload = imgUpload.replace(
  /interface ImageUploadProps \{/,
  `interface ImageUploadProps {\n  format?: 'webp' | 'png';`
);

imgUpload = imgUpload.replace(
  /export default function ImageUpload\(\{(.*?)\} : ImageUploadProps\) \{/,
  `export default function ImageUpload({$1, format = 'webp' }: ImageUploadProps) {`
);

// Fix the white background and webp conversion
imgUpload = imgUpload.replace(
  /\/\/ Fill white background in case of transparent images converting to WebP\/JPEG\s*ctx\.fillStyle = '#ffffff';\s*ctx\.fillRect\(0, 0, width, height\);\s*ctx\.drawImage\(img, 0, 0, width, height\);\s*\/\/ Compress to WEBP with 0.6 quality for SUPER lightweight images \(often < 10KB\)\s*const dataUrl = canvas\.toDataURL\('image\/webp', 0\.6\);/,
  `// Only fill white background if converting to webp (to avoid black backgrounds on transparent regions)
        if (format === 'webp') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use PNG for logos/favicons to preserve transparency, otherwise WebP
        const dataUrl = format === 'png' 
          ? canvas.toDataURL('image/png') 
          : canvas.toDataURL('image/webp', 0.6);`
);

fs.writeFileSync('src/components/ImageUpload.tsx', imgUpload);

// Now update AdminSettingsTab.tsx to use format="png" for logo and favicon
let adminSettings = fs.readFileSync('src/components/admin/AdminSettingsTab.tsx', 'utf8');
adminSettings = adminSettings.replace(
  /<ImageUpload name="logo_url"/,
  `<ImageUpload name="logo_url" format="png"`
);
adminSettings = adminSettings.replace(
  /<ImageUpload name="favicon_url"/,
  `<ImageUpload name="favicon_url" format="png"`
);

fs.writeFileSync('src/components/admin/AdminSettingsTab.tsx', adminSettings);
