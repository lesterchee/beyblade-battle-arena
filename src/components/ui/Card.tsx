import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    hover?: boolean;
    skew?: boolean;
}

export function Card({ className, children, hover = false, skew = true, ...props }: CardProps) {
    return (
        <motion.div
            className={cn(
                "relative bg-slate-900/90 border-2 border-black p-4",
                skew && "skew-x-[-10deg]", // Beyblade X Skew
                hover && "hover:border-blue-500 hover:bg-slate-800 transition-colors cursor-pointer group",
                "shadow-[8px_8px_0px_0px_#000]", // Hard Shadow
                className
            )}
            whileHover={hover ? { y: -5, x: -2, boxShadow: '12px 12px 0px 0px #000' } : {}}
            {...props}
        >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50" />

            {/* Un-skew content container if needed, or let content be skewed. 
                Usually, for readability, we might want to unskew text, but for the aesthetic, 
                let's keep it or provide a utility wrapper if text looks bad.
                For now, children inherit the skew. */}
            <div className={cn(skew && "skew-x-[10deg]")}>
                {children}
            </div>
        </motion.div>
    );
}
