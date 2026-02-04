import { type NextRequest, NextResponse } from "next/server";
import { EmailClient } from "@azure/communication-email";

const INLINE_QR_CONTENT_ID = "qrcode";

/**
 * Azure EmailClient expects connection string format:
 * endpoint=https://<resource>.communication.azure.com/;accesskey=<key>
 * If the env var is pasted as "https://...;accesskey=...", normalize it.
 */
function normalizeConnectionString(s: string): string {
  const trimmed = s.trim();
  if (trimmed.toLowerCase().startsWith("endpoint=")) return trimmed;
  if (trimmed.startsWith("http") && trimmed.includes(";accesskey=")) {
    return `endpoint=${trimmed}`;
  }
  return trimmed;
}

/**
 * Parse a data URL (e.g. data:image/png;base64,...) into contentType and base64 content.
 */
function parseDataUrl(dataUrl: string): { contentType: string; base64: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { contentType: match[1].trim(), base64: match[2].trim() };
}

export async function POST(request: NextRequest) {
  try {
    const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
    const senderAddress = process.env.AZURE_EMAIL_FROM;

    if (!connectionString || !senderAddress) {
      console.error(
        "Missing Azure email config: AZURE_COMMUNICATION_CONNECTION_STRING and AZURE_EMAIL_FROM must be set"
      );
      return NextResponse.json(
        {
          success: false,
          error: "Email service is not configured.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { to, visitorName, qrCodeDataUrl } = body as {
      to: string;
      visitorName?: string;
      qrCodeDataUrl: string;
    };

    if (!to || typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { success: false, error: "Valid 'to' email is required." },
        { status: 400 }
      );
    }

    if (!qrCodeDataUrl || typeof qrCodeDataUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "QR code image (qrCodeDataUrl) is required." },
        { status: 400 }
      );
    }

    const parsed = parseDataUrl(qrCodeDataUrl);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Invalid QR code data URL." },
        { status: 400 }
      );
    }

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.5rem; color: #111;">Here's your ticket.</h1>
  <p style="color: #444;">Hi${visitorName ? ` ${visitorName}` : ""},</p>
  <p style="color: #444;">Please show this QR code at the venue entrance.</p>
  <p style="margin: 24px 0;">
    <img src="cid:${INLINE_QR_CONTENT_ID}" alt="Booking QR Code" width="240" height="240" style="display: block; margin: 0 auto;" />
  </p>
  <p style="color: #666; font-size: 0.875rem;">See you at Rangotsav – 4th March, 2026!</p>
</body>
</html>
`.trim();

    const client = new EmailClient(normalizeConnectionString(connectionString));

    const message = {
      senderAddress,
      content: {
        subject: "Here's your ticket.",
        html: htmlBody,
      },
      recipients: {
        to: [{ address: to, displayName: visitorName || undefined }],
      },
      attachments: [
        {
          name: "ticket-qr.png",
          contentType: parsed.contentType,
          contentInBase64: parsed.base64,
          contentId: INLINE_QR_CONTENT_ID,
        },
      ],
    };

    const poller = await client.beginSend(message);
    await poller.pollUntilDone();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Send ticket email error:", error);

    const err = error as { code?: string; message?: string };
    const isInvalidSender =
      err?.code === "InvalidSenderUserName" || err?.message?.includes("Invalid email sender username");

    if (isInvalidSender) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AZURE_EMAIL_FROM sender is not allowed. In Azure Portal go to your Email Communication Services resource → Domains → your domain → add the sender address (e.g. DoNotReply) and set AZURE_EMAIL_FROM to that address (e.g. DoNotReply@yourdomain.com).",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email.",
      },
      { status: 500 }
    );
  }
}
