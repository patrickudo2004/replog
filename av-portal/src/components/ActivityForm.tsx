'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import FileUploader from './FileUploader';
import { cn } from '@/lib/utils';

interface ActivityFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function ActivityForm({ onBack, onSuccess }: ActivityFormProps) {
  const [names, setNames] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetch('/api/form-data')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load form data');
        return res.json();
      })
      .then(data => {
        setNames(data.names || []);
        setCategories(data.activityCategories || []);
        setIsLoadingData(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingData(false);
      });
  }, []);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('type', 'LOG');
    formData.append('worker', data.worker);
    formData.append('date', data.date);
    formData.append('category', data.category);
    formData.append('activityName', data.activityName);
    formData.append('implementationNotes', data.implementationNotes);
    formData.append('isUrgent', data.isUrgent);
    if (screenshot) formData.append('screenshot', screenshot);

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
      console.error(error);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-semibold text-muted">Loading directory...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 glass rounded-xl">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">New Activity Log</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 glass p-6 rounded-[32px] border border-border premium-shadow">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted/80 ml-1">Activity Date</label>
            <input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              {...register('date', { required: true })}
              className="w-full p-4 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-muted/80 ml-1">Who did this?</label>
              <select 
                {...register('worker', { required: true })}
                className="w-full p-4 rounded-2xl bg-background border border-border outline-none"
              >
                <option value="">Select...</option>
                {names.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
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
            <label className="text-sm font-semibold text-muted/80 ml-1">What was the task?</label>
            <input 
              type="text" 
              placeholder="e.g., Update Service Flyer"
              {...register('activityName', { required: true })}
              className="w-full p-4 rounded-2xl bg-background border border-border outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-muted/80 ml-1">Notes</label>
            <textarea 
              rows={3}
              placeholder="Briefly describe what you did..."
              {...register('implementationNotes', { required: true })}
              className="w-full p-4 rounded-2xl bg-background border border-border outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <FileUploader onFileSelect={setScreenshot} />

          <label className="flex items-center gap-3 p-4 rounded-2xl bg-urgent/5 border border-urgent/10 cursor-pointer">
            <input type="checkbox" {...register('isUrgent')} className="w-5 h-5 accent-urgent rounded-md" />
            <span className="text-sm font-bold text-urgent tracking-wide">MARK AS URGENT?</span>
          </label>
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full p-5 bg-primary text-white rounded-[24px] font-bold premium-shadow flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          <span>{isSubmitting ? 'Logging Service...' : 'Submit Log'}</span>
        </button>
      </form>
    </motion.div>
  );
}
