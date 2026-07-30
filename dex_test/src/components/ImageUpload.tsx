import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  placeholder?: string;
  className?: string;
}

export default function ImageUpload({ value, defaultValue, onChange, name, placeholder, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, isControlled]);

  const handleChange = (newVal: string) => {
    if (!isControlled) {
      setInternalValue(newVal);
    }
    if (onChange) {
      onChange(newVal);
    }
  };

  const compressImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
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
          reject(new Error("Failed to get canvas context"));
          return;
        }
        
        // Fill white background in case of transparent images converting to WebP/JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to WEBP with 0.6 quality for SUPER lightweight images (often < 10KB)
        const dataUrl = canvas.toDataURL('image/webp', 0.6);
        resolve(dataUrl);
      };
      
      img.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };
      
      img.src = objectUrl;
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress image and convert directly to base64 Data URL
      const base64Url = await compressImageToBase64(file);
      
      // UX: tiny delay so spinner is visible for a moment
      await new Promise(resolve => setTimeout(resolve, 300));
      
      handleChange(base64Url);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to process image. " + (error.message || ""));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper to show a truncated value if it's a huge base64 string
  const displayValue = currentValue.length > 200 && currentValue.startsWith('data:image') 
    ? 'Base64 Image Data (Compressed)' 
    : currentValue;

  return (
    <div className={`flex items-center w-full px-2 py-1 ${className || ''}`}>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <input
        type="text"
        value={displayValue}
        onChange={(e) => {
           // Only allow manual editing if it's not our placeholder
           if (e.target.value !== 'Base64 Image Data (Compressed)') {
              handleChange(e.target.value);
           }
        }}
        className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-1 m-0 text-[inherit] w-full"
        style={{ minWidth: 0 }}
        placeholder={placeholder || "https://..."}
      />
      <div className="relative shrink-0 ml-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={uploading}
        />
        <button
          type="button"
          disabled={uploading}
          className="flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
