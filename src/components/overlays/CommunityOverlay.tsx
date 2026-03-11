import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Download, Star, Search } from 'lucide-react';
import { syncService } from '../../services/SyncService';

interface CommunityOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityOverlay: React.FC<CommunityOverlayProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'templates'>('packs');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadContent();
    }
  }, [isOpen, activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'packs') {
        const packs = await syncService.listCommunityPacks();
        setItems(packs);
      } else {
        const templates = await syncService.listCommunityTemplates();
        setItems(templates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (item: any) => {
    alert(`Instalado ${item.name || item.title}`);
  };

  const filteredItems = items.filter(item => 
    (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-panel border border-border rounded-2xl p-6 w-full max-w-4xl shadow-2xl h-[80vh] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-text">Comunidade</h2>
                <p className="text-sm text-subtext">Descubra packs e templates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-subtext hover:text-text hover:bg-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-bg p-1 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab('packs')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'packs' ? 'bg-accent/20 text-accent' : 'text-subtext hover:text-text'
                }`}
              >
                Packs
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'templates' ? 'bg-accent/20 text-accent' : 'text-subtext hover:text-text'
                }`}
              >
                Templates
              </button>
            </div>

            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-subtext" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text focus:outline-none focus:border-subtext"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-border border-t-text rounded-full animate-spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-subtext mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text mb-2">Nenhum {activeTab} encontrado</h3>
                <p className="text-sm text-subtext">Tente ajustar sua busca ou volte mais tarde.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item, i) => (
                  <div key={item.id || i} className="bg-bg border border-border rounded-xl p-5 flex flex-col hover:border-text/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium text-text line-clamp-1">{item.name || item.title}</h3>
                      <div className="flex items-center gap-1 text-accent bg-accent/10 px-2 py-1 rounded text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {item.stats?.downloads || 0}
                      </div>
                    </div>
                    <p className="text-sm text-subtext mb-4 line-clamp-2 flex-1">
                      {item.description || 'Nenhuma descrição fornecida.'}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <div className="text-xs text-subtext">
                        Por <span className="text-text">@{item.authorHandle || 'anonymous'}</span>
                      </div>
                      <button
                        onClick={() => handleInstall(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-bg rounded-lg text-sm font-medium transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Download className="w-4 h-4" />
                        Instalar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
