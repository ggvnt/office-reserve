"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { openApiSpec } from "@/docs/openapi";

const SwaggerUI = dynamic(
  () => import("swagger-ui-react"),
  { ssr: false }
);

export default function SwaggerDocs() {
  return (
    <SwaggerUI
      spec={openApiSpec}
      withCredentials={true}
    />
  );
}