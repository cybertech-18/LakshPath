import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const BottomNav = ({ tabs, activeTab, setActiveTab }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] z-50 shadow-2xl">
      <div className="flex items-center justify-around px-2 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-full py-2 gap-1.5 relative ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                {tab.icon}
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-primary-500/20 blur-lg rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
