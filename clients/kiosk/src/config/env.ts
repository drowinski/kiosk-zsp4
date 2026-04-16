import { z } from 'zod';

const envSchema = z.object({
  BASE_URL: z.string().default('http://localhost:8080'),
  API_URL: z.string().default('http://localhost:8080/api'),
  USERNAME: z.string().default('admin'),
  PASSWORD: z.string().default('admin'),
});

const envVars = Object.entries(import.meta.env).reduce<Record<string, string>>(
  (obj, entry) => {
    const [key, value] = entry as unknown as string;
    if (key.startsWith('VITE_')) {
      obj[key.replace('VITE_', '')] = value;
    }
    return obj;
  },
  {}
);

const parsedEnv = envSchema.safeParse(envVars);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid or missing environment variables detected: \n ${z.prettifyError(parsedEnv.error)}`
  );
}

export const env = parsedEnv.data;
