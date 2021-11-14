/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  VITE_API_URL: string;
}

export enum AgentType {
  Individual = "INDIVIDUAL",
  Organization = "ORGANIZATION"
}
