import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { adminFetch } from '../services/adminAuthService';
import { storage } from '../lib/firebase';
import { toast } from './Toast';

interface ImageUploadProps {
  format?: 'webp' | 'png';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  placeholder?: string;
  className?: string;
}

export default function ImageUpload({ value, defaultValue, onChange, name, placeholder, className, format = 'webp' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(value !== undefined ? value : (defaultValue || ''));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (newVal: string) => {
    setInternalValue(newVal);
    if (onChange) {
      onChange(newVal);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    let uploadedUrl = '';

    try {
      // 1. Try secure Cloudinary upload signature from backend if running
      try {
        const sigRes = await adminFetch('/api/v1/admin/upload/signature');
        const cType = sigRes.headers.get('content-type') || '';
        if (sigRes.ok && cType.includes('application/json')) {
          const sigData = await sigRes.json();
          if (sigData.status === 'OK' && sigData.api_key) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', sigData.api_key);
            formData.append('timestamp', sigData.timestamp.toString());
            formData.append('signature', sigData.signature);
            formData.append('folder', sigData.folder || 'rummydex');

            const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`, {
              method: 'POST',
              body: formData
            });

            if (cloudinaryRes.ok) {
              const cData = await cloudinaryRes.json();
              if (cData.secure_url) {
                uploadedUrl = cData.secure_url;
              }
            }
          }
        }
      } catch (_) {
        // Backend not available (e.g. Cloudflare Pages static SPA), proceed to fallbacks
      }

      // 2. Try Firebase Storage directly via client SDK
      if (!uploadedUrl && storage) {
        try {
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const storageRef = ref(storage, `uploads/${cleanName}`);
          const snap = await uploadBytes(storageRef, file);
          uploadedUrl = await getDownloadURL(snap.ref);
        } catch (storageErr) {
          console.warn("[ImageUpload] Firebase Storage fallback notice:", storageErr);
        }
      }

      // 3. Fallback: Client-side compressed WebP data URL
      if (!uploadedUrl) {
        uploadedUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const maxDim = 1200;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/webp', 0.85));
            };
            img.onerror = () => reject(new Error('Could not load image for optimization.'));
            img.src = event.target?.result as string;
          };
          reader.onerror = () => reject(new Error('Could not read image file.'));
          reader.readAsDataURL(file);
        });
      }

      if (uploadedUrl) {
        handleChange(uploadedUrl);
        toast('Image uploaded and processed successfully.', 'success');
      } else {
        throw new Error('Image could not be processed.');
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      toast(error.message || 'Image processing failed', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const displayValue = internalValue.length > 200 && internalValue.startsWith('data:image') 
    ? 'Image Uploaded Successfully' 
    : internalValue;

  return (
    <div className={`relative flex items-center w-full ${className || ''}`}>
      {name && <input type="hidden" name={name} value={internalValue || ''} />}
      <input
        type="text"
        value={displayValue || ''}
        onChange={(e) => { 
           if (e.target.value !== 'Image Uploaded Successfully') {
              handleChange(e.target.value);
           }
        }}
        className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-3 py-2 text-[inherit] w-full min-w-0"
        placeholder={placeholder || "https://..."}
      />
      <div className="shrink-0 flex items-center pr-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-md font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
          title="Upload to Cloudinary"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
