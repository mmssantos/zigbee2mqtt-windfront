import { useEffect, useState } from "react";

type CountdownProps = {
    seconds: number;
    hideZeroes: boolean;
};

export default function Countdown(props: CountdownProps) {
    const [remaining, setRemaining] = useState(props.seconds);

    useEffect(() => {
        const timer = setTimeout(() => {
            setRemaining(remaining - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [remaining]);

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor(remaining / 60) % 60;
    const seconds = Math.floor(remaining % 60);
    const showHours = !props.hideZeroes || hours > 0;
    const showMinutes = !props.hideZeroes || minutes > 0;

    return (
        <span className="countdown">
            {showHours && (
                <span style={{ "--value": hours } as React.CSSProperties} aria-live="polite" aria-label={hours.toString()}>
                    {hours}
                </span>
            )}
            {showHours && ":"}
            {showMinutes && (
                <span style={{ "--value": minutes } as React.CSSProperties} aria-live="polite" aria-label={minutes.toString()}>
                    {minutes}
                </span>
            )}
            {showMinutes && ":"}
            <span style={{ "--value": seconds } as React.CSSProperties} aria-live="polite" aria-label={seconds.toString()}>
                {seconds}
            </span>
        </span>
    );
}
