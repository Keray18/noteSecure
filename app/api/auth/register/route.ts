import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validation/auth";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";