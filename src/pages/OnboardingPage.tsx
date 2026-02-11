import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout, StepLoading } from '../components/onboarding/OnboardingSteps';

export default function OnboardingPage() {
    const navigate = useNavigate();

    // Auto-advance for Loading step
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/hub');
        }, 3000); // 3s fake loading
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <OnboardingLayout showBack={false}>
            <StepLoading onNext={() => navigate('/hub')} />
        </OnboardingLayout>
    );
}
