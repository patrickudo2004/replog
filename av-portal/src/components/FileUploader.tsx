'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ImageIcon, Loader2 } from 'lucide-react';
import { convertHeicToJpeg } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  label?: string;
}

export default function FileUploader({ onFileSelect, label = "Upload Screenshot" }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    const processedFile = await convertHeicToJpeg(file);
    setIsConverting(false);

    onFileSelect(processedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(processedFile);
  };

  const removeFile = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-muted/80">{label}</label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative h-40 w-full rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition-colors overflow-hidden bg-white/30 glass"
      >
        <AnimatePresence mode="wait">
          {isConverting ? (
            <motion.div 
              key="converting"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs font-bold text-primary animate-pulse uppercase tracking-wider">Optimizing iPhone Photo...</p>
            </motion.div>
          ) : preview ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-md"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted"
            >
              <Camera size={28} opacity={0.5} />
              <p className="text-xs font-semibold">Tap to capture or upload</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*,.heic,.heif" 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </div>
  );
}
