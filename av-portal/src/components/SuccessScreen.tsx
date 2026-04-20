'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface SuccessScreenProps {
  onBack: () => void;
}

export default function SuccessScreen({ onBack }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center text-success mb-6"
      >
        <CheckCircle2 size={48} />
      </motion.div>
      
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-2"
      >
        Submission Successful!
      </motion.h2>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted mb-10"
      >
        Your data has been logged to the technical spreadsheet and images saved securely in Drive.
      </motion.p>
      
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onBack}
        className="w-full max-w-xs p-5 bg-secondary text-white rounded-[24px] font-bold premium-shadow active:scale-[0.98] transition-transform"
      >
        Back to Dashboard
      </motion.button>
    </div>
  );
}
