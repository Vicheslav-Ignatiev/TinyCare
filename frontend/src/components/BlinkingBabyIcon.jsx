import { useState, useEffect } from "react";
import babyNormal from "../assets/baby-normal.png";
import babyBlink from "../assets/baby-blink.png";

export default function BlinkingBabyIcon({ size = 32 }) {
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        // Random blink every 2-4 seconds
        const scheduleNextBlink = () => {
            const delay = Math.random() * 2000 + 2000; // 2-4 seconds

            const timeout = setTimeout(() => {
                setIsBlinking(true);

                // Blink duration: 150ms
                setTimeout(() => {
                    setIsBlinking(false);
                    scheduleNextBlink();
                }, 150);
            }, delay);

            return timeout;
        };

        const timeout = scheduleNextBlink();

        return () => clearTimeout(timeout);
    }, []);

    return (
        <img
            src={isBlinking ? babyBlink : babyNormal}
            alt="Baby icon"
            style={{
                width: size,
                height: size,
                objectFit: "contain",
                transition: "opacity 0.05s ease",
            }}
        />
    );
}