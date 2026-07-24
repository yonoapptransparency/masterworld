import React, { useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!storage) {
      alert("Firebase Storage is not configured!");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const storageRef = ref(storage, `uploads/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      handleChange(url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Check console for details.");
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
