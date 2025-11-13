import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import QrScannerWorkerPath from "qr-scanner/qr-scanner-worker.min.js?url";
import { cn } from "@/lib/utils";

QrScanner.WORKER_PATH = QrScannerWorkerPath;

type QRScannerProps = {
  onDecode: (value: string) => void;
  onError?: (error: unknown) => void;
  className?: string;
};

export const QRScanner = ({ onDecode, onError, className }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const scanner = new QrScanner(
      video,
      (result) => {
        if (result?.data) {
          onDecode(result.data);
        }
      },
      {
        preferredCamera: "environment",
        onDecodeError: (error) => {
          onError?.(error);
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerRef.current = scanner;

    scanner
      .start()
      .catch((error) => {
        onError?.(error);
      });

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [onDecode, onError]);

  return <video ref={videoRef} className={cn("w-full rounded-lg", className)} muted playsInline />;
};

export default QRScanner;

