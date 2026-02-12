import * as React from 'react';

import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
        // Cyberpunk styles
        const baseStyles = "inline-flex items-center justify-center rounded-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group";

        const variants = {
            primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400/30",
            secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-600",
            outline: "border-2 border-slate-600 bg-transparent hover:bg-slate-800 text-slate-200",
            ghost: "hover:bg-slate-800 text-slate-200",
            danger: "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-6 py-2 text-sm",
            lg: "h-14 px-8 text-base",
        };

        const Comp = motion.button;

        return (
            <Comp
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                {...(props as any)}
            >
                <span className="relative z-10">{props.children}</span>
                {/* Glow effect */}
                {variant === 'primary' && (
                    <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button };
