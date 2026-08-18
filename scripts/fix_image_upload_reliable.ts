import fs from 'fs';

let imgUpload = fs.readFileSync('src/components/ImageUpload.tsx', 'utf8');

imgUpload = imgUpload.replace(
  /const compressImageToBase64 = \(file: File\): Promise<string> => \{([\s\S]*?)const handleUpload =/m,
  `const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 10 second failsafe timeout to prevent infinite spinning
      const timeoutId = setTimeout(() => {
        reject(new Error("Upload timed out. The file might be corrupted or unsupported."));
      }, 10000);

      const reader = new FileReader();
      reader.onerror = (err) => {
        clearTimeout(timeoutId);
        reject(err);
      };
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        
        // Bypass Canvas completely for Logos/Favicons. 
        // This preserves exact transparency, and fully supports ICO, SVG, and GIF files 
        // which often fail or hang when processed through an HTML Canvas.
        if (format === 'png') {
          clearTimeout(timeoutId);
          if (file.size > 2 * 1024 * 1024) {
             reject(new Error("Image is too large. Please upload an image under 2MB."));
             return;
          }
          resolve(rawDataUrl);
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 512;
            const MAX_HEIGHT = 512;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              clearTimeout(timeoutId);
              reject(new Error("Failed to get canvas context"));
              return;
            }
            
            // Only fill white background if converting to webp
            if (format === 'webp') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, width, height);
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/webp', 0.6);
            clearTimeout(timeoutId);
            resolve(dataUrl);
          } catch (err) {
            clearTimeout(timeoutId);
            reject(err);
          }
        };
        img.onerror = (error) => {
          clearTimeout(timeoutId);
          reject(new Error("Browser failed to decode image."));
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload =`
);

fs.writeFileSync('src/components/ImageUpload.tsx', imgUpload);
