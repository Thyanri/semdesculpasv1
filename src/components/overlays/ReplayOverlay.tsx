import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Calendar, Share2, Download, TrendingUp, Clock, Target } from 'lucide-react';
import { syncService } from '../../services/SyncService';
import { auth } from '../../firebase';

interface ReplayOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReplayOverlay: React.FC<ReplayOverlayProps> = ({ isOpen, onClose }) => {
  const [replay, setReplay] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadReplay();
    }
  }, [isOpen]);

  const loadReplay = async () => {
    setLoading(true);
    try {
      // In a real app, calculate the current week ID
      const currentWeekId = '2026-W11';
      const data = await syncService.getWeeklyReplay(currentWeekId);
      setReplay(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // In a real app, generate an image or share link
    alert("Exporting replay as image...");
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
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <PlayCircle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-white">Weekly Replay</h2>
                <p className="text-sm text-gray-400">Your focus journey this week</p>
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
          ) : !replay ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Replay Available</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                Complete more focus sessions this week to generate your weekly replay. Check back on Sunday!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Replay Content */}
              <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Week 11, 2026</h3>
                      <p className="text-purple-300">March 9 - March 15</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Focus Score</div>
                      <div className="text-3xl font-mono text-emerald-400">{replay.score || 850}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Deep Work</span>
                      </div>
                      <div className="text-2xl font-medium text-white">{Math.floor((replay.totalMinutes || 120) / 60)}h {(replay.totalMinutes || 120) % 60}m</div>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Target className="w-4 h-4" />
                        <span className="text-sm">Sessions</span>
                      </div>
                      <div className="text-2xl font-medium text-white">{replay.sessionsCount || 5}</div>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Consistency</span>
                      </div>
                      <div className="text-2xl font-medium text-white">{replay.consistencyScore || 92}%</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Top Highlights</h4>
                    <ul className="space-y-2">
                      {(replay.highlights || ['Completed 3 cases without delays', 'Maintained a 5-day streak', 'Focused mostly on "Project X"']).map((h: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-purple-500 mt-0.5">•</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Image
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Replay
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
