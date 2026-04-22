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
  Bell,
  Moon,
  Sun,
  AlertTriangle,
  Trophy,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ActivityForm from './ActivityForm';
import TicketForm from './TicketForm';
import SuccessScreen from './SuccessScreen';
import ReviewModal from './ReviewModal';
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
  const [view, setView] = useState<'home' | 'activity-form' | 'ticket-form' | 'success' | 'history'>('home');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending-logs' | 'open-tickets'>('all');
  const [selectedItemForReview, setSelectedItemForReview] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    } else {
      // Default to dark
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard');
      setStats(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setSelectedItemForReview(null);
    fetchDashboardData();
  };

  const handleCardClick = (filter: 'pending-logs' | 'open-tickets') => {
    setHistoryFilter(filter);
    setView('history');
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
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-full bg-card glass border border-border flex items-center justify-center text-foreground transition-transform active:scale-95"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                    <img src="https://lh3.googleusercontent.com/d/1PnzuJKAgogeB4JMUPBLGEQZECTQk8BUh" alt="Logo" className="w-8 h-8 object-contain" />
                  </div>
                  {(stats?.pendingLogs > 0 || stats?.openTickets > 0) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-background animate-pulse font-bold">
                      !
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-urgent/10 border border-urgent/20 rounded-2xl flex items-center gap-3 text-urgent">
                <AlertTriangle size={20} />
                <div className="flex-1">
                  <p className="text-xs font-bold leading-tight">Connection Issue</p>
                  <p className="text-[10px] opacity-80">{error.includes('GOOGLE_AUTH_FAILED') ? 'Setup Required: Missing Google Credentials in Vercel.' : error}</p>
                </div>
                <button onClick={fetchDashboardData} className="px-3 py-1 bg-urgent text-white text-[10px] font-bold rounded-lg shrink-0">Retry</button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatCard 
                title="Awaiting Review" 
                value={isLoading ? '...' : stats?.pendingLogs ?? 0} 
                subtitle="Team activity"
                color="primary"
                icon={<ClipboardList size={22} />}
                onClick={() => handleCardClick('pending-logs')}
              />
              <StatCard 
                title="Open Tickets" 
                value={isLoading ? '...' : stats?.openTickets ?? 0} 
                subtitle="Issue reports"
                color="secondary"
                icon={<AlertCircle size={22} />}
                onClick={() => handleCardClick('open-tickets')}
              />
              <StatCard 
                title="Logs (Week)" 
                value={isLoading ? '...' : stats?.logsThisWeek ?? 0} 
                subtitle="Past 7 days"
                color="success"
                icon={<CheckCircle2 size={22} />}
              />
              <StatCard 
                title="Active Members" 
                value={isLoading ? '...' : stats?.activeMembers ?? 0} 
                subtitle="Recent contributors"
                color="urgent"
                icon={<Users size={22} />}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={() => handleCardClick('pending-logs')}
                  className="p-4 bg-primary/10 text-primary rounded-[24px] font-bold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <ClipboardList size={18} /> Review Activities
                </button>
                <button 
                  onClick={() => handleCardClick('open-tickets')}
                  className="p-4 bg-secondary/10 text-secondary rounded-[24px] font-bold text-sm hover:bg-secondary/20 transition-all flex items-center justify-center gap-2"
                >
                  <AlertCircle size={18} /> Resolve Tickets
                </button>
              </div>

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

            {/* Leaderboard */}
            {!isLoading && stats?.leaderboard && stats.leaderboard.length > 0 && (
              <div className="mb-8 p-6 bg-white/40 glass rounded-[32px] border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={20} className="text-[#FFD700]" />
                  <h3 className="font-bold">Monthly Leaderboard</h3>
                </div>
                <div className="space-y-3">
                  {stats.leaderboard.map((user: any, index: number) => (
                    <div key={user.name} className="flex justify-between items-center bg-white/50 p-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted/50 w-4 text-center">{index + 1}</span>
                        <span className="font-bold text-sm">{user.name}</span>
                      </div>
                      <span className="text-xs font-bold bg-success/10 text-success px-2 py-1 rounded-lg">{user.count} logs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Feed */}
            <div>
              <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   Live Feed 
                   <div className="w-2 h-2 rounded-full bg-success animate-ping" />
                </h2>
                <span onClick={() => { setView('history'); setHistoryFilter('all'); }} className="text-xs font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline">View All</span>
              </div>
              
              <div className="space-y-4">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-20 w-full animate-pulse bg-white/40 glass rounded-3xl" />
                  ))
                ) : (stats?.feed && Array.isArray(stats.feed) && stats.feed.length > 0) ? (
                  stats.feed.slice(0, 5).map((item: any) => (
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

        {view === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-end mb-8">
              <div className="flex items-center gap-4">
                 <button onClick={() => { setView('home'); setHistoryFilter('all'); }} className="p-2 bg-white/50 glass rounded-xl">
                    <ChevronRight size={24} className="rotate-180" />
                 </button>
                 <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                       {historyFilter === 'pending-logs' ? 'Pending Review' : historyFilter === 'open-tickets' ? 'Open Tickets' : 'History'}
                    </h1>
                    <p className="text-sm text-muted">
                       {historyFilter === 'all' ? 'Comprehensive activity log' : `Viewing items requiring attention`}
                    </p>
                 </div>
              </div>
              {historyFilter !== 'all' && (
                <button 
                  onClick={() => setHistoryFilter('all')}
                  className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all"
                >
                   Show All
                </button>
              )}
            </div>

            <div className="space-y-4">
               {stats?.feed?.filter((item: any) => {
                 if (historyFilter === 'pending-logs') return item.type === 'LOG' && item.status.toLowerCase() === 'pending';
                 if (historyFilter === 'open-tickets') return item.type === 'TICKET' && item.status.toLowerCase() === 'pending';
                 return true;
               }).length > 0 ? (
                 stats.feed
                  .filter((item: any) => {
                    if (historyFilter === 'pending-logs') return item.type === 'LOG' && item.status.toLowerCase() === 'pending';
                    if (historyFilter === 'open-tickets') return item.type === 'TICKET' && item.status.toLowerCase() === 'pending';
                    return true;
                  })
                  .map((item: any) => (
                   <div key={item.id} className="flex flex-col gap-4 p-5 bg-white/40 glass rounded-[32px] border border-border">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                          item.type === 'LOG' ? "bg-success/10 text-success" : "bg-urgent/10 text-urgent"
                        )}>
                          {item.type === 'LOG' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="text-[15px] font-bold truncate text-foreground">{item.title}</h4>
                              <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                                 {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                           </div>
                           <p className="text-[11px] text-muted flex items-center gap-1">
                              <span className="font-bold text-muted/80">{item.user}</span> 
                              <span>•</span>
                              <span className="truncate">{item.type === 'LOG' ? 'System updated' : 'Issue reported'}</span>
                           </p>
                        </div>
                      </div>

                      {item.status.toLowerCase() === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => setSelectedItemForReview(item)}
                            className="flex-1 py-3 bg-foreground text-background rounded-2xl text-[11px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                          >
                             {item.type === 'LOG' ? 'Confirm Activity' : 'Resolve Ticket'}
                          </button>
                        </div>
                      )}
                   </div>
                 ))
               ) : (
                 <div className="text-center p-20 bg-white/10 glass rounded-[40px] border border-dashed border-border">
                    <p className="text-sm text-muted">No items found matching the filter.</p>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <motion.div 
        initial={{ y: 100 }} animate={{ y: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-20 bg-background rounded-[40px] premium-shadow border border-border p-2 flex items-center justify-around z-50 overflow-hidden"
      >
          <button 
            onClick={() => { setView('home'); setHistoryFilter('all'); }}
            className={cn("flex flex-col items-center gap-1.5 p-3 transition-colors relative z-10 w-[45%]", (view === 'home' || view === 'activity-form' || view === 'ticket-form' || view === 'success') ? "text-primary" : "text-muted/40")}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold tracking-tight">Home</span>
          </button>
          
          <button 
            onClick={() => { setView('history'); setHistoryFilter('all'); }}
            className={cn("flex flex-col items-center gap-1.5 p-3 transition-colors relative z-10 w-[45%]", view === 'history' ? "text-primary" : "text-muted/40")}
          >
            <Clock size={24} />
            <span className="text-[10px] font-bold tracking-tight">History</span>
          </button>
          
          {/* Sliding Indicator Background */}
          <motion.div 
            layoutId="nav-bg"
            className="absolute top-2 bottom-2 w-[45%] bg-primary/5 rounded-[32px] border border-primary/10"
            animate={{
              x: (view === 'home' || view === 'activity-form' || view === 'ticket-form' || view === 'success') ? '-50%' : '50%'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-12 h-1 bg-primary/20 rounded-b-full" />
      </motion.div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedItemForReview && (
          <ReviewModal 
            item={selectedItemForReview} 
            onClose={() => setSelectedItemForReview(null)} 
            onSuccess={handleReviewSuccess} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
