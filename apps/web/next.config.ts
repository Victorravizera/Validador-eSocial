import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NUNCA use NEXT_PUBLIC_ para secrets — variáveis com esse prefixo
  // ficam expostas no bundle do cliente
};

export default nextConfig;
