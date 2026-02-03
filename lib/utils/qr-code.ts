import QRCode from "qrcode"

export interface TicketDetail {
  bookingId: string
  ticketType: string
  quantity: number
  price: number
}

export interface BookingQRData {
  bookingIds: string[]
  visitorName: string
  visitorEmail: string
  tickets: TicketDetail[]
  totalPrice: number
  date?: string
  time?: string
  endTime?: string
  eventName?: string
  status: string
}

/**
 * Generate QR code data URL from booking details
 */
export async function generateBookingQRCode(bookingData: BookingQRData): Promise<string> {
  // Create JSON string with all booking details
  const qrData = JSON.stringify(bookingData, null, 2)

  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H", // High error correction for better scanning
    })

    return dataUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw error
  }
}

/**
 * Parse QR code data back to booking details
 */
export function parseBookingQRData(qrData: string): BookingQRData | null {
  try {
    return JSON.parse(qrData) as BookingQRData
  } catch (error) {
    console.error("Error parsing QR code data:", error)
    return null
  }
}
