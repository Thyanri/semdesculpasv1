import { User } from '../domain/models';
import { Users, Trophy, Globe, History, FileText, Settings, User as UserIcon, Users as FriendsIcon, BarChart2, Palette } from 'lucide-react';

interface TopBarProps {
  user: User | null;
  onOpenTheme: () => void;
  onOpenReports: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenFriends: () => void;
  onOpenLeaderboard: () => void;
  onOpenCoop: () => void;
  onOpenLeague: () => void;
  onOpenCommunity: () => void;
  onOpenReplay: () => void;
  onOpenDebtList: () => void;
}

export function TopBar({ 
  user, 
  onOpenTheme, 
  onOpenReports, 
  onOpenSettings, 
  onOpenProfile, 
  onOpenFriends, 
  onOpenLeaderboard,
  onOpenCoop,
  onOpenLeague,
  onOpenCommunity,
  onOpenReplay,
  onOpenDebtList
}: TopBarProps) {
  return (
    <header className="w-full h-14 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-bold text-text tracking-tight">SEM DESCULPAS</span>
      </div>
      
      <div className="hidden sm:flex items-center gap-4 text-xs text-subtext">
        {/* Optional mini-status could go here */}
      </div>

      <div className="flex items-center gap-4 text-subtext">
        {/* Social and Gamification Buttons Hidden by Default for Anti-Procrastination Focus */}
        <button onClick={onOpenProfile} className="hover:text-text transition-colors" title="Perfil (Shift+P)">
          <UserIcon className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenTheme} className="hover:text-text transition-colors" title="Tema (Shift+T)">
          <Palette className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenReports} className="hover:text-text transition-colors" title="Progresso (Shift+R)">
          <BarChart2 className="w-[18px] h-[18px]" />
        </button>
        {/* Debtlist might be useful as part of Settings or an advanced menu later */}
        <button onClick={onOpenSettings} className="hover:text-text transition-colors" title="Configurações (Shift+S)">
          <Settings className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
