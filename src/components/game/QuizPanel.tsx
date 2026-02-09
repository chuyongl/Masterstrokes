import type { Question } from '../../services/api';


interface QuizPanelProps {
    question: Question;
    onSelectOption: (optionId: string) => void;
}

export default function QuizPanel({ question, onSelectOption }: QuizPanelProps) {
    return (
        <div className="p-4 bg-white/50 backdrop-blur-md rounded-t-3xl border-t border-white shadow-lg mt-auto">
            <h3 className="text-lg font-bold text-center mb-4 text-slate-800">{question.text}</h3>
            <div className="grid grid-cols-2 gap-3">
                {question.options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelectOption(option.id)}
                        className="aspect-square rounded-xl overflow-hidden border-4 border-transparent hover:border-sky-400 focus:border-sky-500 transition-all bg-slate-200 relative group"
                    >
                        <img
                            src={option.imageUrl}
                            alt="Option"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
