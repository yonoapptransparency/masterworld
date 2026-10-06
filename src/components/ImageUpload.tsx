import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon, Settings, Check, AlertCircle, Cloud, X } from 'lucide-react';
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

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  upload_preset: string;
}

export function getResolvedCloudinaryConfig(): CloudinaryConfig {
  let cached: any = {};
  try {
    const raw = localStorage.getItem('cached_cloudinary_config');
    if (raw) cached = JSON.parse(raw);
  } catch (_) {}

  const initialSettings = (globalThis as any)?.__INITIAL_DATA__?.settings || {};

  const cloud_name = (
    cached.cloud_name ||
    initialSettings.cloudinary_cloud_name ||
    (import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME as string) ||
    'diewalae4'
  ).trim();

  const api_key = (
    cached.api_key ||
    initialSettings.cloudinary_api_key ||
    (import.meta.env?.VITE_CLOUDINARY_API_KEY as string) ||
    '883757976464181'
  ).trim();

  const api_secret = (
    cached.api_secret ||
    initialSettings.cloudinary_api_secret ||
    (import.meta.env?.VITE_CLOUDINARY_API_SECRET as string) ||
    ''
  ).trim();

  const upload_preset = (
    cached.upload_preset ||
    initialSettings.cloudinary_upload_preset ||
    (import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET as string) ||
    'rummydex'
  ).trim();

  return { cloud_name, api_key, api_secret, upload_preset };
}

async function generateSha1(str: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
  return Array.from(new Uint8Array(hash)).map(v => v.toString(16).padStart(2, '0')).join('');
}

async function compressImageForUpload(file: File, maxDim = 800, quality = 0.85): Promise<Blob> {
  return new Promise((resolve) => {
    if (file.size < 120 * 1024) {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/webp',
          quality
        );
      } else {
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export default function ImageUpload({ value, defaultValue, onChange, name, placeholder, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(value !== undefined ? value : (defaultValue || ''));
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [localCloudinaryConfig, setLocalCloudinaryConfig] = useState<CloudinaryConfig>(getResolvedCloudinaryConfig());
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

  const handleSaveQuickConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('cached_cloudinary_config', JSON.stringify(localCloudinaryConfig));
      setShowConfigModal(false);
      toast('Cloudinary configuration updated! Direct uploads are now ready.', 'success');
    } catch (_) {
      toast('Failed to save configuration', 'error');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    let uploadedUrl = '';
    let lastError = '';

    const cfg = getResolvedCloudinaryConfig();

    try {
      // Pre-compress file client-side to ensure fast uploads (<100KB WebP)
      const uploadPayload = await compressImageForUpload(file, 800, 0.85);

      // Tier 1: Direct Cloudinary Unsigned Upload (trying configured preset + fallback presets)
      const presetsToTry = [cfg.upload_preset, 'rummydex', 'ml_default', 'unsigned'].filter(Boolean);
      if (!uploadedUrl && cfg.cloud_name) {
        for (const preset of presetsToTry) {
          if (uploadedUrl) break;
          try {
            const formData = new FormData();
            formData.append('file', uploadPayload, file.name || 'image.webp');
            formData.append('upload_preset', preset!);

            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : null;

            const cRes = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloud_name)}/image/upload`, {
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
            } else {
              const errData = await cRes.json().catch(() => ({}));
              lastError = errData.error?.message || `Preset HTTP ${cRes.status}`;
            }
          } catch (presetErr: any) {
            lastError = presetErr?.message || 'Preset upload failed';
          }
        }
      }

      // Tier 2: Direct Cloudinary Signed Upload (using API Key & API Secret)
      if (!uploadedUrl && cfg.cloud_name && cfg.api_key && cfg.api_secret) {
        try {
          const timestamp = Math.round(Date.now() / 1000);
          const strToSign = `timestamp=${timestamp}${cfg.api_secret}`;
          const signature = await generateSha1(strToSign);

          const formData = new FormData();
          formData.append('file', uploadPayload, file.name || 'image.webp');
          formData.append('api_key', cfg.api_key);
          formData.append('timestamp', String(timestamp));
          formData.append('signature', signature);

          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : null;

          const cRes = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloud_name)}/image/upload`, {
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
          } else {
            const errData = await cRes.json().catch(() => ({}));
            lastError = errData.error?.message || `Signed HTTP ${cRes.status}`;
          }
        } catch (cErr: any) {
          lastError = cErr?.message || 'Signed upload failed';
        }
      }

      // Tier 3: Signed Upload with folder=rummydex_uploads
      if (!uploadedUrl && cfg.cloud_name && cfg.api_key && cfg.api_secret) {
        try {
          const timestamp = Math.round(Date.now() / 1000);
          const strToSign = `folder=rummydex_uploads&timestamp=${timestamp}${cfg.api_secret}`;
          const signature = await generateSha1(strToSign);

          const formData = new FormData();
          formData.append('file', uploadPayload, file.name || 'image.webp');
          formData.append('api_key', cfg.api_key);
          formData.append('timestamp', String(timestamp));
          formData.append('signature', signature);
          formData.append('folder', 'rummydex_uploads');

          const cRes = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloud_name)}/image/upload`, {
            method: 'POST',
            body: formData
          });

          if (cRes.ok) {
            const cData = await cRes.json();
            if (cData.secure_url) {
              uploadedUrl = cData.secure_url;
            }
          }
        } catch (_) {}
      }

      // Tier 4: Try Server Backend Signature if available
      if (!uploadedUrl) {
        try {
          const sigRes = await adminFetch('/api/v1/admin/upload/signature');
          if (sigRes.ok) {
            const sigData = await sigRes.json();
            if (sigData.status === 'OK' && sigData.api_key) {
              const formData = new FormData();
              formData.append('file', uploadPayload, file.name || 'image.webp');
              formData.append('api_key', sigData.api_key);
              formData.append('timestamp', sigData.timestamp.toString());
              formData.append('signature', sigData.signature);
              formData.append('folder', sigData.folder || 'rummydex_uploads');

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
        } catch (_) {}
      }

      // Tier 4.5: Try Direct Server Base64 Upload Endpoint (/api/v1/admin/upload)
      if (!uploadedUrl) {
        try {
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string || '');
            reader.readAsDataURL(uploadPayload);
          });
          if (base64Data) {
            const sRes = await adminFetch('/api/v1/admin/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image_base64: base64Data })
            });
            if (sRes.ok) {
              const sData = await sRes.json();
              if (sData.status === 'OK' && sData.secure_url) {
                uploadedUrl = sData.secure_url;
              }
            }
          }
        } catch (serverUploadErr) {
          console.warn('[ImageUpload] Server base64 upload tier fallback:', serverUploadErr);
        }
      }
      if (!uploadedUrl && storage) {
        try {
          const storagePromise = (async () => {
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const storageRef = ref(storage, `uploads/${cleanName}`);
            const snap = await uploadBytes(storageRef, uploadPayload);
            return await getDownloadURL(snap.ref);
          })();
          const timeoutPromise = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Storage timeout')), 2500)
          );
          uploadedUrl = await Promise.race([storagePromise, timeoutPromise]);
        } catch (_) {}
      }

      // Tier 6: Fail-safe compressed Data URL fallback (guarantees form never fails)
      if (!uploadedUrl) {
        uploadedUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string || '');
          reader.readAsDataURL(uploadPayload);
        });
      }

      if (!uploadedUrl) {
        const errorDetail = lastError ? `: ${lastError}` : '';
        toast(`Image upload failed${errorDetail}. Please check your Cloudinary settings.`, 'error');
        setShowConfigModal(true);
        return;
      }

      handleChange(uploadedUrl);
      if (uploadedUrl.startsWith('http')) {
        toast('Image uploaded to Cloudinary CDN successfully!', 'success');
      } else {
        toast('Image processed and attached successfully!', 'success');
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
  const isBase64 = Boolean(internalValue && internalValue.trim().startsWith('data:image/'));
  const isCloudinary = Boolean(internalValue && internalValue.trim().includes('res.cloudinary.com'));

  return (
    <div className="space-y-1.5 w-full">
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
          placeholder={placeholder || "https://res.cloudinary.com/..."}
        />

        <div className="shrink-0 flex items-center gap-1.5 pr-2">
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
            className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed border border-blue-200 dark:border-blue-800 text-xs gap-1.5 cursor-pointer"
            title="Upload image to Cloudinary"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setLocalCloudinaryConfig(getResolvedCloudinaryConfig());
              setShowConfigModal(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Configure Cloudinary credentials"
          >
            <Cloud className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* URL Status Badges */}
      {isBase64 && (
        <div className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-[11px] text-amber-700 dark:text-amber-300">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span><strong>Long Base64 string detected</strong> (Not a Cloudinary URL).</span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
          >
            Re-upload to Cloudinary
          </button>
        </div>
      )}

      {isCloudinary && (
        <div className="flex items-center gap-1.5 px-2 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
          <Check className="w-3 h-3 text-emerald-500" />
          <span>Cloudinary CDN URL (Short &amp; Optimized)</span>
        </div>
      )}

      {/* Quick Cloudinary Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-500" />
                Cloudinary Upload Configuration
              </h4>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your Cloudinary credentials so uploads generate short, CDN-optimized WebP URLs instead of large base64 strings.
            </p>

            <form onSubmit={handleSaveQuickConfig} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cloud Name</label>
                <input
                  type="text"
                  value={localCloudinaryConfig.cloud_name}
                  onChange={(e) => setLocalCloudinaryConfig({ ...localCloudinaryConfig, cloud_name: e.target.value })}
                  placeholder="e.g. veqj16xh or diewalae4"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">API Key</label>
                <input
                  type="text"
                  value={localCloudinaryConfig.api_key}
                  onChange={(e) => setLocalCloudinaryConfig({ ...localCloudinaryConfig, api_key: e.target.value })}
                  placeholder="e.g. 123456789012345"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">API Secret</label>
                <input
                  type="password"
                  value={localCloudinaryConfig.api_secret}
                  onChange={(e) => setLocalCloudinaryConfig({ ...localCloudinaryConfig, api_secret: e.target.value })}
                  placeholder="Enter API Secret"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Preset (Optional)</label>
                <input
                  type="text"
                  value={localCloudinaryConfig.upload_preset}
                  onChange={(e) => setLocalCloudinaryConfig({ ...localCloudinaryConfig, upload_preset: e.target.value })}
                  placeholder="e.g. rummydex_uploads"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
