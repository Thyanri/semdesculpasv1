import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc, writeBatch, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { UserProfile, UserEvent, Friendship, LeaderboardEntry } from '../domain/models';
import { repository } from '../data/store';

class SyncService {
  private isOnline = navigator.onLine;
  private syncInterval: any = null;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingEvents();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    if (auth) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          this.syncPendingEvents();
          this.startPeriodicSync();
        } else {
          this.stopPeriodicSync();
        }
      });
    }
  }

  private startPeriodicSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      this.syncPendingEvents();
    }, 60000);
  }

  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingEvents() {
    if (!this.isOnline || !auth?.currentUser || !db) return;

    const pendingEvents = await repository.getPendingEvents();
    if (pendingEvents.length === 0) return;

    const batch = writeBatch(db);
    const eventsRef = collection(db, 'events');

    for (const event of pendingEvents) {
      const docRef = doc(eventsRef, event.id);
      batch.set(docRef, {
        uid: auth.currentUser!.uid,
        type: event.type,
        timestamp: event.timestamp,
        data: event.data || {}
      });
    }

    try {
      await batch.commit();
      await repository.markEventsSynced(pendingEvents.map(e => e.id));
    } catch (error) {
      console.error('Failed to sync events:', error);
    }
  }

  async logEvent(type: UserEvent['type'], data?: any) {
    const event: UserEvent = {
      id: crypto.randomUUID(),
      uid: auth?.currentUser?.uid || 'local',
      type,
      timestamp: new Date().toISOString(),
      data,
      synced: false
    };

    await repository.saveEvent(event);
    this.syncPendingEvents();
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.isOnline || !db) {
      if (uid === 'local' || uid === auth?.currentUser?.uid) {
        return {
          uid: 'local',
          handle: 'offline_user',
          displayName: 'You (Offline)',
          photoURL: '',
          privacy: 'public',
          metrics: { streak: 1, activeDays7d: 1, starts7d: 5, facedDelays7d: 0, deepMinutes7d: 25 },
          friends: ['mock-1', 'mock-2'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return {
        uid,
        handle: `user_${uid}`,
        displayName: 'Offline Friend',
        photoURL: '',
        privacy: 'public',
        metrics: { streak: 2, activeDays7d: 2, starts7d: 10, facedDelays7d: 1, deepMinutes7d: 50 },
        friends: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (e) {
      console.error("Error fetching user profile:", e);
      return null;
    }
  }

  async getProfileByHandle(handle: string): Promise<UserProfile | null> {
    if (!this.isOnline || !db) return null;
    try {
      const q = query(collection(db, 'users'), where('handle', '==', handle));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as UserProfile;
      }
      return null;
    } catch (e) {
      console.error("Error fetching user by handle:", e);
      return null;
    }
  }

  async updateProfile(updates: Partial<UserProfile>) {
    if (!this.isOnline || !auth?.currentUser || !db) return;
    const docRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async createProfile(handle: string, displayName: string) {
    if (!this.isOnline || !auth?.currentUser || !db) return;
    const docRef = doc(db, 'users', auth.currentUser.uid);
    const profile: UserProfile = {
      uid: auth.currentUser.uid,
      handle,
      displayName,
      photoURL: auth.currentUser.photoURL || '',
      privacy: 'private',
      metrics: {
        streak: 0,
        activeDays7d: 0,
        starts7d: 0,
        facedDelays7d: 0,
        deepMinutes7d: 0
      },
      friends: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, profile);
    return profile;
  }

  async sendFriendRequest(targetHandle: string) {
    if (!this.isOnline || !auth?.currentUser || !db) throw new Error("Offline or not logged in");
    
    const targetProfile = await this.getProfileByHandle(targetHandle);
    if (!targetProfile) throw new Error("User not found");
    if (targetProfile.uid === auth.currentUser.uid) throw new Error("Cannot add yourself");

    const q1 = query(collection(db, 'friendships'), where('user1Id', '==', auth.currentUser.uid), where('user2Id', '==', targetProfile.uid));
    const q2 = query(collection(db, 'friendships'), where('user1Id', '==', targetProfile.uid), where('user2Id', '==', auth.currentUser.uid));
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    if (!snap1.empty || !snap2.empty) {
      throw new Error("Friendship or request already exists");
    }

    const friendshipRef = doc(collection(db, 'friendships'));
    const friendship: Friendship = {
      id: friendshipRef.id,
      user1Id: auth.currentUser.uid,
      user2Id: targetProfile.uid,
      status: 'pending',
      actionUserId: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(friendshipRef, friendship);
  }

  async acceptFriendRequest(friendshipId: string, targetUid: string) {
    if (!this.isOnline || !auth?.currentUser || !db) return;
    const docRef = doc(db, 'friendships', friendshipId);
    await updateDoc(docRef, {
      status: 'accepted',
      actionUserId: auth.currentUser.uid,
      updatedAt: new Date().toISOString()
    });

    const myProfileRef = doc(db, 'users', auth.currentUser.uid);
    const targetProfileRef = doc(db, 'users', targetUid);
    
    const myProfile = await getDoc(myProfileRef);
    const targetProfile = await getDoc(targetProfileRef);

    if (myProfile.exists()) {
      const friends = myProfile.data().friends || [];
      if (!friends.includes(targetUid)) {
        await updateDoc(myProfileRef, { friends: [...friends, targetUid] });
      }
    }
    if (targetProfile.exists()) {
      const friends = targetProfile.data().friends || [];
      if (!friends.includes(auth.currentUser.uid)) {
        await updateDoc(targetProfileRef, { friends: [...friends, auth.currentUser.uid] });
      }
    }
  }

  async getFriendships(): Promise<Friendship[]> {
    if (!this.isOnline || !auth?.currentUser || !db) return [];
    try {
      const q1 = query(collection(db, 'friendships'), where('user1Id', '==', auth.currentUser.uid));
      const q2 = query(collection(db, 'friendships'), where('user2Id', '==', auth.currentUser.uid));
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const friendships: Friendship[] = [];
      snap1.forEach(doc => friendships.push(doc.data() as Friendship));
      snap2.forEach(doc => friendships.push(doc.data() as Friendship));
      
      return friendships;
    } catch (e) {
      console.error("Error fetching friendships:", e);
      return [];
    }
  }

  async getLeaderboard(category: string, period: string): Promise<LeaderboardEntry[]> {
    if (!this.isOnline || !auth?.currentUser || !db) {
      // Offline fallback: generate fake leaderboard + local user score
      console.info("[SyncService] Returning mock leaderboard for offline mode");
      const localProgressStr = localStorage.getItem('semdesculpas_dailyProgress_v5') || '[]';
      // In a real mock we would parse localProgress to determine score.
      // For now, return a convincing static mock.
      return [
        { uid: 'mock-1', category: category as any, period: period as any, score: 15, rank: 1, updatedAt: new Date().toISOString() },
        { uid: 'mock-2', category: category as any, period: period as any, score: 12, rank: 2, updatedAt: new Date().toISOString() },
        { uid: 'local', category: category as any, period: period as any, score: 5, rank: 3, updatedAt: new Date().toISOString() },
      ];
    }
    try {
      const q = query(
        collection(db, 'leaderboards'), 
        where('category', '==', category),
        where('period', '==', period)
      );
      const snap = await getDocs(q);
      const entries: LeaderboardEntry[] = [];
      snap.forEach(doc => entries.push(doc.data() as LeaderboardEntry));
      return entries.sort((a, b) => a.rank - b.rank);
    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      return [];
    }
  }

  // --- CO-OP SESSION ---
  async createRoom(mode: 2 | 5 | 25, visibility: 'public' | 'friends' | 'private'): Promise<string> {
    if (!this.isOnline || !auth?.currentUser || !db) throw new Error("Offline or not logged in");
    const roomRef = doc(collection(db, 'rooms'));
    await setDoc(roomRef, {
      id: roomRef.id,
      hostUid: auth.currentUser.uid,
      mode,
      status: 'idle',
      startAt: null,
      createdAt: serverTimestamp(),
      visibility,
      maxParticipants: 10
    });
    
    const memberRef = doc(db, `rooms/${roomRef.id}/members`, auth.currentUser.uid);
    await setDoc(memberRef, {
      uid: auth.currentUser.uid,
      joinedAt: serverTimestamp(),
      presence: 'active',
      lastPingAt: serverTimestamp()
    });
    
    return roomRef.id;
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.isOnline || !auth?.currentUser || !db) throw new Error("Offline or not logged in");
    const memberRef = doc(db, `rooms/${roomId}/members`, auth.currentUser.uid);
    await setDoc(memberRef, {
      uid: auth.currentUser.uid,
      joinedAt: serverTimestamp(),
      presence: 'active',
      lastPingAt: serverTimestamp()
    });
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (!this.isOnline || !auth?.currentUser || !db) return;
    const memberRef = doc(db, `rooms/${roomId}/members`, auth.currentUser.uid);
    await updateDoc(memberRef, { presence: 'away' });
  }

  async startRoom(roomId: string): Promise<void> {
    if (!this.isOnline || !auth?.currentUser || !db) return;
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      status: 'active',
      startAt: serverTimestamp()
    });
  }

  async updateRoomPresence(roomId: string, presence: 'active' | 'paused' | 'away'): Promise<void> {
    if (!this.isOnline || !auth?.currentUser || !db) return;
    const memberRef = doc(db, `rooms/${roomId}/members`, auth.currentUser.uid);
    await updateDoc(memberRef, {
      presence,
      lastPingAt: serverTimestamp()
    });
  }

  listenRoom(roomId: string, callback: (room: any, members: any[]) => void): () => void {
    if (!this.isOnline || !db) return () => {};
    
    let currentRoom: any = null;
    let currentMembers: any[] = [];

    const unsubRoom = onSnapshot(doc(db, 'rooms', roomId), (doc) => {
      if (doc.exists()) {
        currentRoom = doc.data();
        callback(currentRoom, currentMembers);
      }
    });

    const unsubMembers = onSnapshot(collection(db, `rooms/${roomId}/members`), (snap) => {
      currentMembers = snap.docs.map(d => d.data());
      callback(currentRoom, currentMembers);
    });

    return () => {
      unsubRoom();
      unsubMembers();
    };
  }

  // --- LIGAS ---
  async getLeagueState(): Promise<any> {
    if (!this.isOnline || !auth?.currentUser || !db) return { tier: 'Diamante (Mock)', score: 950, rank: 3, activeDays: 5 };
    const docRef = doc(db, 'leagueMembers', auth.currentUser.uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  }

  // --- COMUNIDADE ---
  async listCommunityPacks(): Promise<any[]> {
    if (!this.isOnline || !auth?.currentUser || !db) {
      return [{ id: 'mock-pack', name: 'Pack Foco (Offline)', description: 'Um pack mockado enquanto você está sem servidor.', stats: { downloads: 42 }, authorHandle: 'system' }];
    }
    const q = query(collection(db, 'communityPacks'), where('isPublic', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }

  async listCommunityTemplates(): Promise<any[]> {
    if (!this.isOnline || !auth?.currentUser || !db) {
      return [{ id: 'mock-tpl', title: 'Template (Offline)', description: 'Simula o banco.', defaultNextStep: 'Respirar fundo', stats: { downloads: 12 }, authorHandle: 'system' }];
    }
    const q = query(collection(db, 'templates'), where('moderation.status', '==', 'approved'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }

  // --- REPLAY ---
  async getWeeklyReplay(weekId: string): Promise<any> {
    if (!this.isOnline || !auth?.currentUser || !db) {
      return { metrics: { activeDays: 4, streak: 4, topExcuse: 'Cansaço', topHour: 20, facedDelays: 2, deepMinutes: 120, bestDay: new Date().toISOString().split('T')[0] } };
    }
    const docRef = doc(db, `replays/${auth.currentUser.uid}/${weekId}`);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  }
}

export const syncService = new SyncService();
