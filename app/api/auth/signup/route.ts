import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth/password";

const SignupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = SignupSchema.parse(json);

    await connectDB();
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) return NextResponse.json({ ok: false, error: "Email already registered" }, { status: 400 });

    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      whatsapp: data.phone,
      role: "client",
    });

    return NextResponse.json({ ok: true, userId: user._id.toString() });
  } catch (e: any) {
    const msg = e?.errors?.[0]?.message || e?.message || "Signup failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

