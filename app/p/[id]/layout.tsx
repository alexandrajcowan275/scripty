import { ProductionProvider } from "@/components/ui-v2/provider";

export default async function ProductionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ProductionProvider key={id} id={id}>
      {children}
    </ProductionProvider>
  );
}
