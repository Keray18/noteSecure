import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/getUser"
import { shareSchema } from "@/validation/share"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"


export async function POST(request: Request, { params }: { params: Promise<{ noteId: string }>}) {
    try {
        const userId = await getCurrentUserId()
        if(!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized access"
            }, {
                status: 401
            })
        }

        const { noteId } = await params

        const note = await prisma.note.findFirst({
            where: {
                id: noteId,
                ownerId: userId
            }
        })

        if (!note) {
            return NextResponse.json(
                { success: false, message: "Note not found" },
                { status: 404 }
            );
        }

        const body = await request.json()

        const result = shareSchema.safeParse(body)

        if(!result.success) {
            return NextResponse.json(
                {
                success: false,
                message: result.error.issues[0].message,
                },
                { status: 400 }
            )
        }

        const { shareType, accessType, expiresAt, password } = result.data

        let hashedPassword: string | null=null

        if(accessType === "PASSWORD") {
            if(!password) {
                return NextResponse.json({
                    success: false,
                    message: "Password Required!"
                }, {
                    status: 400
                })
            }
            hashedPassword = await bcrypt.hash(password, 10)
        }

        const token = uuid()

        const shareLink = await prisma.shareLink.create({
            data: {
                noteId,
                token,
                shareType,
                accessType,
                hashedPassword,
                expiresAt: expiresAt ?  new Date(expiresAt) : null 
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                token: shareLink.token,
                url: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareLink.token}`,
                generatedPassword: accessType === "PASSWORD" ? password : null
            }
        })
        
    } catch (err) {
        console.error(err)

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