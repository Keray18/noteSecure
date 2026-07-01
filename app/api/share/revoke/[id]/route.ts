import { getCurrentUserId } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request,{ params }: { params: Promise<{ id: string }> }){
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    const shareLink = await prisma.shareLink.findFirst({
      where: {
        id,
        note: {
          ownerId: userId,
        },
      },
    })

    if (!shareLink) {
      return NextResponse.json(
        {
          success: false,
          message: "Share Link not found",
        },
        {
          status: 404,
        }
      )
    }

    if (shareLink.revoked) {
      return NextResponse.json(
        {
          success: false,
          message: "Share Link already revoked",
        },
        {
          status: 400,
        }
      )
    }

    await prisma.shareLink.update({
      where: {
        id,
      },
      data: {
        revoked: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Share Link revoked successfully",
    })

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    )
  }
}