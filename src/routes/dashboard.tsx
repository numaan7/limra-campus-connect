import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, UserCheck, BookOpen, Plus, Trash2, ChevronRight,
  LayoutDashboard, GraduationCap, ClipboardList, Settings
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

function DashboardPage() {
  const { user, isLoading, isAdmin, isTrainer } = useAuth();
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [trainersList, setTrainersList] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "trainer" as "trainer" | "admin",
  });
  const [accountMsg, setAccountMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const createTrainerFn = useServerFn(createTrainerAccount);

  const [newStudent, setNewStudent] = useState({
    full_name: "",
    email: "",
    phone: "",
    course_id: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, activeTab]);

  async function loadData() {
    const { data: studentsData } = await supabase.from("students").select("*, courses(title)").order("created_at", { ascending: false });
    if (studentsData) setStudents(studentsData);

    const { data: appsData } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (appsData) setApplications(appsData);

    const { data: coursesData } = await supabase.from("courses").select("*");
    if (coursesData) setCourses(coursesData);

    if (isAdmin) {
      const { data: trainersData } = await supabase.from("trainers").select("*");
      if (trainersData) setTrainersList(trainersData);
    }
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("students").insert({
      full_name: newStudent.full_name,
      email: newStudent.email || null,
      phone: newStudent.phone,
      course_id: newStudent.course_id || null,
      notes: newStudent.notes || null,
      trainer_id: user?.id,
    });
    setNewStudent({ full_name: "", email: "", phone: "", course_id: "", notes: "" });
    setShowAddStudent(false);
    loadData();
  }

  async function deleteStudent(id: string) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    await supabase.from("students").delete().eq("id", id);
    loadData();
  }

  async function takeAttendance(studentId: string, status: string) {
    await supabase.from("attendance").upsert({
      student_id: studentId,
      date: selectedDate,
      status,
      trainer_id: user?.id,
    }, { onConflict: "student_id,date" });
    loadAttendance();
  }

  async function loadAttendance() {
    const { data } = await supabase.from("attendance").select("*").eq("date", selectedDate);
    setAttendance(data ?? []);
  }

  async function updateApplicationStatus(id: string, status: string) {
    await supabase.from("applications").update({ status }).eq("id", id);
    loadData();
  }

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

  function getAttendanceStatus(studentId: string) {
    return attendance.find((a) => a.student_id === studentId)?.status || null;
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
          <Link to="/login">
            <Button className="rounded-full">Go to Login</Button>
          </Link>
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
    ] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {isAdmin ? "Admin" : "Trainer"} Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back! Manage your students and classes.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Students ({students.length})</h2>
            <Button onClick={() => setShowAddStudent(!showAddStudent)} className="rounded-full glow-btn">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>

          {showAddStudent && (
            <form onSubmit={addStudent} className="soft-card rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={newStudent.full_name} onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })} required />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
                </div>
                <div>
                  <Label>Course</Label>
                  <Select value={newStudent.course_id} onValueChange={(v) => setNewStudent({ ...newStudent, course_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={newStudent.notes} onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })} />
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
                    <th className="px-4 py-3 text-left font-medium">Course</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.courses?.title || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteStudent(s.id)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Attendance</h2>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); loadAttendance(); }}
              className="w-auto"
            />
          </div>

          <div className="soft-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Student</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s) => {
                    const status = getAttendanceStatus(s.id);
                    return (
                      <tr key={s.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{s.full_name}</td>
                        <td className="px-4 py-3">
                          {status ? (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {status}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not marked</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => takeAttendance(s.id, "present")}
                              className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-500/20"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => takeAttendance(s.id, "absent")}
                              className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-500/20"
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Applications Tab (Admin only) */}
      {activeTab === "applications" && isAdmin && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Applications ({applications.length})</h2>
          <div className="soft-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                    <th className="px-4 py-3 text-left font-medium">Course</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{a.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.course_id || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.status === "approved" ? "bg-green-100 text-green-700" :
                          a.status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => updateApplicationStatus(a.id, "approved")} className="text-xs text-green-600 hover:underline">Approve</button>
                          <button onClick={() => updateApplicationStatus(a.id, "rejected")} className="text-xs text-red-600 hover:underline">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trainers Tab (Admin only) */}
      {activeTab === "trainers" && isAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Trainers & Accounts</h2>
            <Button onClick={() => setShowCreateAccount(!showCreateAccount)} className="rounded-full glow-btn">
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </div>

          {accountMsg && (
            <div className={`rounded-lg p-3 text-sm ${accountMsg.type === "ok" ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
              {accountMsg.text}
            </div>
          )}

          {showCreateAccount && (
            <form onSubmit={handleCreateAccount} className="soft-card rounded-2xl p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a login for a trainer or another admin. The account is active immediately — no email verification required.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={accountForm.full_name} onChange={(e) => setAccountForm({ ...accountForm, full_name: e.target.value })} required />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={accountForm.phone} onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Password * (min 6 chars)</Label>
                  <Input type="text" value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} required minLength={6} />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Select value={accountForm.role} onValueChange={(v: "trainer" | "admin") => setAccountForm({ ...accountForm, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={creating} className="rounded-full">
                {creating ? "Creating…" : "Create Account"}
              </Button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainersList.map((t) => (
              <div key={t.id} className="soft-card rounded-2xl p-5">
                <h3 className="font-bold">{t.name}</h3>
                <p className="text-sm text-primary font-medium">{t.specialty}</p>
                <p className="text-sm text-muted-foreground mt-2">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses Tab (Admin only) */}
      {activeTab === "courses" && isAdmin && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <div key={c.id} className="soft-card rounded-2xl p-5">
                <h3 className="font-bold">{c.title}</h3>
                <p className="text-sm text-primary font-medium">{c.category}</p>
                <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
                <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                  <span>{c.duration}</span>
                  <span>{c.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
