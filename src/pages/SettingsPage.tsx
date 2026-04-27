import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Monitor, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="p-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-cream/70" />
        </button>
        <h1 className="text-xl font-serif text-cream font-bold">Settings</h1>
      </header>

      <div className="px-6 space-y-8">
        {/* Appearance Section */}
        <section>
          <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Appearance</h3>
          <div className="bg-surface/30 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-cream text-sm font-medium block">Dark Mode</span>
                  <span className="text-cream/40 text-[10px]">Customize your visual style</span>
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-surface border border-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-cream transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
              <button 
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-surface/50 border-white/5 opacity-50'}`}
              >
                <Sun className="w-6 h-6 text-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-cream">Light Mode</span>
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' : 'bg-surface/50 border-white/5 opacity-50'}`}
              >
                <Moon className="w-6 h-6 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-cream">Dark Mode</span>
              </button>
            </div>
          </div>
        </section>

        {/* Other Settings (Placeholders) */}
        <section>
          <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Preferences</h3>
          <div className="bg-surface/30 border border-white/5 rounded-3xl overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition-colors border-b border-white/5">
              <span className="text-cream text-sm">Notifications</span>
              <ChevronRight className="w-4 h-4 text-cream/20" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition-colors border-b border-white/5">
              <span className="text-cream text-sm">Language</span>
              <span className="text-primary text-[10px] font-bold uppercase tracking-widest">English</span>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
              <span className="text-cream text-sm">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-cream/20" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
