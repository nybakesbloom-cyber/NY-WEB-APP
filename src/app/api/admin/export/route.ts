import { Product } from "@/server/models/Product";
import { withAdmin, query } from "@/server/api";
import { toCSV, productToRow, PRODUCT_COLUMNS } from "@/lib/csv";

/** The catalogue as a spreadsheet, in the same shape the importer accepts. */
export const GET = withAdmin(async ({ req }) => {
  const format = query(req).get("format") === "json" ? "json" : "csv";
  const products = await Product.find().sort({ sort: 1, name: 1 }).lean();
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    return new Response(JSON.stringify(products.map(productToRow), null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="products-${stamp}.json"`,
      },
    });
  }

  return new Response(toCSV([...PRODUCT_COLUMNS], products.map(productToRow)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-${stamp}.csv"`,
    },
  });
});
