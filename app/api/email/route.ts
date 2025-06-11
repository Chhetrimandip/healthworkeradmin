import { NextRequest, NextResponse } from "next/server";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, name, organization } = await req.json();

    if (!email || !name || !organization) {
      return NextResponse.json(
        { error: "Email, name, and organization are required" },
        { status: 400 }
      );
    }

    const result = await sendPaymentConfirmationEmail(email, name, organization);

    if (!result.success) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({
      success: true,
      message: "Payment confirmation email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}