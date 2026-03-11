"use client"

import { motion, type HTMLMotionProps } from "framer-motion"

/**
 * Reusable scroll-triggered fade-up animation wrapper.
 * Uses `whileInView` with `once: true` to fire only once.
 * Lightweight and performant — no complex animations.
 */
interface MotionWrapperProps extends HTMLMotionProps<"div"> {
    /** Extra delay in seconds on top of the base 0.1s */
    delay?: number
    children: React.ReactNode
}

export function MotionWrapper({
    delay = 0,
    children,
    className,
    ...rest
}: MotionWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px", amount: 0.1 }}
            transition={{
                duration: 0.5,
                delay: 0.1 + delay,
                ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className={className}
            {...rest}
        >
            {children}
        </motion.div>
    )
}
