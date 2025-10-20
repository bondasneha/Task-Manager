import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email & password required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("mydb");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) return NextResponse.json({ error: "User already exists" }, { status: 400 });

    const hashedPassword = await hash(password, 10);
    await db.collection("users").insertOne({ email, password: hashedPassword });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
