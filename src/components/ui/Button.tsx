import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {

        // Beyblade X Styles
        // Tech-Cut Polygon clip-path
        const clipStyle = {
            clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
        };

        const baseStyles = "relative inline-flex items-center justify-center font-black uppercase italic tracking-wider transition-all focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none group active:scale-95";

        const variants = {
            primary: "bg-blue-500 text-white hover:bg-blue-400 border-2 border-white shadow-[4px_4px_0px_0px_#000]",
            secondary: "bg-slate-800 text-white hover:bg-slate-700 border-2 border-slate-500 shadow-[4px_4px_0px_0px_#000]",
            outline: "bg-transparent border-2 border-white text-white hover:bg-white/10 shadow-[4px_4px_0px_0px_#000]",
            ghost: "hover:bg-white/10 text-white border-2 border-transparent hover:border-white/50",
            danger: "bg-red-500 text-white hover:bg-red-400 border-2 border-white shadow-[4px_4px_0px_0px_#000]",
        };

        const sizes = {
            sm: "h-8 px-4 text-xs",
            md: "h-12 px-8 text-sm",
            lg: "h-16 px-10 text-lg",
            xl: "h-20 px-12 text-2xl tracking-[0.2em]",
        };

        const Comp = motion.button as any;

        return (
            <Comp
                ref={ref}
                style={clipStyle}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                whileTap={{ scale: 0.95, x: 2, y: 2, boxShadow: '2px 2px 0px 0px #000' }}
                {...props}
            >
                {/* Inner shine/glint */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Content */}
                <span className="relative z-10 drop-shadow-md">{props.children}</span>
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button };
