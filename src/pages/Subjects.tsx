import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, BookOpen, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";

export default function Subjects() {
  const { isAdmin } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookPublisher, setBookPublisher] = useState("");
  const [bookEdition, setBookEdition] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: "subject" | "book" } | null>(null);
  const [filterClass, setFilterClass] = useState("all");
  const qc = useQueryClient();

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subjects").select("*, classes(name)").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: books = [] } = useQuery({
    queryKey: ["books", selectedSubject?.id],
    enabled: !!selectedSubject,
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").eq("subject_id", selectedSubject.id).order("title");
      if (error) throw error;
      return data;
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Subject name is required");
      const { error } = await supabase.from("subjects").insert({
        name: name.trim(),
        class_id: classId || null,
        description: description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subject added");
      qc.invalidateQueries({ queryKey: ["subjects"] });
      setAddOpen(false);
      setName(""); setClassId(""); setDescription("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addBookMutation = useMutation({
    mutationFn: async () => {
      if (!bookTitle.trim()) throw new Error("Book title is required");
      const { error } = await supabase.from("books").insert({
        subject_id: selectedSubject.id,
        title: bookTitle.trim(),
        author: bookAuthor || null,
        publisher: bookPublisher || null,
        edition: bookEdition || null,
        isbn: bookIsbn || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Book added");
      qc.invalidateQueries({ queryKey: ["books", selectedSubject?.id] });
      setBookOpen(false);
      setBookTitle(""); setBookAuthor(""); setBookPublisher(""); setBookEdition(""); setBookIsbn("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: "subject" | "book" }) => {
      const { error } = await supabase.from(type === "subject" ? "subjects" : "books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["books", selectedSubject?.id] });
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = subjects.filter((s: any) => filterClass === "all" || s.class_id === filterClass);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subjects & Books</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage subjects and their textbooks</p>
        </div>
        {isAdmin && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Subject</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addSubjectMutation.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" required />
                </div>
                <div className="space-y-2">
                  <Label>Class (optional)</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <Button type="submit" className="w-full" disabled={addSubjectMutation.isPending}>
                  {addSubjectMutation.isPending ? "Adding..." : "Add Subject"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-3">
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading subjects...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject list */}
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Subjects ({filtered.length})</h2>
            {filtered.map((sub: any) => (
              <div
                key={sub.id}
                className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selectedSubject?.id === sub.id ? "border-primary bg-primary/5" : "bg-card"}`}
                onClick={() => setSelectedSubject(sub)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">{(sub.classes as any)?.name ?? "All Classes"}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: sub.id, name: sub.name, type: "subject" }); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {sub.description && <p className="text-sm text-muted-foreground mt-2">{sub.description}</p>}
              </div>
            ))}
            {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No subjects found</p>}
          </div>

          {/* Books panel */}
          <div className="space-y-3">
            {selectedSubject ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Books — {selectedSubject.name}</h2>
                  {isAdmin && (
                    <Dialog open={bookOpen} onOpenChange={setBookOpen}>
                      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Book</Button></DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Add Book to {selectedSubject.name}</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); addBookMutation.mutate(); }} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Author</Label>
                              <Input value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Publisher</Label>
                              <Input value={bookPublisher} onChange={(e) => setBookPublisher(e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Edition</Label>
                              <Input value={bookEdition} onChange={(e) => setBookEdition(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>ISBN</Label>
                              <Input value={bookIsbn} onChange={(e) => setBookIsbn(e.target.value)} />
                            </div>
                          </div>
                          <Button type="submit" className="w-full" disabled={addBookMutation.isPending}>
                            {addBookMutation.isPending ? "Adding..." : "Add Book"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="rounded-xl border bg-card shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Publisher</TableHead>
                        <TableHead>Edition</TableHead>
                        {isAdmin && <TableHead className="w-10"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((b: any) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.title}</TableCell>
                          <TableCell>{b.author ?? "—"}</TableCell>
                          <TableCell>{b.publisher ?? "—"}</TableCell>
                          <TableCell>{b.edition ?? "—"}</TableCell>
                          {isAdmin && (
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ id: b.id, name: b.title, type: "book" })}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {books.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No books added yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground rounded-xl border bg-card">
                Select a subject to view its books
              </div>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === "subject" ? "Subject" : "Book"}</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id, type: deleteTarget.type })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
