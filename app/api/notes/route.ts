import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/getUser"
import { noteSchema } from "@/validation/note"
import { NextResponse } from "next/server"
import { success } from "zod";

export async function POST(request: Request) {
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

    const body = await request.json();

    const result = noteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        {
          status: 400,
        }
      )
    }

    const note = await prisma.note.create({
      data: {
        title: result.data.title,
        content: result.data.content,
        ownerId: userId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Note created",
        data: note,
      },
      {
        status: 201,
      }
    
    )
  } catch (error) {
    console.log(error)

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


export async function GET(request: Request) {
    try {
        const userId = await getCurrentUserId()

        if(!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { 
                status: 400
            })
        }

        const notes = await prisma.note.findMany({
            where: {
                ownerId: userId
            },
            include: {
                shares: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return NextResponse.json({
            success: true,
            data: notes
        })

    } catch(err) {
        console.error(err)

        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}

