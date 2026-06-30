import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validation/auth";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        const body = await request.json()
        const result = registerSchema.safeParse(body)

        if(!result.success) {
            return NextResponse.json(
                {
                success: false,
                message: result.error.issues[0].message
            },
            {
                status: 400
            }
        )
        }

        const { name, email, password } = result.data

        const userExists = await prisma.user.findUnique({
            where: { email }
        })
        if (userExists) {
        return NextResponse.json(
            {
            success: false,
            message: "Email already registered",
            },
            {
            status: 409,
            }
        )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully",
                data: {
                    name: user.name,
                    email: user.email
                },
            },
            {
                status: 201,
            }
        )
    
    } catch(err) {
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