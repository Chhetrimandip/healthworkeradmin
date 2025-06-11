import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { org: string } }
) {
  try {
    const organization = decodeURIComponent(params.org);
    
    if (!organization) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    const members = await prisma.person.findMany({
      where: {
        affiliatedOrganization: organization
      },
      orderBy: {
        joinDate: 'desc'
      }
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization members" },
      { status: 500 }
    );
  }
}