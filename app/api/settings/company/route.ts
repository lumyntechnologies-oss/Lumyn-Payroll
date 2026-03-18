import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let company = await prisma.companyProfile.findFirst();
    
    if (!company) {
      company = await prisma.companyProfile.create({
        data: {
          name: "Your Company",
          registrationNumber: "",
          kraPin: "",
          nssfNumber: "",
          nhifNumber: "",
          address: "",
          city: "",
          country: "Kenya",
          phone: "",
          email: "",
        },
      });
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Company profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, registrationNumber, kraPin, nssfNumber, nhifNumber, shilNumber, address, city, country, phone, email, logo } = body;

    if (!name || !registrationNumber || !kraPin) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, registrationNumber, kraPin" },
        { status: 400 }
      );
    }

    let company = await prisma.companyProfile.findFirst();

    if (company) {
      company = await prisma.companyProfile.update({
        where: { id: company.id },
        data: {
          name,
          registrationNumber,
          kraPin,
          nssfNumber,
          nhifNumber,
          shilNumber,
          address,
          city,
          country,
          phone,
          email,
          logo,
        },
      });
    } else {
      company = await prisma.companyProfile.create({
        data: {
          name,
          registrationNumber,
          kraPin,
          nssfNumber,
          nhifNumber,
          shilNumber,
          address,
          city,
          country,
          phone,
          email,
          logo,
        },
      });
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Company profile update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update company profile" },
      { status: 500 }
    );
  }
}
