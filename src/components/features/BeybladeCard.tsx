import { Beyblade } from '@/types/game';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BeybladeCardProps {
    blade: Beyblade;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export function BeybladeCard({ blade, isSelected, onClick, disabled }: BeybladeCardProps) {
    // Determine stats percentage (assuming max 100)
    const getWidth = (val: number) => `${Math.min(100, val)}%`;

    return (
        <Card
            onClick={!disabled ? onClick : undefined}
            className={cn(
                "relative overflow-hidden transition-all duration-300 group select-none",
                isSelected
                    ? "ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-slate-800"
                    : "hover:bg-slate-800/50 opacity-80 hover:opacity-100",
                disabled && "opacity-40 cursor-not-allowed grayscale"
            )}
            hover={!disabled && !isSelected}
        >
            {/* Background Accent */}
            <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -z-0 opacity-20"
                style={{ backgroundColor: blade.color }}
            />

            <div className="relative z-10 flex flex-col gap-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-orbitron font-bold text-lg text-white leading-none">
                            {blade.name}
                        </h3>
                        <span className="text-xs text-slate-400 font-oswald tracking-wide uppercase">
                            {blade.type} Type
                        </span>
                    </div>
                    {/* Mock Icon */}
                    <div
                        className="w-8 h-8 rounded-full border-2 border-slate-600 shadow-inner"
                        style={{ backgroundColor: blade.color }}
                    />
                </div>

                {/* Stats Grid */}
                <div className="space-y-1.5 mt-2">
                    <StatBar label="ATK" value={blade.stats.ATK} color="bg-red-500" />
                    <StatBar label="DEF" value={blade.stats.DEF} color="bg-green-500" />
                    <StatBar label="SPD" value={blade.stats.SPD} color="bg-yellow-500" />
                    <StatBar label="STA" value={blade.stats.STA} color="bg-blue-500" />
                </div>
            </div>

            {isSelected && (
                <motion.div
                    layoutId="selection-ring"
                    className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}
        </Card>
    );
}

function StatBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-6 font-bold text-slate-400">{label}</span>
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={cn("h-full rounded-full", color)}
                />
            </div>
            <span className="w-6 text-right text-slate-500">{value}</span>
        </div>
    );
}
