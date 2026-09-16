"use client";

import { getSupabase } from "./supabase";

// Cloud sync for likes / subscriptions / comments.
// Every function no-ops (returns null) when Supabase isn't configured
// or there's no session — callers keep using localStorage then.

export async function cloudGetLikes() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await sb.from("likes").select("video_id,value").eq("user_id", user.id);
  if (error) return null;
  const map = {};
  data.forEach((r) => (map[r.video_id] = r.value));
  return map;
}

export async function cloudSetLike(videoId, value) {
  const sb = getSupabase();
  if (!sb) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  if (!value) {
    await sb.from("likes").delete().eq("user_id", user.id).eq("video_id", String(videoId));
  } else {
    await sb.from("likes").upsert(
      { user_id: user.id, video_id: String(videoId), value },
      { onConflict: "user_id,video_id" }
    );
  }
}

export async function cloudGetSubs() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await sb.from("subscriptions").select("channel").eq("user_id", user.id);
  if (error) return null;
  return data.map((r) => r.channel);
}

export async function cloudToggleSub(channel, subscribed) {
  const sb = getSupabase();
  if (!sb) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  if (subscribed) {
    await sb.from("subscriptions").upsert(
      { user_id: user.id, channel },
      { onConflict: "user_id,channel" }
    );
  } else {
    await sb.from("subscriptions").delete().eq("user_id", user.id).eq("channel", channel);
  }
}

export async function cloudGetComments(videoId) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("comments")
    .select("id,user_name,text,created_at")
    .eq("video_id", String(videoId))
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return null;
  return data.map((r) => ({
    id: r.id,
    user: r.user_name || "Someone",
    time: new Date(r.created_at).toLocaleDateString(),
    text: r.text,
    likes: 0,
  }));
}

export async function cloudPostComment(videoId, text) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const name = user.email?.split("@")[0] || "Someone";
  const { data, error } = await sb
    .from("comments")
    .insert({ user_id: user.id, user_name: name, video_id: String(videoId), text })
    .select("id,user_name,text,created_at")
    .single();
  if (error) return null;
  return {
    id: data.id,
    user: data.user_name,
    time: "just now",
    text: data.text,
    likes: 0,
  };
}
