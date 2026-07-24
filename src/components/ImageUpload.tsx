import React, { useRef, useState } from 'react';
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

  const handleChange = (newVal: string) => {
    if (!isControlled) {
      setInternalValue(newVal);
    }
    if (onChange) {
      onChange(newVal);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to WebP with 0.7 quality to keep size small (<50-100KB)
          const dataUrl = canvas.toDataURL('image/webp', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
        img.src = event.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress and convert image to base64 on the client side
      // This avoids Firebase Storage setup issues and keeps files small
      const base64Url = await compressImage(file);
      handleChange(base64Url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to process and compress image. Please try another image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`flex items-center w-full px-2 py-1 ${className || ''}`}>
      <input
        type="text"
        name={name}
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
