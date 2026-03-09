import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PREVIEW_PAGES = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("product_id");

    if (!productId) {
      return new Response(JSON.stringify({ error: "product_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get product PDF URL
    const { data: product, error: productError } = await supabase
      .from("uploaded_pdfs")
      .select("pdf_url, is_published")
      .eq("id", productId)
      .single();

    if (productError || !product || !product.is_published) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has purchased
    let hasPurchased = false;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (user) {
        const { data: purchase } = await supabase
          .from("purchase_requests")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .eq("status", "approved")
          .maybeSingle();
        hasPurchased = !!purchase;
      }
    }

    // Fetch the PDF
    const pdfResponse = await fetch(product.pdf_url);
    if (!pdfResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch PDF" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer());

    // If purchased, serve the full PDF
    if (hasPurchased) {
      return new Response(pdfBytes, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "X-Total-Pages": "all",
          "X-Preview-Restricted": "false",
        },
      });
    }

    // Restrict to first N pages using pdf-lib
    const srcDoc = await PDFDocument.load(pdfBytes);
    const totalPages = srcDoc.getPageCount();
    const pagesToCopy = Math.min(PREVIEW_PAGES, totalPages);

    const previewDoc = await PDFDocument.create();
    const copiedPages = await previewDoc.copyPages(
      srcDoc,
      Array.from({ length: pagesToCopy }, (_, i) => i)
    );
    copiedPages.forEach((page) => previewDoc.addPage(page));

    const previewBytes = await previewDoc.save();

    return new Response(previewBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "X-Total-Pages": String(totalPages),
        "X-Preview-Pages": String(pagesToCopy),
        "X-Preview-Restricted": "true",
      },
    });
  } catch (error) {
    console.error("Preview PDF error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
