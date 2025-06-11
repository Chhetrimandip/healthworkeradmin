import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    // Find the form
    const form = await prisma.joinForm.findUnique({
      where: { id }
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Check if already approved
    if (form.approved) {
      return NextResponse.json({ error: "Form already approved" }, { status: 400 });
    }

    // Transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create person record
      const person = await tx.person.create({
        data: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          affiliatedOrganization: form.organizationToJoin,
          joinDate: new Date()
        }
      });

      // 2. Update the form
      const updatedForm = await tx.joinForm.update({
        where: { id },
        data: {
          approved: true,
          approvedAt: new Date(),
          personId: person.id
        }
      });

      return { person, form: updatedForm };
    });

    return NextResponse.json({ 
      success: true, 
      message: "Form approved successfully",
      personId: result.person.id
    });

  } catch (error) {
    console.error("Error approving form:", error);
    return NextResponse.json(
      { error: "Failed to approve form" },
      { status: 500 }
    );
  }
}