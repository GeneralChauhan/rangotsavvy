import sharp from "sharp";
import path from "path";
import fs from "fs";

/**
 * Composites the QR code onto the ticket background image so the email can show
 * a single "ticket" image. Expects the background at public/email-ticket-bg.png
 * (or the path you pass). QR is centered and scaled to ~42% of the smaller
 * dimension so it fits the typical placeholder area.
 */
export async function compositeQROntoTicketBackground(
  qrBase64: string,
  ticketBgPath?: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const bgPath =
    ticketBgPath ?? path.join(process.cwd(), "public", "email-ticket-bg.png");
  if (!fs.existsSync(bgPath)) return null;

  try {
    const bg = sharp(bgPath);
    const meta = await bg.metadata();
    const bgWidth = meta.width ?? 800;
    const bgHeight = meta.height ?? 1200;

    const qrSize = Math.round(Math.min(bgWidth, bgHeight) * 0.42);
    const left = Math.round((bgWidth - qrSize) / 2);
    const top = Math.round((bgHeight - qrSize) / 2);

    const qrBuffer = Buffer.from(qrBase64, "base64");
    const qrResized = await sharp(qrBuffer)
      .resize(qrSize, qrSize)
      .png()
      .toBuffer();

    const out = await sharp(bgPath)
      .composite([{ input: qrResized, left, top }])
      .png()
      .toBuffer();

    return { buffer: out, contentType: "image/png" };
  } catch {
    return null;
  }
}
