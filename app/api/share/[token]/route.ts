import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: Request,{ params }: { params: Promise<{ token: string }> }){
  return await prisma.$transaction(async (tx) => {
    const { token } = await params;

    const body = await request.json().catch(() => ({}));
    const password = body.password;

    const shareLink = await tx.shareLink.findUnique({
      where: {
        token,
      },
      include: {
        note: true,
      },
    });

    if (!shareLink) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Share Link",
        },
        {
          status: 404,
        }
      );
    }

    if (shareLink.revoked) {
      return NextResponse.json(
        {
          success: false,
          message: "Link Revoked",
        },
        {
          status: 410,
        }
      );
    }

    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Link Expired",
        },
        {
          status: 410,
        }
      );
    }

    if (shareLink.accessType === "PASSWORD") {
      if (!password) {
        return NextResponse.json(
          {
            success: false,
            message: "Password Required",
          },
          {
            status: 401,
          }
        );
      }

      const isCorrect = await bcrypt.compare(
        password,
        shareLink.passwordHash!
      );

      if (!isCorrect) {
        return NextResponse.json(
          {
            success: false,
            message: "Incorrect Password",
          },
          {
            status: 401,
          }
        );
      }
    }

    if (shareLink.shareType === "ONE_TIME") {
      const updated = await tx.shareLink.updateMany({
        where: {
          id: shareLink.id,
          used: false,
        },
        data: {
          used: true,
          viewCount: {
            increment: 1,
          },
        },
      });

      if (updated.count === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Link already used",
          },
          {
            status: 410,
          }
        );
      }
    } else {
      await tx.shareLink.update({
        where: {
          id: shareLink.id,
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        title: shareLink.note.title,
        content: shareLink.note.content,
      },
    });
  });
}