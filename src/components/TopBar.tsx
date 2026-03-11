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
        <button onClick={onOpenDebtList} className="hover:text-text transition-colors" title="Dívidas (Shift+D)">
          <FileText className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenCoop} className="hover:text-text transition-colors" title="Co-op (Shift+C)">
          <Users className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenLeague} className="hover:text-text transition-colors" title="Ligas (Shift+G)">
          <Trophy className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenCommunity} className="hover:text-text transition-colors" title="Comunidade (Shift+U)">
          <Globe className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenReplay} className="hover:text-text transition-colors" title="Replay (Shift+W)">
          <History className="w-[18px] h-[18px]" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={onOpenLeaderboard} className="hover:text-text transition-colors" title="Ranking (Shift+L)">
          <BarChart2 className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenFriends} className="hover:text-text transition-colors" title="Amigos (Shift+F)">
          <FriendsIcon className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenProfile} className="hover:text-text transition-colors" title="Perfil (Shift+P)">
          <UserIcon className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenTheme} className="hover:text-text transition-colors" title="Theme (Shift+T)">
          <Palette className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenReports} className="hover:text-text transition-colors" title="Reports (Shift+R)">
          <BarChart2 className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenSettings} className="hover:text-text transition-colors" title="Settings (Shift+S)">
          <Settings className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
