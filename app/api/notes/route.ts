import { NextResponse } from "next/server";
import {
  createSupabaseClient,
  getUserFromRequest,
} from "@/lib/supabase-server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  const authHeader = request.headers.get("Authorization")!;
  const token = authHeader.slice(7);
  const supabase = createSupabaseClient(token);

  const { data, error } = await supabase
    .from("notes")
    .select("id, user_id, content, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  let body: { content?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = body.content?.trim();

  if (!content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get("Authorization")!;
  const token = authHeader.slice(7);
  const supabase = createSupabaseClient(token);

  const { data, error } = await supabase
    .from("notes")
    .insert({ user_id: user.id, content })
    .select("id, user_id, content, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note: data }, { status: 201 });
}
