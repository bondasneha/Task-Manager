// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

interface Task {
  _id?: ObjectId;
  title: string;
  description?: string;
  completed?: boolean;
  status?: string;
  userId: string; // we're using the email as ID here
  createdAt: Date;
}

interface TaskBody {
  id?: string;
  title?: string;
  description?: string;
  completed?: boolean;
  status?: string;
}

// ✅ Helper to get logged-in user's email
async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  return session.user.email;
}

// 📥 GET — Fetch all tasks of logged in user
export async function GET() {
  try {
    const userId = await getSessionUserId();
    const client = await clientPromise;
    const tasks = await client
      .db("myVirtualDatabase")
      .collection<Task>("tasks")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tasks);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// ➕ POST — Create a new task
export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    const { title, description, completed } = (await req.json()) as TaskBody;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const result = await client
      .db("myVirtualDatabase")
      .collection<Task>("tasks")
      .insertOne({
        title: title.trim(),
        description: description?.trim() || "",
        completed: completed || false,
        userId,
        createdAt: new Date(),
      });

    return NextResponse.json({ success: true, taskId: result.insertedId });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to create task" },
      { status: 500 }
    );
  }
}

// ✏️ PUT — Update a task
export async function PUT(req: Request) {
  try {
    const userId = await getSessionUserId();
    const { id, title, description, completed, status } = (await req.json()) as TaskBody;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const result = await client
      .db("myVirtualDatabase")
      .collection<Task>("tasks")
      .updateOne(
        { _id: new ObjectId(id), userId },
        { $set: { title, description, completed, status } }
      );

    return NextResponse.json({ success: result.modifiedCount > 0 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update task" },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE — Remove a task
export async function DELETE(req: Request) {
  try {
    const userId = await getSessionUserId();
    const { id } = (await req.json()) as { id?: string };

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const result = await client
      .db("myVirtualDatabase")
      .collection<Task>("tasks")
      .deleteOne({ _id: new ObjectId(id), userId });

    return NextResponse.json({ success: result.deletedCount > 0 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Failed to delete task" },
      { status: 500 }
    );
  }
}
