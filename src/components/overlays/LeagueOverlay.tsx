import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { syncService } from '../../services/SyncService';
import { auth } from '../../firebase';

interface LeagueOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeagueOverlay: React.FC<LeagueOverlayProps> = ({ isOpen, onClose }) => {
  const [leagueState, setLeagueState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLeague();
    }
  }, [isOpen]);

  const loadLeague = async () => {
    setLoading(true);
    try {
      const state = await syncService.getLeagueState();
      setLeagueState(state);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-white">Weekly League</h2>
                <p className="text-sm text-gray-400">Compete with 30 users of similar rank</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : !leagueState ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Not in a League</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                Complete at least one focus session this week to be placed in a league group.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Start Focusing
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Current Tier</div>
                  <div className="text-2xl font-bold text-white capitalize">{leagueState.tier} League</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Ends In</div>
                  <div className="text-xl font-mono text-white">2d 14h</div>
                </div>
              </div>

              <div className="bg-black/50 rounded-xl border border-white/5 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-6">User</div>
                  <div className="col-span-3 text-right">Score</div>
                  <div className="col-span-2 text-center">Trend</div>
                </div>
                <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                  {/* Mock Data for now, since we don't have a full league backend yet */}
                  {[
                    { rank: 1, handle: 'focus_master', score: 1250, trend: 'up', isMe: false },
                    { rank: 2, handle: 'study_bot', score: 1100, trend: 'same', isMe: false },
                    { rank: 3, handle: 'you', score: 950, trend: 'up', isMe: true },
                    { rank: 4, handle: 'procrastinator', score: 800, trend: 'down', isMe: false },
                    { rank: 5, handle: 'newbie', score: 450, trend: 'same', isMe: false },
                  ].map((entry) => (
                    <div
                      key={entry.rank}
                      className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                        entry.isMe ? 'bg-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="col-span-1 text-center font-mono text-sm text-gray-400">
                        {entry.rank}
                      </div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-medium text-white">
                          {entry.handle.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`text-sm font-medium ${entry.isMe ? 'text-white' : 'text-gray-300'}`}>
                          {entry.handle} {entry.isMe && '(You)'}
                        </span>
                      </div>
                      <div className="col-span-3 text-right font-mono text-sm text-emerald-400">
                        {entry.score}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {entry.trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-500" />}
                        {entry.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                        {entry.trend === 'same' && <Minus className="w-4 h-4 text-gray-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 px-2">
                <span>Top 5 promote to next tier</span>
                <span>Bottom 5 relegate to previous tier</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
