import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, UserCheck, BookOpen, Plus, Trash2, Pencil,
  GraduationCap, ClipboardList, Megaphone, MessageSquare,
} from "lucide-react";
import { createTrainerAccount } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - Limra Academy" },
      { name: "description", content: "Admin and Trainer Dashboard for Limra Academy." },
    ],
  }),
  component: DashboardPage,
});

function emptyCourse() {
  return { id: "", title: "", description: "", duration: "", price: "", category: "", is_active: true };
}
function emptyTrainer() {
  return { id: "", name: "", specialty: "", bio: "", photo_url: "", is_active: true };
}
function emptyAnnouncement() {
  return { id: "", title: "", content: "", priority: 0, is_active: true };
}
function emptyTestimonial() {
  return { id: "", name: "", text: "", rating: 5, photo_url: "", is_approved: false };
}

function DashboardPage() {
  const { user, isLoading, isAdmin, isTrainer } = useAuth();
  const [activeTab, setActiveTab] = useState("students");

  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [trainersList, setTrainersList] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [appCourses, setAppCourses] = useState<Record<string, string[]>>({});
  const [studentCourses, setStudentCourses] = useState<Record<string, string[]>>({});

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Forms
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ full_name: "", email: "", phone: "", notes: "", course_ids: [] as string[] });
  const [studentErr, setStudentErr] = useState("");

  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    email: "", password: "", full_name: "", phone: "",
    role: "trainer" as "trainer" | "admin",
  });
  const [accountMsg, setAccountMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const createTrainerFn = useServerFn(createTrainerAccount);

  const [courseForm, setCourseForm] = useState(emptyCourse());
  const [trainerForm, setTrainerForm] = useState(emptyTrainer());
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement());
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial());

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  useEffect(() => {
    if (activeTab === "attendance") loadAttendance();
  }, [selectedDate, activeTab]);

  async function loadAll() {
    const [s, a, c, ap, tm, t, an] = await Promise.all([
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("application_courses").select("*"),
      supabase.from("student_courses").select("*"),
      isAdmin ? supabase.from("trainers").select("*") : Promise.resolve({ data: [] as any[] }),
      isAdmin ? supabase.from("announcements").select("*").order("priority", { ascending: false }) : Promise.resolve({ data: [] as any[] }),
    ]);
    setStudents(s.data ?? []);
    setApplications(a.data ?? []);
    setCourses(c.data ?? []);
    setTrainersList(t.data ?? []);
    setAnnouncements(an.data ?? []);
    const ac: Record<string, string[]> = {};
    (ap.data ?? []).forEach((r: any) => { (ac[r.application_id] ||= []).push(r.course_id); });
    setAppCourses(ac);
    const sc: Record<string, string[]> = {};
    (tm.data ?? []).forEach((r: any) => { (sc[r.student_id] ||= []).push(r.course_id); });
    setStudentCourses(sc);
    if (isAdmin) {
      const { data: ts } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      setTestimonials(ts ?? []);
    }
    if (activeTab === "attendance") loadAttendance();
  }

  async function loadAttendance() {
    const { data } = await supabase.from("attendance").select("*").eq("date", selectedDate);
    setAttendance(data ?? []);
  }

  // === Students ===
  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    setStudentErr("");
    if (newStudent.course_ids.length < 1) { setStudentErr("Select at least one course."); return; }
    const { data, error } = await supabase.from("students").insert({
      full_name: newStudent.full_name,
      email: newStudent.email || null,
      phone: newStudent.phone,
      course_id: newStudent.course_ids[0],
      notes: newStudent.notes || null,
      trainer_id: user?.id,
    }).select("id").single();
    if (error || !data) { setStudentErr(error?.message ?? "Failed"); return; }
    await supabase.from("student_courses").insert(
      newStudent.course_ids.map((cid) => ({ student_id: data.id, course_id: cid })),
    );
    setNewStudent({ full_name: "", email: "", phone: "", notes: "", course_ids: [] });
    setShowAddStudent(false);
    loadAll();
  }
  async function deleteStudent(id: string) {
    if (!confirm("Delete this student?")) return;
    await supabase.from("students").delete().eq("id", id);
    loadAll();
  }

  // === Attendance ===
  async function takeAttendance(studentId: string, status: string) {
    await supabase.from("attendance").upsert(
      { student_id: studentId, date: selectedDate, status, trainer_id: user?.id },
      { onConflict: "student_id,date" },
    );
    loadAttendance();
  }

  // === Applications ===
  async function updateApplicationStatus(id: string, status: string) {
    await supabase.from("applications").update({ status }).eq("id", id);
    loadAll();
  }
  async function deleteApplication(id: string) {
    if (!confirm("Delete this application?")) return;
    await supabase.from("applications").delete().eq("id", id);
    loadAll();
  }

  // === Accounts ===
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setAccountMsg(null);
    try {
      await createTrainerFn({ data: accountForm });
      setAccountMsg({ type: "ok", text: `${accountForm.role} account created.` });
      setAccountForm({ email: "", password: "", full_name: "", phone: "", role: "trainer" });
      setShowCreateAccount(false);
    } catch (err: any) {
      setAccountMsg({ type: "err", text: err?.message ?? "Failed to create account." });
    } finally {
      setCreating(false);
    }
  }

  // === Courses CRUD ===
  async function saveCourse(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: courseForm.title,
      description: courseForm.description || null,
      duration: courseForm.duration || null,
      price: courseForm.price || null,
      category: courseForm.category || null,
      is_active: courseForm.is_active,
    };
    if (courseForm.id) {
      await supabase.from("courses").update(payload).eq("id", courseForm.id);
    } else {
      await supabase.from("courses").insert(payload);
    }
    setCourseForm(emptyCourse());
    loadAll();
  }
  async function deleteCourse(id: string) {
    if (!confirm("Delete this course?")) return;
    await supabase.from("courses").delete().eq("id", id);
    loadAll();
  }

  // === Trainers CRUD (entries) ===
  async function saveTrainer(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: trainerForm.name,
      specialty: trainerForm.specialty || null,
      bio: trainerForm.bio || null,
      photo_url: trainerForm.photo_url || null,
      is_active: trainerForm.is_active,
    };
    if (trainerForm.id) {
      await supabase.from("trainers").update(payload).eq("id", trainerForm.id);
    } else {
      await supabase.from("trainers").insert(payload);
    }
    setTrainerForm(emptyTrainer());
    loadAll();
  }
  async function deleteTrainer(id: string) {
    if (!confirm("Delete this trainer entry?")) return;
    await supabase.from("trainers").delete().eq("id", id);
    loadAll();
  }

  // === Announcements CRUD ===
  async function saveAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
      is_active: announcementForm.is_active,
    };
    if (announcementForm.id) {
      await supabase.from("announcements").update(payload).eq("id", announcementForm.id);
    } else {
      await supabase.from("announcements").insert(payload);
    }
    setAnnouncementForm(emptyAnnouncement());
    loadAll();
  }
  async function deleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    loadAll();
  }

  // === Testimonials CRUD ===
  async function saveTestimonial(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: testimonialForm.name,
      text: testimonialForm.text,
      rating: testimonialForm.rating,
      photo_url: testimonialForm.photo_url || null,
      is_approved: testimonialForm.is_approved,
    };
    if (testimonialForm.id) {
      await supabase.from("testimonials").update(payload).eq("id", testimonialForm.id);
    } else {
      await supabase.from("testimonials").insert(payload);
    }
    setTestimonialForm(emptyTestimonial());
    loadAll();
  }
  async function deleteTestimonial(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    loadAll();
  }
  async function approveTestimonial(id: string, approved: boolean) {
    await supabase.from("testimonials").update({ is_approved: approved }).eq("id", id);
    loadAll();
  }

  function courseTitles(ids: string[] | undefined) {
    if (!ids?.length) return "—";
    return ids
      .map((id) => courses.find((c) => c.id === id)?.title)
      .filter(Boolean)
      .join(", ");
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center soft-card rounded-2xl p-8 max-w-sm">
          <h2 className="text-xl font-bold mb-2">Please Login</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to access the dashboard.</p>
          <Link to="/login"><Button className="rounded-full">Go to Login</Button></Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "students", label: "Students", icon: <Users className="h-4 w-4" /> },
    { id: "attendance", label: "Attendance", icon: <ClipboardList className="h-4 w-4" /> },
    ...(isAdmin ? [
      { id: "applications", label: "Applications", icon: <GraduationCap className="h-4 w-4" /> },
      { id: "trainers", label: "Trainers", icon: <UserCheck className="h-4 w-4" /> },
      { id: "courses", label: "Courses", icon: <BookOpen className="h-4 w-4" /> },
      { id: "announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
      { id: "testimonials", label: "Testimonials", icon: <MessageSquare className="h-4 w-4" /> },
    ] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {isAdmin ? "Admin" : "Trainer"} Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back! Manage your academy.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* STUDENTS */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Students ({students.length})</h2>
            <Button onClick={() => setShowAddStudent(!showAddStudent)} className="rounded-full glow-btn">
              <Plus className="mr-2 h-4 w-4" />Add Student
            </Button>
          </div>

          {showAddStudent && (
            <form onSubmit={addStudent} className="soft-card rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Full Name *</Label><Input value={newStudent.full_name} onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })} required /></div>
                <div><Label>Phone *</Label><Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} required /></div>
                <div><Label>Email</Label><Input value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} /></div>
                <div><Label>Notes</Label><Input value={newStudent.notes} onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })} /></div>
              </div>
              <div>
                <Label>Courses * (select at least one)</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {courses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 rounded border p-2 cursor-pointer">
                      <Checkbox
                        checked={newStudent.course_ids.includes(c.id)}
                        onCheckedChange={() => setNewStudent((s) => ({
                          ...s,
                          course_ids: s.course_ids.includes(c.id) ? s.course_ids.filter((x) => x !== c.id) : [...s.course_ids, c.id],
                        }))}
                      />
                      <span className="text-sm">{c.title}</span>
                    </label>
                  ))}
                </div>
                {studentErr && <p className="text-xs text-destructive mt-1">{studentErr}</p>}
              </div>
              <Button type="submit" className="rounded-full">Save Student</Button>
            </form>
          )}

          <div className="soft-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                    <th className="px-4 py-3 text-left font-medium">Courses</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{courseTitles(studentCourses[s.id])}</td>
                      <td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">{s.status}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteStudent(s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Attendance</h2>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-auto" />
          </div>
          <div className="soft-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Mark</th></tr></thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => {
                  const status = attendance.find((a) => a.student_id === s.id)?.status;
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-medium">{s.full_name}</td>
                      <td className="px-4 py-3">{status ? <span className={`rounded-full px-2 py-0.5 text-xs ${status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{status}</span> : <span className="text-muted-foreground text-xs">Not marked</span>}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => takeAttendance(s.id, "present")} className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-600">Present</button>
                        <button onClick={() => takeAttendance(s.id, "absent")} className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-600">Absent</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLICATIONS */}
      {activeTab === "applications" && isAdmin && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Applications ({applications.length})</h2>
          <div className="soft-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Phone</th><th className="px-4 py-3 text-left">Courses</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
              <tbody className="divide-y divide-border">
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-medium">{a.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{courseTitles(appCourses[a.id])}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "approved" ? "bg-green-100 text-green-700" : a.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => updateApplicationStatus(a.id, "approved")} className="text-xs text-green-600 hover:underline">Approve</button>
                      <button onClick={() => updateApplicationStatus(a.id, "rejected")} className="text-xs text-red-600 hover:underline">Reject</button>
                      <button onClick={() => deleteApplication(a.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRAINERS (admin) */}
      {activeTab === "trainers" && isAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Trainers & Accounts</h2>
            <Button onClick={() => setShowCreateAccount(!showCreateAccount)} className="rounded-full glow-btn">
              <Plus className="mr-2 h-4 w-4" />Create Account
            </Button>
          </div>

          {accountMsg && <div className={`rounded-lg p-3 text-sm ${accountMsg.type === "ok" ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>{accountMsg.text}</div>}

          {showCreateAccount && (
            <form onSubmit={handleCreateAccount} className="soft-card rounded-2xl p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Account is active immediately — no email verification required.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Full Name *</Label><Input value={accountForm.full_name} onChange={(e) => setAccountForm({ ...accountForm, full_name: e.target.value })} required /></div>
                <div><Label>Phone</Label><Input value={accountForm.phone} onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })} /></div>
                <div><Label>Email *</Label><Input type="email" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} required /></div>
                <div><Label>Password * (min 6)</Label><Input type="text" value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} required minLength={6} /></div>
                <div>
                  <Label>Role *</Label>
                  <Select value={accountForm.role} onValueChange={(v: "trainer" | "admin") => setAccountForm({ ...accountForm, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="trainer">Trainer</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={creating} className="rounded-full">{creating ? "Creating…" : "Create Account"}</Button>
            </form>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Trainer Profiles (shown on website)</h3>
            <form onSubmit={saveTrainer} className="soft-card rounded-2xl p-6 space-y-3 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Name *" value={trainerForm.name} onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} required />
                <Input placeholder="Specialty" value={trainerForm.specialty} onChange={(e) => setTrainerForm({ ...trainerForm, specialty: e.target.value })} />
                <Input placeholder="Photo URL" value={trainerForm.photo_url} onChange={(e) => setTrainerForm({ ...trainerForm, photo_url: e.target.value })} />
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={trainerForm.is_active} onCheckedChange={(v) => setTrainerForm({ ...trainerForm, is_active: !!v })} />Active</label>
              </div>
              <Textarea placeholder="Bio" value={trainerForm.bio} onChange={(e) => setTrainerForm({ ...trainerForm, bio: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" className="rounded-full">{trainerForm.id ? "Update" : "Add"} Trainer</Button>
                {trainerForm.id && <Button type="button" variant="outline" onClick={() => setTrainerForm(emptyTrainer())} className="rounded-full">Cancel</Button>}
              </div>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainersList.map((t) => (
                <div key={t.id} className="soft-card rounded-2xl p-5">
                  <h3 className="font-bold">{t.name}</h3>
                  <p className="text-sm text-primary font-medium">{t.specialty}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t.bio}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setTrainerForm({ id: t.id, name: t.name, specialty: t.specialty || "", bio: t.bio || "", photo_url: t.photo_url || "", is_active: t.is_active })} className="text-xs text-primary"><Pencil className="h-3.5 w-3.5 inline" /> Edit</button>
                    <button onClick={() => deleteTrainer(t.id)} className="text-xs text-destructive"><Trash2 className="h-3.5 w-3.5 inline" /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COURSES */}
      {activeTab === "courses" && isAdmin && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Courses</h2>
          <form onSubmit={saveCourse} className="soft-card rounded-2xl p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Title *" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
              <Input placeholder="Category (mehndi, stitching, makeup, quran)" value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} />
              <Input placeholder="Duration (e.g. 6 Weeks)" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} />
              <Input placeholder="Price (e.g. ₹ 2,500)" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} />
            </div>
            <Textarea placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={courseForm.is_active} onCheckedChange={(v) => setCourseForm({ ...courseForm, is_active: !!v })} />Active</label>
            <div className="flex gap-2">
              <Button type="submit" className="rounded-full">{courseForm.id ? "Update" : "Add"} Course</Button>
              {courseForm.id && <Button type="button" variant="outline" onClick={() => setCourseForm(emptyCourse())} className="rounded-full">Cancel</Button>}
            </div>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <div key={c.id} className="soft-card rounded-2xl p-5">
                <h3 className="font-bold">{c.title}</h3>
                <p className="text-sm text-primary font-medium">{c.category}</p>
                <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground"><span>{c.duration}</span><span>{c.price}</span></div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setCourseForm({ id: c.id, title: c.title, description: c.description || "", duration: c.duration || "", price: c.price || "", category: c.category || "", is_active: c.is_active })} className="text-xs text-primary"><Pencil className="h-3.5 w-3.5 inline" /> Edit</button>
                  <button onClick={() => deleteCourse(c.id)} className="text-xs text-destructive"><Trash2 className="h-3.5 w-3.5 inline" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {activeTab === "announcements" && isAdmin && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Announcements</h2>
          <form onSubmit={saveAnnouncement} className="soft-card rounded-2xl p-6 space-y-3">
            <Input placeholder="Title *" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
            <Textarea placeholder="Content *" value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} required />
            <div className="flex items-center gap-4">
              <Label className="text-sm">Priority</Label>
              <Input type="number" className="w-24" value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: Number(e.target.value) })} />
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={announcementForm.is_active} onCheckedChange={(v) => setAnnouncementForm({ ...announcementForm, is_active: !!v })} />Active</label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="rounded-full">{announcementForm.id ? "Update" : "Add"}</Button>
              {announcementForm.id && <Button type="button" variant="outline" onClick={() => setAnnouncementForm(emptyAnnouncement())} className="rounded-full">Cancel</Button>}
            </div>
          </form>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="soft-card rounded-2xl p-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{a.title} {!a.is_active && <span className="text-xs text-muted-foreground">(inactive)</span>}</h3>
                  <p className="text-sm text-muted-foreground">{a.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">Priority: {a.priority}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setAnnouncementForm({ id: a.id, title: a.title, content: a.content, priority: a.priority ?? 0, is_active: a.is_active })} className="text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteAnnouncement(a.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TESTIMONIALS */}
      {activeTab === "testimonials" && isAdmin && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Testimonials</h2>
          <form onSubmit={saveTestimonial} className="soft-card rounded-2xl p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Name *" value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} required />
              <Input placeholder="Photo URL" value={testimonialForm.photo_url} onChange={(e) => setTestimonialForm({ ...testimonialForm, photo_url: e.target.value })} />
            </div>
            <Textarea placeholder="Text *" value={testimonialForm.text} onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })} required />
            <div className="flex items-center gap-4">
              <Label className="text-sm">Rating</Label>
              <Input type="number" min={1} max={5} className="w-20" value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })} />
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={testimonialForm.is_approved} onCheckedChange={(v) => setTestimonialForm({ ...testimonialForm, is_approved: !!v })} />Approved (show on site)</label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="rounded-full">{testimonialForm.id ? "Update" : "Add"}</Button>
              {testimonialForm.id && <Button type="button" variant="outline" onClick={() => setTestimonialForm(emptyTestimonial())} className="rounded-full">Cancel</Button>}
            </div>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="soft-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{t.name} <span className="text-xs text-muted-foreground">★ {t.rating}</span></h3>
                    <p className="text-sm text-muted-foreground mt-1">{t.text}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${t.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{t.is_approved ? "Approved" : "Pending"}</span>
                </div>
                <div className="flex gap-3 mt-3 text-xs">
                  <button onClick={() => approveTestimonial(t.id, !t.is_approved)} className="text-primary">{t.is_approved ? "Unapprove" : "Approve"}</button>
                  <button onClick={() => setTestimonialForm({ id: t.id, name: t.name, text: t.text, rating: t.rating ?? 5, photo_url: t.photo_url || "", is_approved: t.is_approved })} className="text-primary"><Pencil className="h-3.5 w-3.5 inline" /> Edit</button>
                  <button onClick={() => deleteTestimonial(t.id)} className="text-destructive"><Trash2 className="h-3.5 w-3.5 inline" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}