import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface InfoModalProps {
    title: string;
    description: string;
    onClose: () => void;
}

export default function InfoModal({ title, description, onClose }: InfoModalProps) {
    return (
        <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none">
            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-10 pointer-events-auto"
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-slate-600 leading-relaxed">{description}</p>
            </motion.div>
        </div>
    );
}
