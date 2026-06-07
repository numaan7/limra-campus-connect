import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ApplicationSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  course_ids: z.array(z.string().uuid()).min(1).max(20),
});

export const Route = createFileRoute("/api/public/applications")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const parsed = ApplicationSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: "Invalid input" }),
            { status: 400, headers: { "content-type": "application/json" } },
          );
        }
        const data = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Verify all course_ids reference active courses to prevent garbage data.
        const { data: validCourses, error: coursesErr } = await supabaseAdmin
          .from("courses")
          .select("id")
          .in("id", data.course_ids)
          .eq("is_active", true);
        if (coursesErr) {
          return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        const validIds = (validCourses ?? []).map((c) => c.id);
        if (validIds.length === 0) {
          return new Response(JSON.stringify({ error: "No valid courses selected" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const { data: app, error: appErr } = await supabaseAdmin
          .from("applications")
          .insert({
            full_name: data.full_name,
            phone: data.phone,
            email: data.email ? data.email : null,
            message: data.message ? data.message : null,
            course_id: validIds[0],
          })
          .select("id")
          .single();

        if (appErr || !app) {
          return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        const { error: linkErr } = await supabaseAdmin
          .from("application_courses")
          .insert(validIds.map((cid) => ({ application_id: app.id, course_id: cid })));
        if (linkErr) {
          return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});