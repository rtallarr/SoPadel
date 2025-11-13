import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pin } = await req.json();

  if (pin === process.env.ADMIN_PIN) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_pin", pin, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
}