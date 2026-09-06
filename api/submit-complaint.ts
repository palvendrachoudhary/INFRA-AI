import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const webhookUrl = process.env.COMPLAINT_WEBHOOK_URL;
    
    if (!webhookUrl || webhookUrl.includes("PASTE_YOUR_VIASOCKET_WEBHOOK_URL_HERE")) {
      return res.status(200).json({ 
        status: "simulated_success", 
        message: "Webhook not configured on Vercel.",
        data: req.body 
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Webhook error: ${errorText}` });
    }

    return res.status(200).json({ status: "success" });
  } catch (error: any) {
    console.error("[Vercel Proxy] Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
