
import { menuData, MenuCategory } from "@/lib/menu-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return menuData.map((category) => ({
    category: category.id,
  }));
}

export default function MenuCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = menuData.find((c) => c.id === params.category);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section
        id={category.id}
        className="mb-16"
        aria-labelledby={`${category.id}-heading`}
      >
        <h2
          id={`${category.id}-heading`}
          className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {category.name}
        </h2>
        <div className="flex flex-col">
          {category.items.map((item, index) => (
            <div key={item.name}>
              <div className="py-6">
                {item.tags && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag === "Popular" ? "Nuevo" : tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-lg font-semibold text-primary">
                    ${item.price}
                  </p>
                </div>
                <div className="mt-1 flex flex-col">
                  <p className="text-muted-foreground">{item.description}</p>
                  {item.portion && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.portion}
                    </p>
                  )}
                </div>
              </div>
              {index < category.items.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
