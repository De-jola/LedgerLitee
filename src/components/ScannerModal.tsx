import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon, Zap } from 'lucide-react';
import { parseReceiptCode } from '../utils/scannerParser';
import { ScannedReceiptData } from '../types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: ScannedReceiptData, photoDataUrl?: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'photo'>('camera');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  // Start Camera Scanner
  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // Rear camera preferred on mobile
        config,
        (decodedText) => {
          // Success
          stopCamera();
          const parsed = parseReceiptCode(decodedText);
          onScanComplete(parsed, capturedPhotoUrl || undefined);
        },
        () => {
          // Normal frame scan attempt, no log needed
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start error', err);
      setIsScanning(false);
      setErrorMessage(
        err?.message?.includes('Permission')
          ? 'Camera permission was denied. Please allow camera access or use the "Photo of Receipt" upload option below.'
          : 'Could not access device camera. You can snap/upload a receipt photo instead or use sample slips.'
      );
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Camera stop error', e);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      // Delay slightly for DOM element to mount
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, activeTab]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Photo Upload (and preserves image against faded ink)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCapturedPhotoUrl(dataUrl);

      // Attempt barcode scan from image file using html5-qrcode
      try {
        const scanner = new Html5Qrcode('temp-image-reader', false);
        const decodedText = await scanner.scanFile(file, true);
        const parsed = parseReceiptCode(decodedText);
        onScanComplete(parsed, dataUrl);
      } catch (scanErr) {
        // If no barcode was decoded from image, still allow user to keep the photo and log transaction!
        const manualReceiptData: ScannedReceiptData = {
          rawPayload: 'PHOTO_RECEIPT_' + Date.now(),
          notes: 'Receipt photo captured to prevent faded thermal ink loss.',
          paymentMethod: 'pos_agent',
          category: 'tuition_fees',
        };
        onScanComplete(manualReceiptData, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-teal-800 text-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-700/70 p-1.5 ring-1 ring-teal-500/50">
              <Camera className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Receipt Scanner & Ink Guard</h2>
              <p className="text-xs text-teal-200">Scan QR, POS barcode, or archive receipt photo</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg p-1.5 text-teal-200 hover:bg-teal-700 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center justify-center gap-1.5 py-3 transition ${
              activeTab === 'camera'
                ? 'border-b-2 border-teal-600 bg-white text-teal-800 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" /> Live Camera
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('photo');
            }}
            className={`flex items-center justify-center gap-1.5 py-3 transition ${
              activeTab === 'photo'
                ? 'border-b-2 border-teal-600 bg-white text-teal-800 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" /> Photo Archive
          </button>
        </div>

        {/* Content area */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative mx-auto w-full max-w-sm rounded-xl overflow-hidden bg-slate-950 min-h-[280px] flex items-center justify-center shadow-inner">
                {/* HTML5 Qr Code Reader target */}
                <div id={scannerContainerId} className="w-full h-full"></div>

                {!isScanning && !errorMessage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-300">
                    <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mb-2" />
                    <p className="text-sm font-medium">Starting camera...</p>
                    <p className="text-xs text-slate-400 mt-1">Point at POS receipt QR or barcode</p>
                  </div>
                )}

                {/* Laser scan line overlay when active */}
                {isScanning && (
                  <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
                )}
              </div>

              {errorMessage && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Camera Notice</p>
                    <p className="mt-0.5">{errorMessage}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => startCamera()}
                        className="rounded bg-amber-600 px-2.5 py-1 text-white font-medium hover:bg-amber-700"
                      >
                        Retry Camera
                      </button>
                      <button
                        onClick={() => setActiveTab('photo')}
                        className="rounded border border-amber-300 bg-white px-2.5 py-1 font-medium hover:bg-amber-100"
                      >
                        Upload Photo Instead
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-teal-50 border border-teal-100 p-3 text-xs text-teal-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Supports POS thermal QR codes, Moniepoint slips, and Code 128 barcodes.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photo' && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 p-6 text-center hover:bg-teal-50 transition">
                <label className="cursor-pointer flex flex-col items-center justify-center">
                  <div className="rounded-full bg-teal-100 p-3 text-teal-700 mb-3 shadow-xs">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Take Photo or Upload Receipt
                  </span>
                  <span className="text-xs text-slate-500 mt-1 max-w-xs">
                    Snap a picture with your phone camera. Prevents ink fading loss by storing high-resolution permanent proof!
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <div className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700">
                    Snap / Choose Photo
                  </div>
                </label>
              </div>

              <div id="temp-image-reader" className="hidden"></div>

              {capturedPhotoUrl && (
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Photo Ready & Preserved
                    </span>
                    <button
                      onClick={() => setCapturedPhotoUrl(null)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <img
                    src={capturedPhotoUrl}
                    alt="Captured receipt"
                    className="h-32 w-full object-cover rounded-lg border border-slate-300"
                  />
                </div>
              )}

              <div className="rounded-xl bg-slate-100 p-3.5 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Why archive receipt photos?</p>
                <p>
                  Thermal POS paper ink fades away into blank paper after 2–4 weeks in tropical humidity. Capturing a photo stores an permanent digital copy in the school's local database.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Offline verified • Works without internet
          </span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
