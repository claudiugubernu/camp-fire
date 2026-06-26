import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui';

const QR_REGION_ID = 'qr-reader';

export function QRScanPage() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const hasScannedRef = useRef(false);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      // Stop scanner
      scannerRef.current?.clear().catch(() => null);

      // Expected URL format: /checkin/day-N or full URL containing /checkin/day-N
      try {
        let dayId: string | null = null;

        // Try to parse as URL first
        try {
          const url = new URL(decodedText);
          const match = url.pathname.match(/\/checkin\/(day-\d+)/);
          if (match) dayId = match[1];
        } catch {
          // Not a URL, try raw path
          const match = decodedText.match(/\/checkin\/(day-\d+)/);
          if (match) dayId = match[1];
          // Or just "day-N" directly
          if (!dayId && /^day-\d+$/.test(decodedText.trim())) {
            dayId = decodedText.trim();
          }
        }

        if (dayId) {
          navigate(`/checkin/${dayId}`);
        } else {
          setError(
            "This QR code doesn't look like a Camp Fire code. Try again.",
          );
          hasScannedRef.current = false;
        }
      } catch {
        setError('Could not read that QR code. Try again.');
        hasScannedRef.current = false;
      }
    },
    [navigate],
  );

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      QR_REGION_ID,
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
        aspectRatio: 1.0,
      },
      false,
    );

    scanner.render(handleScanSuccess, (errorMsg) => {
      if (errorMsg.includes('Permission')) {
        setPermissionDenied(true);
      }
    });

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => null);
    };
  }, [handleScanSuccess]);

  return (
    <div className='flex flex-col min-h-full px-5 py-6'>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-6'>
        <h1 className='text-2xl font-black text-text-primary'>
          Scaneaza QR Code
        </h1>
        <p className='text-text-secondary text-sm mt-1'>
          Gaseste codul QR ascuns si scaneaza-l pentru a mentine streak-ul.
        </p>
      </motion.div>

      {permissionDenied ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex flex-col items-center justify-center flex-1 text-center gap-4'>
          <span className='text-5xl'>📷</span>
          <h2 className='text-xl font-bold text-text-primary'>
            Accesul la camera a fost refuzat
          </h2>
          <p className='text-text-secondary text-sm max-w-xs'>
            Te rugam sa permiti accesul la camera pentru a scanea codul QR.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant='secondary'>
            Incearca din nou
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className='flex flex-col gap-4'>
          {/* Scanner container */}
          <div className='relative rounded-2xl overflow-hidden bg-surface-900 border border-surface-700'>
            <div
              id={QR_REGION_ID}
              className='w-full'
            />

            {/* Corner markers overlay */}
            <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
              <div className='relative w-48 h-48'>
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(
                  (pos) => (
                    <div
                      key={pos}
                      className={`absolute w-8 h-8 border-fire-400 ${
                        pos === 'top-left'
                          ? 'top-0 left-0 border-t-2 border-l-2'
                          : pos === 'top-right'
                            ? 'top-0 right-0 border-t-2 border-r-2'
                            : pos === 'bottom-left'
                              ? 'bottom-0 left-0 border-b-2 border-l-2'
                              : 'bottom-0 right-0 border-b-2 border-r-2'
                      }`}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-red-900/30 border border-red-800/50 rounded-xl p-3'>
              <p className='text-red-300 text-sm'>{error}</p>
            </motion.div>
          )}

          <p className='text-text-muted text-xs text-center'>
            🔍 Indreapta camera catre codul QR pentru a scana
          </p>
        </motion.div>
      )}
    </div>
  );
}
