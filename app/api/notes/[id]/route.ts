import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/getUser"
import { NextResponse } from "next/server"
import { success } from "zod"


export async function GET(request: Request, { params }: { params: Promise<{id: string }>}) {
    try {
        const userId = await getCurrentUserId()

        if(!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized Access"
            }, {
                status: 401 
            })
        }

        const { id } = await params
        const note = await prisma.note.findFirst({
            where: {
                id,
                ownerId: userId,
            },
            include: {
                shares: true
            }
        })

        if(!note) {
            return NextResponse.json({
                success: false,
                message: "Note not found."
            }, {
                status: 404
            })
        }

        return NextResponse.json({
            success: true,
            data: note
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


export async function DELETE(request: Request, { params }: { params: Promise<{id: string }>}) {
    try {
        const userId = await getCurrentUserId()
        if(!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized Access"
            }, {
                status: 401 
            })
        }

        const { id } = await params 

        const note = await prisma.note.findFirst({
            where: {
                id,
                ownerId: userId,
            },
        })

        if(!note) {
            return NextResponse.json({
                success: false,
                message: "Note not found."
            }, {
                status: 404
            })
        }

        await prisma.note.delete({
            where: {
                id,
            },
        })

        return NextResponse.json({
            success: true,
            message: "Note Deleted",
        });
    
    } catch(err) {
        console.error(err)

        return NextResponse.json({
            success: false,
            message: "Something went wrong."
        }, {
            status: 500
        })
    }
}