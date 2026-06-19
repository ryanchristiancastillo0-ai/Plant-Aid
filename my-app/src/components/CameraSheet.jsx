import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../pages/Auth/Service/AuthContext';

import {

  MdClose,
  MdPhotoCamera,
 
} from 'react-icons/md';

import {
  runScanPipeline,

  getHealthConfig,
} from '../pages/DiagnosticScan/services/Diagnostic';

import {UploadPrompt,ScanningState,ErrorState,NotPlantState,QuickResult} from './index'


export default function CameraSheet({ onClose }) {
  const { currentUser } = useAuth();
  const userId   = currentUser?.uid ?? null;
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [preview,   setPreview]   = useState('');
  const [scanning,  setScanning]  = useState(false);
  const [result,    setResult]    = useState(null);
  const [scanError, setScanError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (!userId) { setScanError('Please sign in to scan plants.'); return; }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setResult(null);
    setScanError(null);
    setScanning(true);

    try {
      const { result: scanResult } = await runScanPipeline(userId, file, {});
      setResult(scanResult);
    } catch (err) {
      console.error('Quick scan error:', err);
      setScanError('Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  }, [userId]);

  useEffect(() => {
    const handler = (e) => handleFile(e.detail);
    window.addEventListener('quick-scan-file', handler);
    return () => window.removeEventListener('quick-scan-file', handler);
  }, [handleFile]);

  const handleViewDetails = useCallback(() => {
    onClose();
    navigate('/diagnostic-scan');
  }, [navigate, onClose]);

  const handleReset = useCallback(() => {
    setPreview('');
    setResult(null);
    setScanError(null);
  }, []);

  const topMatch   = result?.suggestions?.[0];
  const healthCfg  = result ? getHealthConfig(result.isHealthy, result.isHealthyScore) : null;
  const confidence = topMatch ? Math.round((topMatch.probability ?? 0) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#fbf8ff] rounded-t-3xl shadow-2xl"
        style={{ maxHeight: '88vh', overflowY: 'auto' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#c8c5ca]/60 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#c8c5ca]/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#a6f2d1] flex items-center justify-center">
              <MdPhotoCamera className="text-[#1b6b51] text-base" />
            </div>
            <span className="text-base font-bold text-black dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Quick Scan
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e8e7f1] transition-colors"
          >
            <MdClose className="text-[#47464a] text-lg" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {!preview && !scanning && !result && (
            <UploadPrompt onFile={handleFile} fileRef={fileRef} />
          )}
          {scanning && <ScanningState preview={preview} />}
          {scanError && !scanning && (
            <ErrorState message={scanError} onRetry={handleReset} />
          )}
          {result && !result.isPlant && !scanning && (
            <NotPlantState score={result.isPlantScore} onRetry={handleReset} />
          )}
          {result && result.isPlant && !scanning && topMatch && (
            <QuickResult
              preview={preview}
              topMatch={topMatch}
              confidence={confidence}
              healthCfg={healthCfg}
              result={result}
              onRetry={handleReset}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>

        <div className="h-6" />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </>
  );
}