// app/api/forms/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // No authentication check - this is a simplification
        const forms = await prisma.joinForm.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        console.log(`FORMS API: Found ${forms.length} forms`);
        return NextResponse.json({ forms });
    } catch (error) {
        console.error("FORMS API: Error fetching forms:", error);
        return NextResponse.json(
            { error: "Failed to fetch forms" },
            { status: 500 }
        );
    }
}