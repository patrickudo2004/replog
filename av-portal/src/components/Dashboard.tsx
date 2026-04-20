'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ChevronRight,
  Loader2,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ActivityForm from './ActivityForm';
import TicketForm from './TicketForm';
import SuccessScreen from './SuccessScreen';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  onClick?: () => void;
  color: 'primary' | 'secondary' | 'success' | 'urgent';
}

const StatCard = ({ title, value, subtitle, icon, onClick, color }: StatCardProps) => (
  <motion.div 
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-card glass premium-shadow p-5 rounded-3xl border border-border cursor-pointer transition-all hover:bg-white/50"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn(
        "p-3 rounded-2xl",
        color === 'primary' && "bg-primary/10 text-primary",
        color === 'secondary' && "bg-secondary/10 text-secondary",
        color === 'success' && "bg-success/10 text-success",
        color === 'urgent' && "bg-urgent/10 text-urgent",
      )}>
        {icon}
      </div>
    </div>
    <div className="mb-1">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted/60">{title}</h3>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
    <p className="text-[10px] text-muted">{subtitle}</p>
  </motion.div>
);

export default function Dashboard() {
  const [view, setView] = useState<'home' | 'activity-form' | 'ticket-form' | 'success'>('home');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'home') fetchDashboardData();
  }, [view]);

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-32 min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Technical Portal</h1>
                <p className="text-sm text-muted">Winners Chapel Manchester</p>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                   <img src="https://lh3.googleusercontent.com/d/1PnzuJKAgogeB4JMUPBLGEQZECTQk8BUh" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                {stats?.pendingLogs > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-background animate-pulse font-bold">
                    !
                  </span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatCard 
                title="Awaiting Review" 
                value={isLoading ? '...' : stats?.pendingLogs ?? 0} 
                subtitle="Team activity"
                color="primary"
                icon={<ClipboardList size={22} />}
              />
              <StatCard 
                title="Open Tickets" 
                value={isLoading ? '...' : stats?.openTickets ?? 0} 
                subtitle="Issue reports"
                color="secondary"
                icon={<AlertCircle size={22} />}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-12">
              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('activity-form')}
                className="flex items-center justify-between p-6 bg-primary text-white rounded-[32px] premium-shadow font-bold group"
              >
                <div className="flex items-center gap-4">
                  <PlusCircle size={28} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-lg">Log New Activity</span>
                </div>
                <ChevronRight size={20} className="opacity-40" />
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('ticket-form')}
                className="flex items-center justify-between p-6 bg-secondary text-white rounded-[32px] premium-shadow font-bold"
              >
                <div className="flex items-center gap-4">
                  <Bell size={28} />
                  <span className="text-lg">Report Issue</span>
                </div>
                <ChevronRight size={20} className="opacity-40" />
              </motion.button>
            </div>

            {/* Recent Feed */}
            <div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   Live Feed 
                   <div className="w-2 h-2 rounded-full bg-success animate-ping" />
                </h2>
                <span className="text-xs font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline">History</span>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-20 w-full animate-pulse bg-white/40 glass rounded-3xl" />
                  ))
                ) : stats?.feed?.length > 0 ? (
                  stats.feed.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-white/40 glass rounded-3xl border border-border group hover:bg-white/60 transition-all">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                        item.type === 'LOG' ? "bg-success/10 text-success" : "bg-urgent/10 text-urgent"
                      )}>
                        {item.type === 'LOG' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[15px] font-bold truncate text-foreground pr-2">{item.title}</h4>
                        <p className="text-[11px] text-muted flex items-center gap-1">
                           <span className="font-bold text-muted/80">{item.user}</span> 
                           <span>•</span>
                           <span>{item.type === 'LOG' ? 'Updated the system' : 'Reported issue'}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 pt-1">
                         <span className={cn(
                           "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                           item.status === 'Pending' ? "bg-pending/10 text-pending" : "bg-success/10 text-success"
                         )}>
                            {item.status}
                         </span>
                         {item.isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-urgent animate-pulse" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-10 bg-white/20 glass rounded-3xl">
                     <p className="text-sm text-muted">No recent activities found.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'activity-form' && (
          <ActivityForm 
            key="activity" 
            onBack={() => setView('home')} 
            onSuccess={() => setView('success')} 
          />
        )}

        {view === 'ticket-form' && (
          <TicketForm 
            key="ticket" 
            onBack={() => setView('home')} 
            onSuccess={() => setView('success')} 
          />
        )}

        {view === 'success' && (
          <SuccessScreen 
            key="success" 
            onBack={() => setView('home')} 
          />
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-20 glass rounded-[40px] premium-shadow border border-white/30 p-2 flex items-center justify-around z-50 overflow-hidden"
      >
          <button className={cn("flex flex-col items-center gap-1.5 p-3 transition-colors", view === 'home' ? "text-primary" : "text-muted/40")}>
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 p-3 text-muted/40 transition-colors">
            <Search size={24} />
            <span className="text-[10px] font-bold tracking-tight">Explore</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 p-3 text-muted/40 transition-colors">
            <Clock size={24} />
            <span className="text-[10px] font-bold tracking-tight">History</span>
          </button>
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-12 h-1 bg-primary/20 rounded-b-full" />
      </motion.div>
    </div>
  );
}
