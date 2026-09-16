import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { adminFetch } from '../services/adminAuthService';

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
    try {
      // 1. Get secure upload signature from our backend
      const sigRes = await adminFetch('/api/v1/admin/upload/signature');
      const sigData = await sigRes.json();
      
      if (!sigRes.ok || sigData.status !== 'OK') {
        throw new Error(sigData.msg || 'Failed to get upload signature from server. Check Cloudinary API Keys.');
      }

      // 2. Upload file directly from browser to Cloudinary API
      // This bypasses Vercel 4.5MB payload limits completely.
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.api_key);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed.');
      }

      // 3. Success! Set the returned secure URL
      if (cloudinaryData.secure_url) {
        handleChange(cloudinaryData.secure_url);
      } else {
        throw new Error('Cloudinary did not return a secure URL.');
      }

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
