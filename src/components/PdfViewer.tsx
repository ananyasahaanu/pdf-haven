import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Lock,
  Loader2,
  AlertCircle,
  Maximize2,
} from "lucide-react";

// Configure pdf.js worker via CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PREVIEW_PAGE_LIMIT = 3;

interface PdfViewerProps {
  pdfUrl: string;
  purchased: boolean;
  totalPages?: number | null;
  onBuyClick: () => void;
  productTitle: string;
  price: number;
}

export function PdfViewer({
  pdfUrl,
  purchased,
  totalPages,
  onBuyClick,
  productTitle,
  price,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the PDF document
  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get auth token to pass to edge function
        const { data: { session } } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
        const headers: Record<string, string> = {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
        };
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        let response = await fetch(pdfUrl, { headers });
        
        // If edge function returns 401 (no auth), fall back to direct PDF URL
        // This happens for non-logged-in users
        if (response.status === 401 && pdfUrl.includes("/functions/v1/")) {
          // Extract product_id and try to get the PDF URL from public data
          console.warn("Edge function auth failed, falling back to public URL");
          throw new Error("Please log in to preview this PDF");
        }
        
        if (!response.ok) throw new Error("Failed to load PDF");

        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;

        if (!cancelled) {
          setPdf(pdfDoc);
          setNumPages(pdfDoc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("PDF load error:", err);
          setError(err.message || "Failed to load PDF preview");
          setLoading(false);
        }
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  // Render current page to canvas
  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current || rendering) return;

    try {
      setRendering(true);
      const page = await pdf.getPage(currentPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      setRendering(false);
    } catch (err) {
      console.error("Render error:", err);
      setRendering(false);
    }
  }, [pdf, currentPage, scale, rendering]);

  useEffect(() => {
    renderPage();
  }, [pdf, currentPage, scale]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enforce page limit for non-purchasers
  const maxAllowedPage = purchased ? numPages : Math.min(PREVIEW_PAGE_LIMIT, numPages);

  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToNext = () => {
    if (currentPage < maxAllowedPage) setCurrentPage((p) => p + 1);
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1.5);

  const displayTotalPages = totalPages || numPages;
  const isRestricted = !purchased && numPages > PREVIEW_PAGE_LIMIT;

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex items-center justify-center h-[500px] bg-secondary/30">
          <div className="text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground font-medium">
              Loading PDF preview...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex items-center justify-center h-[300px] bg-secondary/30">
          <div className="text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-0">
      {/* Navigation Toolbar */}
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-border bg-card px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToPrev}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5 px-2">
            <span className="text-sm font-medium tabular-nums">
              {currentPage}
            </span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {maxAllowedPage}
            </span>
            {isRestricted && (
              <Badge
                variant="secondary"
                className="ml-1 text-[10px] px-1.5 py-0"
              >
                of {displayTotalPages} total
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToNext}
            disabled={currentPage >= maxAllowedPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs tabular-nums"
            onClick={resetZoom}
          >
            {Math.round(scale * 100)}%
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={zoomIn}
            disabled={scale >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (canvasRef.current) {
                canvasRef.current.requestFullscreen?.();
              }
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className="relative overflow-auto rounded-b-xl border border-border bg-muted/30"
        style={{ maxHeight: "600px" }}
      >
        <div className="flex justify-center p-4 min-h-[400px]">
          {rendering && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="shadow-lg rounded"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </div>

      {/* Restricted notice - show when on last allowed page */}
      {isRestricted && currentPage === maxAllowedPage && (
        <div className="mt-4 rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <div>
            <p className="font-display font-semibold text-lg">
              Preview ends here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You're viewing {maxAllowedPage} of {displayTotalPages} pages. Purchase
              to unlock the full PDF.
            </p>
          </div>
          <Button
            className="gradient-bg text-primary-foreground border-0 premium-shadow"
            onClick={onBuyClick}
          >
            Buy Now - ৳{price}
          </Button>
        </div>
      )}
    </div>
  );
}
