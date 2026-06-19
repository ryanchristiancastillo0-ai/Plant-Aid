

import {
  MdWarning,
} from 'react-icons/md';
import { IoLeaf } from 'react-icons/io5';

import {
  formatConfidence,
} from '../pages/DiagnosticScan/services/Diagnostic';


export default function NotPlantState({ score, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-6 bg-amber-50 rounded-2xl border border-amber-200 px-4">
      <MdWarning className="text-3xl text-amber-500" />
      <div>
        <p className="text-sm font-bold text-amber-900">No plant detected</p>
        <p className="text-xs text-amber-700 mt-0.5">
          {formatConfidence(score)} confidence · try a clearer photo
        </p>
      </div>
      <button onClick={onRetry} className="text-xs font-bold text-amber-700 hover:underline">
        Try again
      </button>
    </div>
  );
}
