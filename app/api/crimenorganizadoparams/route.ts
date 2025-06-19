import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET (req: NextRequest) {
    try {
        const paramsCrimenOrg = await prisma.crimenOrganizadoParams.findMany({
            select: {
                value: true,
                label: true,

            }
        });
        return NextResponse.json(paramsCrimenOrg);
    } catch (error) {
        console.error('Error fetching parámetros: ', error);
        return NextResponse.json(
            { error: 'Error fetchin parámetros' },
            { status: 500 }
        );
    }
}