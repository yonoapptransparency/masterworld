import React from 'react';

interface ImageUploadProps {
  name?: string;
  value?: string;
  onChange?: (val: string) => void;
  defaultValue?: string;
  format?: string;
  className?: string;
  placeholder?: string;
}

export default function ImageUpload({ name, value, onChange, defaultValue, className, placeholder }: ImageUploadProps) {
  return (
    <input
      type="text"
      name={name}
      value={value !== undefined ? value : (defaultValue || '')}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={className || "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm text-slate-800 dark:text-slate-100"}
      placeholder={placeholder || "Enter image URL..."}
    />
  );
}
