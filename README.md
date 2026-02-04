# rangotsavvy

## Confirmation email (Azure Communication Services)

After a booking is confirmed, a ticket email is sent with subject **"Here's your ticket."** and the QR code image in the body. It uses Azure Communication Services with your custom domain.

Add to `.env.local`:

- **`AZURE_COMMUNICATION_CONNECTION_STRING`** – From Azure Portal → your Communication Services resource → Keys. Format: `endpoint=https://<resource>.communication.azure.com/;accesskey=<key>`
- **`AZURE_EMAIL_FROM`** – Sender address from your verified custom domain (e.g. `DoNotReply@yourdomain.com`). The **local part** (e.g. `DoNotReply`) must be one of the sender usernames you’ve added in Azure: Email Communication Services → Domains → your domain → manage sender addresses.

**Optional – ticket background:** To show the QR code on your ticket design in the email, add your ticket artwork as `public/email-ticket-bg.png`. The QR will be composited onto the center of that image (scaled to ~42% of the smaller dimension). If the file is missing, the email still sends with just the QR code.

Then install dependencies and run:

```bash
pnpm install
```
