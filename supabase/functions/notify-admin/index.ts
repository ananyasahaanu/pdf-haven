import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customer_name, product_title, product_price, payment_method, transaction_id } = await req.json();

    const results: Record<string, string> = {};

    // --- Email via Resend ---
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PDFStore <onboarding@resend.dev>',
            to: [ADMIN_EMAIL],
            subject: `New Purchase Request: ${product_title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6366f1;">🛒 New Purchase Request</h2>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 16px 0;">
                  <p><strong>Customer:</strong> ${customer_name}</p>
                  <p><strong>Product:</strong> ${product_title}</p>
                  <p><strong>Price:</strong> ৳${product_price}</p>
                  <p><strong>Payment:</strong> ${payment_method}</p>
                  <p><strong>Transaction ID:</strong> ${transaction_id}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Log in to your admin panel to approve or reject this request.</p>
              </div>
            `,
          }),
        });
        const emailData = await emailRes.json();
        results.email = emailRes.ok ? 'sent' : `failed: ${JSON.stringify(emailData)}`;
      } catch (e) {
        results.email = `error: ${e.message}`;
      }
    } else {
      results.email = 'skipped (no RESEND_API_KEY or ADMIN_EMAIL)';
    }

    // --- Slack via Connector Gateway ---
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SLACK_API_KEY = Deno.env.get('SLACK_API_KEY');
    const SLACK_CHANNEL = Deno.env.get('SLACK_CHANNEL') || '#general';
    if (LOVABLE_API_KEY && SLACK_API_KEY) {
      try {
        const GATEWAY_URL = 'https://connector-gateway.lovable.dev/slack/api';
        const slackRes = await fetch(`${GATEWAY_URL}/chat.postMessage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': SLACK_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: SLACK_CHANNEL,
            text: `🛒 *New Purchase Request*\n• Customer: ${customer_name}\n• Product: ${product_title}\n• Price: ৳${product_price}\n• Payment: ${payment_method}\n• TXN: ${transaction_id}`,
          }),
        });
        const slackData = await slackRes.json();
        results.slack = slackRes.ok && slackData.ok ? 'sent' : `failed: ${JSON.stringify(slackData)}`;
      } catch (e) {
        results.slack = `error: ${e.message}`;
      }
    } else {
      results.slack = 'skipped (no SLACK credentials)';
    }

    console.log('Notification results:', results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
