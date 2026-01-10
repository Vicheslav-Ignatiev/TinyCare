import { useState, useEffect } from "react";

export default function AnimatedIcon({
                                         image1,
                                         image2,
                                         alt = "Animated icon",
                                         size = 150,
                                         interval = 1000
                                     }) {
    const [isAlternate, setIsAlternate] = useState(false);

    useEffect(() => {
        // Cycle between images based on interval prop
        const timer = setInterval(() => {
            setIsAlternate(prev => !prev);
        }, interval);

        return () => clearInterval(timer);
    }, [interval]);

    return (
        <img
            src={isAlternate ? image2 : image1}
            alt={alt}
            style={{
                width: size,
                height: size,
                objectFit: "contain",
                transition: "opacity 0.1s ease",
            }}
        />
    );
}