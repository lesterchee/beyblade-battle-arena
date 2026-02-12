import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    hover?: boolean;
}

export function Card({ className, children, hover = false, ...props }: CardProps) {
    return (
        <motion.div
            className={cn(
                "bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg p-4 shadow-xl",
                hover && "hover:border-blue-500/50 transition-colors cursor-pointer",
                className
            )}
            whileHover={hover ? { y: -5 } : {}}
            {...props}
        >
            {children}
        </motion.div>
    );
}
