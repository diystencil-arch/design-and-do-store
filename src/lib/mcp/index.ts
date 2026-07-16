import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import getProduct from "./tools/get-product";
import listMyOrders from "./tools/list-my-orders";
import listMyDownloads from "./tools/list-my-downloads";
import listCategories from "./tools/list-categories";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "diy-stencil-mcp",
  title: "DIY Stencil",
  version: "0.1.0",
  instructions:
    "Tools for the DIY Stencil craft store. Search and browse products (stencils, wood cutouts, acrylic, SVG files), and access the signed-in user's own orders and digital downloads.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchProducts, getProduct, listCategories, listMyOrders, listMyDownloads],
});
