import React from 'react';
import { Plane, MapPin, Star, RefreshCw } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNewChat?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNewChat }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-600 p-2 rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">LuxTravel AI</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Premium Concierge</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-6 text-sm text-slate-500 mr-4">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Global Destinations</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>Verified Reviews</span>
              </div>
            </div>

            {onNewChat && (
              <button 
                onClick={onNewChat}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium border border-slate-200"
                title="Limpar conversa e iniciar novo atendimento"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden xs:inline">Novo Atendimento</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col max-w-5xl mx-auto w-full shadow-xl bg-white my-0 sm:my-4 sm:rounded-2xl border-x border-slate-200">
        {children}
      </main>
    </div>
  );
};