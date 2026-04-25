/**
 * Winners Chapel Manchester - AV Technical Portal
 * Centralized Type Definitions
 */

export interface ActivityLog {
  id: string;
  type: 'LOG';
  title: string;
  user: string;
  timestamp: number;
  status: string;
  isUrgent: boolean;
  imageUrl?: string;
}

export interface IssueTicket {
  id: string;
  type: 'TICKET';
  title: string;
  user: string;
  timestamp: number;
  status: string;
  isUrgent: boolean;
  imageUrl?: string;
}

export type FeedItem = ActivityLog | IssueTicket;

export interface LeaderboardEntry {
  name: string;
  count: number;
}

export interface DashboardStats {
  pendingLogs: number;
  openTickets: number;
  logsThisWeek: number;
  activeMembers: number;
  leaderboard: LeaderboardEntry[];
  feed: FeedItem[];
}

export interface FormDataResponse {
  names: string[];
  activityCategories: string[];
  ticketCategories: string[];
}
