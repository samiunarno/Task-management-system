import { useEffect, useRef } from 'react';
import * as Html5QrcodeModule from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeModule.Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeModule.Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-surface-container border border-outline-variant/30 rounded-2xl aspect-[4/3] flex flex-col justify-center font-body shadow-inner">
      <div id="qr-reader" className="w-full text-on-surface [&_button]:bg-primary [&_button]:text-on-primary [&_button]:px-6 [&_button]:py-3 [&_button]:mt-4 [&_button]:rounded-xl [&_a]:hidden [&_button]:font-bold [&_button]:transition-colors [&_button:hover]:bg-primary/90 [&_video]:w-full [&_video]:rounded-xl"></div>
    </div>
  );
}
