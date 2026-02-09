import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout, StepSelection, StepLoading } from '../components/onboarding/OnboardingSteps';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<number>(0);

    // Step Sequence
    // 0: Selection (Interest)
    // 1: Loading (Course Loading)
    // 2: Done -> Hub

    const handleNext = () => {
        if (step === 1) {
            navigate('/hub');
        } else {
            setStep(prev => prev + 1);
        }
    };

    // Auto-advance for Loading step
    useEffect(() => {
        if (step === 1) {
            const timer = setTimeout(() => {
                handleNext();
            }, 3000); // 3s fake loading
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Render Steps
    const renderStep = () => {
        switch (step) {
            case 0:
                return <StepSelection onNext={handleNext} />;
            case 1:
                return <StepLoading onNext={handleNext} />;
            default:
                return null;
        }
    };

    return (
        <OnboardingLayout showBack={step === 0} onBack={() => step === 0 ? navigate('/') : setStep(prev => prev - 1)}>
            {renderStep()}
        </OnboardingLayout>
    );
}
