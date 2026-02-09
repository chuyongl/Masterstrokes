import clsx from 'clsx';
import { Lock, Check } from 'lucide-react';

export interface LevelConfig {
    id: number;
    name: string;
    status: "completed" | "current" | "locked";
    color: string; // e.g. "from-orange-400 to-orange-600"
    shadowColor: string; // e.g. "shadow-orange-400/40"
    iconType: 'windmill' | 'dome' | 'candle' | 'palette' | 'frame';
}

interface LevelButtonProps {
    level: LevelConfig;
    onClick: () => void;
}

export default function LevelNode({ level, onClick }: LevelButtonProps) {

    // Custom SVG Icons
    const renderIcon = () => {
        const iconClass = "w-10 h-10 drop-shadow-md filter";
        const color = "text-white";

        switch (level.iconType) {
            case 'windmill':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconClass} ${color}`}>
                        <path d="M12 12 L12 22 M12 2 L12 12 M2 12 L12 12 M22 12 L12 12" strokeWidth="3" />
                        <path d="M12 12 L4 4 M12 12 L20 4 M12 12 L4 20 M12 12 L20 20" strokeWidth="1" opacity="0.8" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                    </svg>
                );
            case 'dome':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor" className={`${iconClass} ${color}`}>
                        <path d="M12 2C7 2 3 6 3 11V13H21V11C21 6 17 2 12 2Z" opacity="0.9" />
                        <rect x="4" y="14" width="16" height="8" rx="1" opacity="0.7" />
                        <path d="M12 2L12 5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                );
            case 'candle':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor" className={`${iconClass} ${color}`}>
                        <rect x="10" y="10" width="4" height="12" rx="1" opacity="0.9" />
                        <path d="M12 2C13 2 14 3.5 14 5C14 7 12 9 12 9C12 9 10 7 10 5C10 3.5 11 2 12 2Z" fill="#FFF" className={level.status === 'current' ? "animate-pulse" : ""} />
                    </svg>
                );
            case 'palette':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor" className={`${iconClass} ${color}`}>
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C12.86 22 13.67 21.87 14.43 21.63C14.79 21.5 15 21.14 15 20.73V19.5C15 18.67 15.67 18 16.5 18H17C19.76 18 22 15.76 22 13C22 7.05 17.65 2 12 2Z" />
                        <circle cx="6.5" cy="9.5" r="1.5" fill="rgba(0,0,0,0.2)" />
                        <circle cx="9.5" cy="5.5" r="1.5" fill="rgba(0,0,0,0.2)" />
                        <circle cx="14.5" cy="5.5" r="1.5" fill="rgba(0,0,0,0.2)" />
                        <circle cx="17.5" cy="9.5" r="1.5" fill="rgba(0,0,0,0.2)" />
                    </svg>
                );
            case 'frame':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`${iconClass} ${color}`}>
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.6" />
                    </svg>
                );
            default:
                return <span className="text-3xl">?</span>;
        }
    };

    const baseClasses = `
    w-24 h-24 rounded-full
    flex items-center justify-center
    relative
    transition-all duration-300
    border-4 border-white
  `;

    const statusClasses = {
        completed: `
      bg-gradient-to-br ${level.color}
      shadow-[0_8px_16px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.1),inset_0_-4px_8px_rgba(0,0,0,0.15),inset_0_4px_8px_rgba(255,255,255,0.4)]
      ${level.shadowColor}
    `,
        current: `
      bg-gradient-to-br from-blue-400 to-blue-600
      shadow-[0_8px_20px_rgba(0,0,0,0.25),0_0_24px_rgba(74,144,226,0.6),inset_0_-4px_8px_rgba(0,0,0,0.15),inset_0_4px_8px_rgba(255,255,255,0.4)]
      animate-pulse-glow
    `,
        locked: `
      bg-gradient-to-br from-gray-200 to-gray-300
      opacity-60
      shadow-[0_4px_8px_rgba(0,0,0,0.1)]
    `
    };

    return (
        <button
            onClick={onClick}
            disabled={level.status === 'locked'}
            className={clsx(baseClasses, statusClasses[level.status])}
        >
            {/* Icon */}
            <div className="z-10">{renderIcon()}</div>

            {/* Completed Checkmark */}
            {level.status === "completed" && (
                <div className="absolute top-0 right-0 -mr-2 -mt-2 
                        bg-green-500 rounded-full w-8 h-8 
                        flex items-center justify-center
                        shadow-lg border-2 border-white z-20">
                    <Check size={16} className="text-white stroke-[4]" />
                </div>
            )}

            {/* Locked Overlay */}
            {level.status === "locked" && (
                <div className="absolute inset-0 flex items-center justify-center
                        bg-black/10 rounded-full z-20">
                    <Lock size={28} className="text-white/80" />
                </div>
            )}
        </button>
    );
}
