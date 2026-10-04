import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
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

async function generateSha1(str: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
  return Array.from(new Uint8Array(hash)).map(v => v.toString(16).padStart(2, '0')).join('');
}

export default function ImageUpload({ value, defaultValue, onChange, name, placeholder, className }: ImageUploadProps) {
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
      // 1. Try Client-side Cloudinary Upload if VITE_CLOUDINARY_* environment variables exist
      const envCloudName = (import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || (import.meta.env as any)?.CLOUDINARY_CLOUD_NAME || 'diewalae4').trim();
      const envApiKey = (import.meta.env?.VITE_CLOUDINARY_API_KEY || (import.meta.env as any)?.CLOUDINARY_API_KEY || '').trim();
      const envApiSecret = (import.meta.env?.VITE_CLOUDINARY_API_SECRET || (import.meta.env as any)?.CLOUDINARY_API_SECRET || '').trim();
      const envPreset = (import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET || (import.meta.env as any)?.CLOUDINARY_UPLOAD_PRESET || '').trim();

      if (envCloudName && envApiKey && envApiSecret) {
        try {
          const timestamp = Math.round(Date.now() / 1000);
          const strToSign = `folder=rummydex_uploads&timestamp=${timestamp}${envApiSecret}`;
          const signature = await generateSha1(strToSign);

          const formData = new FormData();
          formData.append('file', file);
          formData.append('api_key', envApiKey);
          formData.append('timestamp', String(timestamp));
          formData.append('signature', signature);
          formData.append('folder', 'rummydex_uploads');

          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;

          const cRes = await fetch(`https://api.cloudinary.com/v1_1/${envCloudName}/image/upload`, {
            method: 'POST',
            body: formData,
            signal: controller?.signal
          });

          if (timeoutId) clearTimeout(timeoutId);

          if (cRes.ok) {
            const cData = await cRes.json();
            if (cData.secure_url) {
              uploadedUrl = cData.secure_url;
            }
          }
        } catch (cErr) {
          console.warn("[ImageUpload] Direct Cloudinary signed upload notice:", cErr);
        }
      } else if (envCloudName && envPreset) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', envPreset);

          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;

          const cRes = await fetch(`https://api.cloudinary.com/v1_1/${envCloudName}/image/upload`, {
            method: 'POST',
            body: formData,
            signal: controller?.signal
          });

          if (timeoutId) clearTimeout(timeoutId);

          if (cRes.ok) {
            const cData = await cRes.json();
            if (cData.secure_url) {
              uploadedUrl = cData.secure_url;
            }
          }
        } catch (presetErr) {
          console.warn("[ImageUpload] Direct Cloudinary preset upload notice:", presetErr);
        }
      }

      // 2. Try server-side Cloudinary signature if a Node backend is active
      if (!uploadedUrl) {
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
              formData.append('folder', sigData.folder || 'rummydex_uploads');

              const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
              const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;

              const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`, {
                method: 'POST',
                body: formData,
                signal: controller?.signal
              });

              if (timeoutId) clearTimeout(timeoutId);

              if (cloudinaryRes.ok) {
                const cData = await cloudinaryRes.json();
                if (cData.secure_url) {
                  uploadedUrl = cData.secure_url;
                }
              }
            }
          }
        } catch (_) {}
      }

      // 3. Try Firebase Storage directly via client SDK with a strict 2.5s timeout
      if (!uploadedUrl && storage) {
        try {
          const storagePromise = (async () => {
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const storageRef = ref(storage, `uploads/${cleanName}`);
            const snap = await uploadBytes(storageRef, file);
            return await getDownloadURL(snap.ref);
          })();
          const timeoutPromise = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Firebase Storage timeout')), 2500)
          );
          uploadedUrl = await Promise.race([storagePromise, timeoutPromise]);
        } catch (storageErr) {
          console.warn("[ImageUpload] Firebase Storage fallback notice:", storageErr);
        }
      }

      // 4. Fallback: Instant Client-side compressed WebP data URL (<50ms)
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
        toast('Image uploaded and processed successfully!', 'success');
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

  const hasImage = Boolean(internalValue && internalValue.trim().length > 0);

  return (
    <div className={`relative flex items-center w-full gap-2 ${className || ''}`}>
      {name && <input type="hidden" name={name} value={internalValue || ''} />}
      
      {/* Live Thumbnail Preview */}
      {hasImage && (
        <div className="shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex items-center justify-center">
          <img 
            src={internalValue} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <input
        type="text"
        value={internalValue || ''}
        onChange={(e) => handleChange(e.target.value)}
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
          className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 text-xs gap-1.5"
          title="Upload Image"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-slate-500" />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
