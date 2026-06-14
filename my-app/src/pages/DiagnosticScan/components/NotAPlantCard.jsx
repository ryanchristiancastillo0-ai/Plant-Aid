
import {
  formatConfidence,

} from '../services/Diagnostic';
import {
  MdWarning,
  MdRefresh,
} from 'react-icons/md';


export default function NotAPlantCard({ score, onRetry }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
        <MdWarning className="text-3xl text-amber-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-amber-900">No Plant Detected</h3>
        <p className="text-sm text-amber-700 mt-1">
          The image doesn't appear to contain a plant ({formatConfidence(score)} confidence).
          Try a clearer photo with the plant centred in frame.
        </p>
      </div>
      <button onClick={onRetry}
        className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors">
        <MdRefresh className="text-base" /> Try Again
      </button>
    </div>
  );
}
