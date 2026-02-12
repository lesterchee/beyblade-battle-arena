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
    return (
        <Card
            onClick={!disabled ? onClick : undefined}
            skew={true}
            className={cn(
                "relative overflow-hidden transition-all duration-300 group select-none min-h-[320px] flex flex-col items-center",
                isSelected
                    ? "border-blue-500 bg-blue-900/40 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-105 z-10"
                    : "hover:bg-slate-800/80 opacity-90 hover:opacity-100",
                disabled && "opacity-40 cursor-not-allowed grayscale"
            )}
            hover={!disabled && !isSelected}
        >
            {/* Background Gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-0"
            />

            <div className="relative z-10 w-full flex flex-col items-center gap-4">
                {/* Header */}
                <div className="w-full text-center border-b-2 border-white/20 pb-2">
                    <h3 className="font-barlow font-black italic text-2xl text-white uppercase tracking-wider drop-shadow-md">
                        {blade.name}
                    </h3>
                    <span className="text-xs text-blue-300 font-bold uppercase tracking-[0.2em]">
                        {blade.type} Type
                    </span>
                </div>

                {/* Beyblade Image */}
                <div className="relative group-hover:scale-110 transition-transform duration-500">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-2xl overflow-hidden relative z-10">
                        {blade.image ? (
                            <img
                                src={blade.image}
                                alt={blade.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full" style={{ backgroundColor: blade.color }} />
                        )}
                    </div>
                    {/* Spin Disc Effect */}
                    <div className="absolute inset-0 -z-10 rounded-full border-2 border-white/30 scale-125 animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 -z-10 rounded-full border border-blue-500 scale-150 animate-[spin_5s_linear_infinite_reverse] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Tech Stats Grid */}
                <div className="w-full space-y-2 mt-2 bg-black/40 p-3 clip-path-polygon">
                    <StatRow label="ATK" value={blade.stats.ATK} color="bg-red-500" />
                    <StatRow label="DEF" value={blade.stats.DEF} color="bg-green-500" />
                    <StatRow label="SPD" value={blade.stats.SPD} color="bg-yellow-500" />
                    <StatRow label="STA" value={blade.stats.STA} color="bg-blue-500" />
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-2 right-2 text-blue-400 animate-pulse">
                    Selected
                </div>
            )}
        </Card>
    );
}

function StatRow({ label, value, color }: { label: string, value: number, color: string }) {
    // Generate hex blocks
    const maxBlocks = 10;
    const filledBlocks = Math.ceil((value / 100) * maxBlocks);

    return (
        <div className="flex items-center gap-2">
            <span className="w-8 font-barlow font-bold italic text-slate-400 text-sm">{label}</span>
            <div className="flex-1 flex gap-1 h-3">
                {Array.from({ length: maxBlocks }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex-1 h-full transform -skew-x-12",
                            i < filledBlocks ? color : "bg-slate-800"
                        )}
                    />
                ))}
            </div>
            <span className="w-6 text-right font-mono text-xs text-slate-500">{value}</span>
        </div>
    );
}
