import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '@/components/ui';

export function QRScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const hasScannedRef = useRef(false);

  async function startScanner() {
    setError(null);
    setScanning(true);
    hasScannedRef.current = false;

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Camera din spate explicit
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      reader.decodeFromStream(stream, videoRef.current!, (result, err) => {
        if (result && !hasScannedRef.current) {
          hasScannedRef.current = true;
          stopScanner();

          const decodedText = result.getText();
          let dayId: string | null = null;

          try {
            const url = new URL(decodedText);
            const match = url.pathname.match(/\/checkin\/(day-\d+)/);
            if (match) dayId = match[1];
          } catch {
            const match = decodedText.match(/\/checkin\/(day-\d+)/);
            if (match) dayId = match[1];
            if (!dayId && /^day-\d+$/.test(decodedText.trim())) {
              dayId = decodedText.trim();
            }
          }

          if (dayId) {
            navigate(`/checkin/${dayId}`);
          } else {
            setError('Codul QR nu este valid. Încearcă din nou.');
            hasScannedRef.current = false;
            setScanning(false);
          }
        }

        // Ignoră erorile de decodare — sunt normale când nu e QR în cadru
        void err;
      });
    } catch (err) {
      setScanning(false);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setPermissionDenied(true);
      } else {
        setError('Nu s-a putut accesa camera. Încearcă din nou.');
      }
    }
  }

  function stopScanner() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    readerRef.current = null;
    setScanning(false);
  }

  function onTryAgain() {
    setPermissionDenied(false);
    startScanner();
  }

  // Oprește camera când părăsești pagina
  useEffect(() => {
    return () => stopScanner();
  }, []);

  return (
    <div className='flex flex-col min-h-full px-5 py-6'>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='mb-6'>
        <h1 className='text-2xl font-black text-text-primary'>Scanează QR</h1>
        <p className='text-text-secondary text-sm mt-1'>
          Găsește codul QR ascuns și scanează-l pentru a menține streak-ul.
        </p>
      </motion.div>

      {permissionDenied ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex flex-col items-center justify-center flex-1 text-center gap-4'>
          <span className='text-5xl'>📷</span>
          <h2 className='text-xl font-bold text-text-primary'>
            Acces la cameră refuzat
          </h2>
          <p className='text-text-secondary text-sm max-w-xs'>
            Permite accesul la cameră din setările browserului și încearcă din
            nou.
          </p>
          <Button
            onClick={onTryAgain}
            variant='secondary'>
            Încearcă din nou
          </Button>
        </motion.div>
      ) : (
        <div className='flex flex-col gap-5 items-center'>
          {/* Viewfinder */}
          <div className='relative w-full rounded-3xl overflow-hidden bg-surface-900 border border-surface-700 aspect-square'>
            <video
              ref={videoRef}
              className='w-full h-full object-cover'
              muted
              playsInline
            />

            {/* Overlay când nu scanează */}
            {!scanning && (
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-900/80'>
                <span className='text-6xl'>📷</span>
                <p className='text-text-secondary text-sm'>
                  Apasă butonul pentru a scana
                </p>
              </div>
            )}

            {/* Corner markers */}
            {scanning && (
              <div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
                <div className='relative w-56 h-56'>
                  {(
                    [
                      'top-left',
                      'top-right',
                      'bottom-left',
                      'bottom-right',
                    ] as const
                  ).map((pos) => (
                    <div
                      key={pos}
                      className={`absolute w-8 h-8 border-fire-400 ${
                        pos === 'top-left'
                          ? 'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg'
                          : pos === 'top-right'
                            ? 'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg'
                            : pos === 'bottom-left'
                              ? 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg'
                              : 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg'
                      }`}
                    />
                  ))}
                  {/* Linie de scanare animată */}
                  <motion.div
                    className='absolute left-0 right-0 h-0.5 bg-fire-400/70'
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className='w-full bg-red-900/30 border border-red-800/50 rounded-xl p-3'>
              <p className='text-red-300 text-sm text-center'>{error}</p>
            </motion.div>
          )}

          {!scanning ? (
            <Button
              size='lg'
              className='w-full'
              onClick={startScanner}>
              📷 Deschide camera
            </Button>
          ) : (
            <Button
              size='lg'
              variant='secondary'
              className='w-full'
              onClick={stopScanner}>
              Oprește camera
            </Button>
          )}

          {scanning && (
            <p className='text-text-muted text-xs text-center'>
              🔍 Îndreaptă camera către codul QR
            </p>
          )}
        </div>
      )}
    </div>
  );
}
