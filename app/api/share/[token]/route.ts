import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  return await prisma.$transaction(async (tx) => {
    const { token } = await params;

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
        { status: 404 }
      );
    }

    if (shareLink.revoked) {
      return NextResponse.json(
        {
          success: false,
          message: "Link Revoked",
        },
        { status: 410 }
      );
    }

    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Link Expired",
        },
        { status: 410 }
      );
    }

    // Password protected -> Ask frontend for password
    if (shareLink.accessType === "PASSWORD") {
      return NextResponse.json({
        success: true,
        requiresPassword: true,
      });
    }

    // One Time Link
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
          { status: 410 }
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


export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  return await prisma.$transaction(async (tx) => {
    const { token } = await params;

    const body = await request.json().catch(() => ({}));
    const { password } = body;

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
        { status: 404 }
      );
    }

    if (shareLink.revoked) {
      return NextResponse.json(
        {
          success: false,
          message: "Link Revoked",
        },
        { status: 410 }
      );
    }

    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Link Expired",
        },
        { status: 410 }
      );
    }

    if (shareLink.accessType !== "PASSWORD") {
      return NextResponse.json(
        {
          success: false,
          message: "This is not a password protected link",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password Required",
        },
        { status: 400 }
      );
    }

    if (!shareLink.hashedPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Password not configured",
        },
        { status: 500 }
      );
    }

    const isCorrect = await bcrypt.compare(
      password,
      shareLink.hashedPassword
    );

    if (!isCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect Password",
        },
        { status: 401 }
      );
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
          { status: 410 }
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