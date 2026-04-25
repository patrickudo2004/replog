'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Send, ChevronLeft, Loader2, AlertTriangle } from 'lucide-react';
import FileUploader from './FileUploader';

interface TicketFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function TicketForm({ onBack, onSuccess }: TicketFormProps) {
  const [names, setNames] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null, null, null]);

  const { register, handleSubmit } = useForm();

  useEffect(() => {
    fetch('/api/form-data')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load form data');
        return res.json();
      })
      .then(data => {
        setNames(data.names || []);
        setCategories(data.ticketCategories || []);
        setIsLoadingData(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingData(false);
      });
  }, []);

  const handleFileSelect = (index: number, file: File | null) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const onSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('type', 'TICKET');
    formData.append('reporter', data.reporter || data.customReporter);
    formData.append('source', data.source);
    formData.append('category', data.category);
    formData.append('description', data.description);
    formData.append('isUrgent', data.isUrgent);
    
    images.forEach((img, i) => {
      if (img) formData.append(`image${i + 1}`, img);
    });

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        onSuccess();
      } else {
        const errorData = await res.json();
        alert(`Submission failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 glass rounded-xl">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Report Issue</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 glass p-6 rounded-[32px] border border-border premium-shadow">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted/80 ml-1">Reported By</label>
            <div className="flex flex-col gap-2">
              <select 
                {...register('reporter')}
                className="w-full p-4 rounded-2xl bg-background border border-border outline-none"
              >
                <option value="">Select if team member...</option>
                {names.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <input 
                type="text" 
                placeholder="OR type name here..."
                {...register('customReporter')}
                className="w-full p-4 rounded-2xl bg-background border border-border outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted/80 ml-1">Source Room/Area</label>
              <input 
                type="text" 
                placeholder="e.g. Map User"
                {...register('source', { required: true })}
                className="w-full p-4 rounded-2xl bg-background border border-border outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted/80 ml-1">Category</label>
              <select 
                {...register('category', { required: true })}
                className="w-full p-4 rounded-2xl bg-background border border-border outline-none"
              >
                <option value="">Select...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted/80 ml-1">Problem Description</label>
            <textarea 
              rows={3}
              placeholder="Provide as much detail as possible..."
              {...register('description', { required: true })}
              className="w-full p-4 rounded-2xl bg-background border border-border outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
             <label className="text-sm font-semibold text-muted/80 ml-1">Evidence / Screenshots</label>
             <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                  <FileUploader key={i} label="" onFileSelect={(file) => handleFileSelect(i, file)} />
                ))}
             </div>
          </div>

          <label className="flex items-center gap-3 p-4 rounded-2xl bg-urgent/5 border border-urgent/10 cursor-pointer">
            <input type="checkbox" {...register('isUrgent')} className="w-5 h-5 accent-urgent rounded-md" />
            <span className="text-sm font-bold text-urgent tracking-wide">URGENT ISSUE?</span>
            <AlertTriangle size={18} className="text-urgent ml-auto" />
          </label>
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full p-5 bg-secondary text-white rounded-[24px] font-bold premium-shadow flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          <span>{isSubmitting ? 'Reporting...' : 'Submit Ticket'}</span>
        </button>
      </form>
    </motion.div>
  );
}
