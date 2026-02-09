import { Flame, Star, Zap } from 'lucide-react';

export default function StatusBar() {
    return (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 p-3 flex justify-center items-center gap-3 shadow-sm">

            {/* Flame */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full
                      bg-gradient-to-r from-orange-400 to-red-500
                      shadow-lg shadow-orange-400/40
                      border-2 border-white/40">
                <Flame className="text-white fill-white" size={20} />
                <span className="text-white font-bold text-sm">3</span>
            </div>

            {/* Star */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full
                      bg-gradient-to-r from-yellow-400 to-orange-400
                      shadow-lg shadow-yellow-400/40
                      border-2 border-white/40">
                <Star className="text-white fill-white" size={20} />
                <span className="text-white font-bold text-sm">120</span>
            </div>

            {/* Energy */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full
                      bg-gradient-to-r from-purple-400 to-blue-500
                      shadow-lg shadow-purple-400/40
                      border-2 border-white/40">
                <Zap className="text-white fill-white" size={20} />
                <span className="text-white font-bold text-sm">5</span>
            </div>
        </div>
    );
}
