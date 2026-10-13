import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getListCategoriesQueryKey,
} from "@samacharhub/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface FormData {
  name: string;
  nameMr: string;
  nameHi: string;
  slug: string;
  color: string;
  order: number;
}

const EMPTY: FormData = {
  name: "",
  nameMr: "",
  nameHi: "",
  slug: "",
  color: "#CC0000",
  order: 0,
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

function CategoryForm({
  initial = EMPTY,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: FormData;
  onSave: (f: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);

  function set(k: keyof FormData, v: any) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "name") next.slug = slugify(v);
      return next;
    });
  }

  return (
    <tr className="bg-primary/5">
      <td className="px-4 py-3">
        <div className="space-y-1.5">
          <input
            type="text"
            placeholder="Category name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full px-2 py-1 text-sm border border-border rounded-sm"
            data-testid="cat-name"
          />
          <input
            type="text"
            placeholder="मराठी नाव"
            value={form.nameMr}
            onChange={(e) => set("nameMr", e.target.value)}
            className="w-full px-2 py-1 text-sm border border-border rounded-sm"
            data-testid="cat-name-mr"
          />
          <input
            type="text"
            placeholder="हिंदी नाम"
            value={form.nameHi}
            onChange={(e) => set("nameHi", e.target.value)}
            className="w-full px-2 py-1 text-sm border border-border rounded-sm"
            data-testid="cat-name-hi"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          placeholder="slug"
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          className="w-full px-2 py-1 text-sm border border-border rounded-sm"
          data-testid="cat-slug"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="color"
          value={form.color}
          onChange={(e) => set("color", e.target.value)}
          className="w-10 h-8 cursor-pointer rounded border border-border"
          data-testid="cat-color"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={form.order}
          onChange={(e) => set("order", +e.target.value)}
          className="w-16 px-2 py-1 text-sm border border-border rounded-sm"
          data-testid="cat-order"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(form)}
            disabled={isPending || !form.name}
            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
            data-testid="cat-save"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 bg-muted rounded hover:bg-muted/70 transition-colors"
            data-testid="cat-cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const { data: categories, isLoading } = useListCategories();

  const createMutation = useCreateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setAdding(false);
      },
    },
  });

  const updateMutation = useUpdateCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setEditing(null);
      },
    },
  });

  const deleteMutation = useDeleteCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
    },
  });

  return (
    <AdminGuard>
      <AdminLayout title="Categories">
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setAdding(true)}
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              data-testid="add-category-btn"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>

          <div className="bg-white border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm" data-testid="categories-table">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 font-medium">Color</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adding && (
                  <CategoryForm
                    onSave={(f) => createMutation.mutate({ data: f })}
                    onCancel={() => setAdding(false)}
                    isPending={createMutation.isPending}
                  />
                )}
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {[1, 2, 3, 4, 5].map((j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-muted animate-pulse rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : categories?.map((cat) =>
                      editing === cat._id ? (
                        <CategoryForm
                          key={cat._id}
                          initial={{
                            name: cat.name,
                            nameMr: cat.nameMr ?? "",
                            nameHi: (cat as any).nameHi ?? "",
                            slug: cat.slug,
                            color: cat.color,
                            order: cat.order,
                          }}
                          onSave={(f) => updateMutation.mutate({ id: cat._id, data: f })}
                          onCancel={() => setEditing(null)}
                          isPending={updateMutation.isPending}
                        />
                      ) : (
                        <tr key={cat._id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium">{cat.name}</p>
                            {cat.nameMr && (
                              <p className="text-xs text-muted-foreground">{cat.nameMr}</p>
                            )}
                            {(cat as any).nameHi && (
                              <p className="text-xs text-muted-foreground">{(cat as any).nameHi}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                            {cat.slug}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded border border-border"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="text-xs font-mono text-muted-foreground">
                                {cat.color}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {cat.order}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditing(cat._id)}
                                className="p-1.5 hover:bg-muted rounded transition-colors"
                                data-testid={`edit-cat-${cat._id}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete "${cat.name}"?`)) {
                                    deleteMutation.mutate({ id: cat._id });
                                  }
                                }}
                                className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
                                data-testid={`delete-cat-${cat._id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
