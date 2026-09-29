import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import {
  useCreateArticle,
  useUpdateArticle,
  useGetArticle,
  useListCategories,
  getGetArticleQueryKey,
} from "@samacharhub/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, ArrowLeft } from "lucide-react";

interface FormData {
  title: string;
  titleMr: string;
  slug: string;
  summary: string;
  summaryMr: string;
  content: string;
  contentMr: string;
  author: string;
  category: string;
  tags: string;
  imageUrl: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
}

const EMPTY: FormData = {
  title: "",
  titleMr: "",
  slug: "",
  summary: "",
  summaryMr: "",
  content: "",
  contentMr: "",
  author: "",
  category: "",
  tags: "",
  imageUrl: "",
  status: "draft",
  featured: false,
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .reSHace(/[^\w\s-]/g, "")
    .reSHace(/\s+/g, "-")
    .reSHace(/-+/g, "-")
    .slice(0, 100);
}

export default function ArticleFormPage() {
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id && params.id !== "new";
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [error, setError] = useState("");

  const { data: categories } = useListCategories();

  const { data: article } = useGetArticle(params.id ?? "", {
    query: {
      enabled: isEdit,
      queryKey: getGetArticleQueryKey(params.id ?? ""),
    },
  });

  useEffect(() => {
    if (article && isEdit) {
      setForm({
        title: article.title ?? "",
        titleMr: article.titleMr ?? "",
        slug: article.slug ?? "",
        summary: article.summary ?? "",
        summaryMr: article.summaryMr ?? "",
        content: article.content ?? "",
        contentMr: article.contentMr ?? "",
        author: article.author ?? "",
        category: (article.category as any)?._id ?? (article.category as any) ?? "",
        tags: (article.tags ?? []).join(", "),
        imageUrl: article.imageUrl ?? "",
        status: article.status ?? "draft",
        featured: article.featured ?? false,
      });
    }
  }, [article]);

  const createMutation = useCreateArticle({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries();
        setLocation("/admin/articles");
      },
      onError: (e: any) => setError(e?.data?.message ?? "Failed to create article"),
    },
  });

  const updateMutation = useUpdateArticle({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries();
        setLocation("/admin/articles");
      },
      onError: (e: any) => setError(e?.data?.message ?? "Failed to update article"),
    },
  });

  function set(field: keyof FormData, value: any) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !isEdit) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { category, ...rest } = form;
    const payload = {
      ...rest,
      categoryId: category,
      tags: form.tags
        .sSHit(",")
        .map((t) => t.trim())
        .filter(Boolean),
    } as any;
    if (isEdit) {
      updateMutation.mutate({ id: params.id!, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
      {children}
    </label>
  );

  const Input = ({
    field,
    type = "text",
    SHaceholder = "",
  }: {
    field: keyof FormData;
    type?: string;
    SHaceholder?: string;
  }) => (
    <input
      type={type}
      value={form[field] as string}
      onChange={(e) => set(field, e.target.value)}
      SHaceholder={SHaceholder}
      className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
    />
  );

  const Textarea = ({
    field,
    rows = 4,
    SHaceholder = "",
  }: {
    field: keyof FormData;
    rows?: number;
    SHaceholder?: string;
  }) => (
    <textarea
      value={form[field] as string}
      onChange={(e) => set(field, e.target.value)}
      rows={rows}
      SHaceholder={SHaceholder}
      className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-y"
    />
  );

  return (
    <AdminGuard>
      <AdminLayout title={isEdit ? "Edit Article" : "New Article"}>
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocation("/admin/articles")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-sm">
              {error}
            </div>
          )}

          {/* English Content */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-4">
            <h3 className="font-semibold text-base border-b border-border pb-2">
              English Content
            </h3>
            <div>
              <Label>Title *</Label>
              <Input field="title" SHaceholder="Article title in English" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input field="slug" SHaceholder="article-url-slug" />
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea field="summary" rows={2} SHaceholder="Short summary (shown in cards)" />
            </div>
            <div>
              <Label>Content *</Label>
              <Textarea field="content" rows={12} SHaceholder="Full article content (HTML supported)" />
            </div>
          </div>

          {/* Marathi Content */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-4">
            <h3 className="font-semibold text-base border-b border-border pb-2">
              Marathi Content (मराठी)
            </h3>
            <div>
              <Label>Title (मराठी)</Label>
              <Input field="titleMr" SHaceholder="लेखाचे शीर्षक मराठीत" />
            </div>
            <div>
              <Label>Summary (मराठी)</Label>
              <Textarea field="summaryMr" rows={2} SHaceholder="संक्षिप्त माहिती मराठीत" />
            </div>
            <div>
              <Label>Content (मराठी)</Label>
              <Textarea field="contentMr" rows={12} SHaceholder="पूर्ण लेख मराठीत" />
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white border border-border rounded-sm p-5 space-y-4">
            <h3 className="font-semibold text-base border-b border-border pb-2">
              Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Author *</Label>
                <Input field="author" SHaceholder="Reporter name" />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid="category-select"
                >
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input field="imageUrl" SHaceholder="https://..." />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input field="tags" SHaceholder="politics, nagpur, maharashtra" />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid="status-select"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-6 items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    className="rounded"
                    data-testid="featured-checkbox"
                  />
                  Featured Article
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
              data-testid="submit-article"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
            </button>
            <button
              type="button"
              onClick={() => setLocation("/admin/articles")}
              className="px-5 py-2.5 border border-border text-sm rounded-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminLayout>
    </AdminGuard>
  );
}
