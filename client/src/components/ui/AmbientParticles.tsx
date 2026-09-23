import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

type Ripple = {
    id: number;
    x: number;
    y: number;
};

type ParticleStyle = CSSProperties & {
    '--particle-x': string;
    '--particle-size': string;
    '--particle-delay': string;
    '--particle-duration': string;
    '--particle-drift': string;
};

const particles = [
    [4, 7, 0, 16, 13],
    [11, 4, 3, 21, -10],
    [18, 9, 7, 18, 15],
    [27, 3, 1, 24, -18],
    [34, 6, 9, 20, 12],
    [42, 4, 5, 17, -14],
    [50, 8, 11, 23, 18],
    [58, 5, 2, 19, -12],
    [66, 9, 8, 22, 14],
    [74, 4, 4, 18, -16],
    [82, 7, 10, 25, 11],
    [90, 3, 6, 20, -13],
    [97, 8, 1, 17, 16],
] as const;

export function AmbientParticles() {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    useEffect(() => {
        let nextRippleId = 0;

        function handlePointerDown(event: PointerEvent) {
            if (event.button !== 0) return;

            const ripple = {
                id: nextRippleId++,
                x: event.clientX,
                y: event.clientY,
            };

            setRipples((current) => [...current.slice(-5), ripple]);
            window.setTimeout(() => {
                setRipples((current) => current.filter((item) => item.id !== ripple.id));
            }, 850);
        }

        window.addEventListener('pointerdown', handlePointerDown, { passive: true });
        return () => window.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    return (
        <div className="ambient-scene" aria-hidden="true">
            <div className="ambient-particles">
                {particles.map(([x, size, delay, duration, drift], index) => {
                    const style: ParticleStyle = {
                        '--particle-x': `${x}%`,
                        '--particle-size': `${size}px`,
                        '--particle-delay': `${delay}s`,
                        '--particle-duration': `${duration}s`,
                        '--particle-drift': `${drift}px`,
                    };

                    return <span key={index} className="ambient-particle" style={style} />;
                })}
            </div>
            <div className="ambient-ripples">
                {ripples.map((ripple) => (
                    <span
                        key={ripple.id}
                        className="ambient-ripple"
                        style={{ left: ripple.x, top: ripple.y }}
                    />
                ))}
            </div>
        </div>
    );
}
