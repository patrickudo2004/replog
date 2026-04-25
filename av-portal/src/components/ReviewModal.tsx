'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Loader2 } from 'lucide-react';
import { FeedItem } from '@/types';
import FileUploader from './FileUploader';

interface ReviewModalProps {
  item: FeedItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ item, onClose, onSuccess }: ReviewModalProps) {
  const [names, setNames] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resImage, setResImage] = useState<File | null>(null);

  const { register, handleSubmit, watch } = useForm();
  
  const selectedName = watch(item.type === 'LOG' ? 'verifier' : 'resolver');
  const isSelfReview = selectedName === item.user;

  useEffect(() => {
    fetch('/api/form-data')
      .then(res => res.json())
      .then(data => {
        setNames(data.names || []);
        setIsLoadingData(false);
      });
  }, []);

  const onSubmit = async (data: Record<string, string>) => {
    if (isSelfReview) return;
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('id', item.id);
    formData.append('type', item.type);
    formData.append('newStatus', item.type === 'LOG' ? 'Confirmed' : 'Resolved');
    
    if (item.type === 'LOG') {
      formData.append('verifier', data.verifier);
      formData.append('remark', data.remark || '');
    } else {
      formData.append('resolver', data.resolver);
      formData.append('resNotes', data.resNotes || '');
      if (resImage) formData.append('resImage', resImage);
    }

    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        onSuccess();
      } else {
        const err: { error?: string } = await res.json();
        alert('Update failed: ' + (err.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-md rounded-[32px] border border-border premium-shadow overflow-hidden relative"
        >
          <div className="p-6">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-muted/10 rounded-full hover:bg-muted/20 transition">
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-1">{item.type === 'LOG' ? 'Confirm Activity' : 'Resolve Ticket'}</h2>
            <p className="text-sm text-muted mb-4 pr-8">Reviewing <span className="font-semibold text-foreground">{item.title}</span> by {item.user}</p>
            
            {item.imageUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-border bg-muted/20">
                <img 
                  src={item.imageUrl} 
                  alt="Proof" 
                  className="w-full h-40 object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(item.imageUrl, '_blank')}
                />
              </div>
            )}
            
            {isLoadingData ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-muted/80 ml-1">
                    {item.type === 'LOG' ? 'Verified By' : 'Resolved By'}
                  </label>
                  <select 
                    {...register(item.type === 'LOG' ? 'verifier' : 'resolver', { required: true })}
                    className="w-full p-4 rounded-2xl bg-white/5 dark:bg-white/5 border border-border outline-none transition-all focus:border-primary"
                  >
                    <option value="">Select your name...</option>
                    {names.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                  {isSelfReview && (
                    <p className="text-[11px] text-urgent font-bold mt-2 ml-1 p-2 bg-urgent/10 rounded-xl">
                      Security Policy: You cannot {item.type === 'LOG' ? 'confirm' : 'resolve'} your own {item.type === 'LOG' ? 'activity' : 'ticket'}.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-muted/80 ml-1">
                    {item.type === 'LOG' ? 'Verification Remarks' : 'Resolution Notes'}
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Any notes?"
                    {...register(item.type === 'LOG' ? 'remark' : 'resNotes')}
                    className="w-full p-4 rounded-2xl bg-white/5 dark:bg-white/5 border border-border outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                {item.type === 'TICKET' && (
                  <div className="pt-2">
                    <label className="text-sm font-semibold text-muted/80 ml-1 mb-1.5 block">Proof Image (Optional)</label>
                    <FileUploader onFileSelect={setResImage} />
                  </div>
                )}

                <button 
                  disabled={isSubmitting || isSelfReview}
                  type="submit" 
                  className="w-full mt-4 p-4 bg-foreground text-background rounded-[24px] font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  <span>{isSubmitting ? 'Updating...' : 'Submit'}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
  );
}
