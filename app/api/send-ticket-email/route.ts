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
 * Email HTML aligned with the website design: white background, gray scale,
 * Helvetica, bold headings, gray-200 borders, rounded-lg card for the ticket.
 */
function buildTicketEmailHtml(
  visitorName?: string,
  imageContentId: string = "ticket",
  isComposite: boolean = false
): string {
  const imgWidth = isComposite ? "400" : "240";
  const imgHeight = isComposite ? "560" : "240";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Here's your ticket</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 32px 24px 24px;">
        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.025em; line-height: 1.2;">
          Here's your ticket
        </h1>
        <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
          Hi${visitorName ? ` ${visitorName}` : ""}, your booking is confirmed. Show this at the venue entrance.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 24px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
          <tr>
            <td align="center">
              <img src="cid:${imageContentId}" alt="Your ticket" width="${imgWidth}" height="${imgHeight}" style="display: block; max-width: 100%; height: auto; border-radius: 8px;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 24px 24px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #111827; font-weight: 600;">
          Rangotsav – 4th March, 2026
        </p>
        <p style="margin: 6px 0 0 0; font-size: 14px; color: #6b7280;">
          White Feather, Electronic City, Bangalore
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 24px 32px;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          See you there.
        </p>
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
