import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Check, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { ImageUploadService } from '../services/imageService';

interface ImageUploaderProps {
  onImageSelected: (url: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onImageSelected, currentImage }: ImageUploaderProps) {
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [isValidImage, setIsValidImage] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsValidImage(true);
    setError('');
    try {
      const url = await ImageUploadService.uploadToImgBB(file);
      setImageUrl(url);
      onImageSelected(url);
    } catch (err) {
      setError('Upload failed. Try again or use a link.');
    } finally {
      setIsUploading(false);
    }
  };

  const validateUrl = (url: string) => {
    return url.startsWith('http') && (url.includes('.jpg') || url.includes('.png') || url.includes('.webp') || url.includes('.jpeg') || url.includes('images.unsplash.com') || url.includes('i.ibb.co'));
  };

  const handleLinkChange = (val: string) => {
    setImageUrl(val);
    if (!val) {
      setIsValidImage(true);
      onImageSelected('');
      return;
    }
    
    if (validateUrl(val)) {
      setIsValidImage(true);
      onImageSelected(val);
    } else {
      setIsValidImage(false);
    }
  };

  const handleLinkSubmit = () => {
    if (imageUrl) {
      onImageSelected(imageUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
            uploadMode === 'file' ? 'bg-primary text-background border-primary' : 'bg-surface/50 border-white/5 text-cream/40'
          }`}
        >
          <Upload className="w-4 h-4" /> File
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('link')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
            uploadMode === 'link' ? 'bg-primary text-background border-primary' : 'bg-surface/50 border-white/5 text-cream/40'
          }`}
        >
          <LinkIcon className="w-4 h-4" /> Link
        </button>
      </div>

      {uploadMode === 'file' ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-surface/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
        >
          {imageUrl && isValidImage ? (
            <img 
              src={imageUrl} 
              alt="preview" 
              className="absolute inset-0 w-full h-full object-cover" 
              onError={() => setIsValidImage(false)}
            />
          ) : (
            <>
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-cream/20 mb-2" />
                  <p className="text-xs text-cream/40 px-6 text-center">Click to upload product image to ImgBB</p>
                </>
              )}
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              placeholder="Paste Image URL directly"
              value={imageUrl}
              onChange={(e) => handleLinkChange(e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-surface/50 border border-white/5 rounded-2xl focus:border-primary/50 transition-all outline-none text-cream text-sm"
            />
            {imageUrl && isValidImage && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
          {imageUrl && isValidImage && (
            <div className="aspect-video rounded-2xl bg-surface/30 border border-white/5 overflow-hidden">
               <img 
                src={imageUrl} 
                alt="preview" 
                className="w-full h-full object-cover" 
                onError={() => setIsValidImage(false)}
              />
            </div>
          )}
          {!isValidImage && imageUrl && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <p className="text-xs font-bold">Invalid image URL or image not found</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
