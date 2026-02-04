import { type NextRequest, NextResponse } from "next/server";
import { EmailClient } from "@azure/communication-email";
import { compositeQROntoTicketBackground } from "@/lib/utils/ticket-image";

const INLINE_TICKET_CONTENT_ID = "ticket";

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

/**
 * Festive ticket-style email HTML. Uses Rangotsav colors (pink, yellow, green).
 */
function buildTicketEmailHtml(
  visitorName?: string,
  imageContentId: string = "ticket",
  isComposite: boolean = false
): string {
  const imgWidth = isComposite ? "400" : "240";
  const imgHeight = isComposite ? "560" : "240"; // composite is portrait-ish
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%); font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 0 auto; padding: 32px 16px;">
    <tr>
      <td align="center" style="padding: 24px 0 16px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #831843; letter-spacing: 0.02em; text-shadow: 0 1px 2px rgba(0,0,0,0.06);">Here's your ticket</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 0 24px; text-align: center;">
        <p style="margin: 0; font-size: 16px; color: #4a5568; line-height: 1.5;">
          Hi${visitorName ? ` ${visitorName}` : ""}, your booking is confirmed. Show this at the entrance.
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 16px 0;">
        <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="background: #fef3c7; border-radius: 16px; padding: 20px; box-shadow: 0 4px 24px rgba(131,24,67,0.15); border: 2px solid #fcd34d;">
          <tr>
            <td align="center">
              <img src="cid:${imageContentId}" alt="Your ticket" width="${imgWidth}" height="${imgHeight}" style="display: block; max-width: 100%; height: auto; border-radius: 12px;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          <strong style="color: #15803d;">Rangotsav – 4th Holi 2026</strong><br/>
          White Feather, Electronic City, Bangalore
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 16px; border-top: 1px solid #f9a8d4;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">See you there!</p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
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

    // Optional: composite QR onto ticket background for a single ticket image
    const composite = await compositeQROntoTicketBackground(parsed.base64);
    const useComposite = !!composite;
    const imageContentId = INLINE_TICKET_CONTENT_ID;
    const imageContentType = useComposite ? composite.contentType : parsed.contentType;
    const imageBase64 = useComposite ? composite.buffer.toString("base64") : parsed.base64;
    const imageName = useComposite ? "ticket.png" : "ticket-qr.png";

    const htmlBody = buildTicketEmailHtml(visitorName, imageContentId, useComposite);

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
          name: imageName,
          contentType: imageContentType,
          contentInBase64: imageBase64,
          contentId: imageContentId,
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
