import { useRive } from '@rive-app/react-canvas';
import { useEffect } from 'react';

interface MarieroseCharacterProps {
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    className?: string;
}

export default function MarieroseCharacter({
    width = 80,
    height = 80,
    style,
    className,
}: MarieroseCharacterProps) {
    const { rive, RiveComponent } = useRive({
        src: `${import.meta.env.BASE_URL}marirose.riv?v=${Date.now()}`,
        stateMachines: 'State Machine 1',
        autoplay: true,
    });

    useEffect(() => {
        if (!rive) return;
        rive.play('State Machine 1');
    }, [rive]);

    return (
        <RiveComponent
            style={{ width, height, ...style }}
            className={className}
        />
    );
}
