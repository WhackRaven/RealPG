import { supabase } from './auth';

export interface CloudFriend {
  id: string;
  user_id: string;
  friend_id: string;
  friend_nickname: string;
  friend_level: number;
  friend_quests: number;
  friend_streak: number;
  friend_title: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  level: number;
  xp?: number;
  coins?: number;
  quests_completed: number;
  streak: number;
  title: string;
  invite_code: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  level: number;
  quests_completed: number;
  streak: number;
  title: string;
  isCurrentUser?: boolean;
}

export const cloudService = {
  async getMyProfile(): Promise<UserProfile | null> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) return null;
      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
      if (error) return null;
      return data as UserProfile;
    } catch (err) {
      console.error('getMyProfile error:', err);
      return null;
    }
  },

  async getOrCreateProfile(_userId: string, nickname: string): Promise<UserProfile | null> {
    try {
      const { data: created, error } = await supabase.rpc('ensure_profile', {
        p_nickname: nickname || 'Held',
      });

      if (error) {
        console.warn('ensure_profile rpc error:', error);
      }

      // fetch current user's profile
      const { data } = await supabase.from('user_profiles').select('*').single();
      const profile = data as UserProfile | null;
      if (profile && !profile.invite_code) {
        await this.generateInviteCode();
        const { data: refreshed } = await supabase.from('user_profiles').select('*').single();
        return refreshed as UserProfile | null;
      }
      return profile;
    } catch (err) {
      console.error('getOrCreateProfile error:', err);
      return null;
    }
  },

  async updateProfile(userId: string, stats: { level: number; xp?: number; coins?: number; quests_completed: number; streak: number; title: string; nickname?: string }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...stats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  },

  async getProfileByCode(inviteCode: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (error) {
        console.error('getProfileByCode error:', error);
        return null;
      }
      return data as UserProfile | null;
    } catch {
      return null;
    }
  },

  async sendFriendRequestByCode(inviteCode: string): Promise<boolean> {
    try {
      // Try RPC first (if DB has the function)
      const { error } = await supabase.rpc('send_friend_request', {
        p_invite_code: inviteCode.toUpperCase(),
      });
      if (!error) return true;
      console.warn('send_friend_request rpc error, falling back:', error);
    } catch (rpcErr) {
      console.warn('RPC send_friend_request not available, falling back', rpcErr);
    }

    // Fallback: insert into friend_requests directly
    try {
      const { data: authData } = await supabase.auth.getUser();
      const fromUserId = authData?.user?.id;
      if (!fromUserId) return false;

      const target = await this.getProfileByCode(inviteCode);
      if (!target) return false;
      if (target.id === fromUserId) return false;

      // prevent duplicate pending requests
      const { data: existing } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', target.id)
        .eq('status', 'pending')
        .limit(1)
        .single();

      if (existing) return false;

      const { error: insErr } = await supabase.from('friend_requests').insert({
        from_user_id: fromUserId,
        to_user_id: target.id,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (insErr) {
        console.error('Fallback insert friend_request failed:', insErr);
        return false;
      }

      // Optionally notify
      await this.notifyFriendRequest(target.id, fromUserId);
      return true;
    } catch (error) {
      console.error('Send friend request fallback error:', error);
      return false;
    }
  },

  async acceptFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('accept_friend_request', { p_request_id: requestId });
      return !error;
    } catch (error) {
      console.error('Accept friend error:', error);
      return false;
    }
  },

  async declineFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);
      return !error;
    } catch (error) {
      console.error('Decline friend error:', error);
      return false;
    }
  },

  async getFriends(userId: string): Promise<CloudFriend[]> {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('friend_user_id, created_at')
        .eq('user_id', userId);

      if (error) return [];

      const friendIds = data?.map((f: any) => f.friend_user_id) || [];
      if (friendIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', friendIds);

      return profiles?.map((p: any) => ({
        id: p.id,
        user_id: userId,
        friend_id: p.id,
        friend_nickname: p.nickname,
        friend_level: p.level,
        friend_quests: p.quests_completed,
        friend_streak: p.streak,
        friend_title: p.title,
        status: 'accepted' as const,
        created_at: data?.find((f: any) => f.friend_user_id === p.id)?.created_at ?? new Date().toISOString(),
      })) || [];
    } catch (error) {
      console.error('Get friends error:', error);
      return [];
    }
  },

  async getPendingRequests(userId: string): Promise<CloudFriend[]> {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('id, from_user_id, created_at')
        .eq('to_user_id', userId)
        .eq('status', 'pending');

      if (error) return [];
      const requesterIds = (data || []).map((entry: any) => entry.from_user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, nickname, level, quests_completed, streak, title')
        .in('id', requesterIds);

      const byId = new Map((profiles || []).map((p: any) => [p.id, p]));
      return (data || []).map((entry: any) => {
        const p = byId.get(entry.from_user_id);
        return {
          id: entry.id,
          user_id: entry.from_user_id,
          friend_id: userId,
          friend_nickname: p?.nickname ?? 'Unbekannt',
          friend_level: p?.level ?? 1,
          friend_quests: p?.quests_completed ?? 0,
          friend_streak: p?.streak ?? 0,
          friend_title: p?.title ?? 'Anfänger',
          status: 'pending' as const,
          created_at: entry.created_at,
        };
      });
    } catch (error) {
      console.error('Get requests error:', error);
      return [];
    }
  },

  async getLeaderboard(userId: string): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(20);

      if (error) return [];

      return data?.map((p: any, index) => ({
        rank: index + 1,
        nickname: p.nickname,
        level: p.level,
        quests_completed: p.quests_completed,
        streak: p.streak,
        title: p.title,
        isCurrentUser: p.id === userId,
      })) || [];
    } catch (error) {
      console.error('Leaderboard error:', error);
      return [];
    }
  },

  async generateInviteCode(): Promise<string | null> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) return null;

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for (let attempt = 0; attempt < 6; attempt++) {
        let code = '';
        for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        code = code.toUpperCase();

        // ensure unique
        const { data: exists } = await supabase.from('user_profiles').select('id').eq('invite_code', code).limit(1).single();
        if (exists) continue;

        const { error } = await supabase.from('user_profiles').update({ invite_code: code, updated_at: new Date().toISOString() }).eq('id', userId);
        if (!error) return code;
      }
      return null;
    } catch (error) {
      console.error('generateInviteCode error:', error);
      return null;
    }
  },

  async notifyFriendRequest(userId: string, fromUserId: string) {
    console.log('Notification: Friend request from', fromUserId, 'to', userId);
  },

  subscribeToFriendUpdates(userId: string, callback: (friends: CloudFriend[]) => void) {
    const channel = supabase
      .channel('friends')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friend_requests',
        filter: `to_user_id=eq.${userId}`,
      }, async () => {
        callback(await this.getFriends(userId));
      });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};