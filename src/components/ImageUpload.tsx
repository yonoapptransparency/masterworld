import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

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
  const { token } = useAdminAuth();
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
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'OK' && data.secure_url) {
        handleChange(data.secure_url);
      } else {
        throw new Error(data.msg || 'Upload failed');
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
