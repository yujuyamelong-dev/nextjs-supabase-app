import { z } from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "사용자명은 최소 3자 이상이어야 합니다")
    .max(30, "사용자명은 최대 30자 이하여야 합니다")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "사용자명은 문자, 숫자, 언더스코어만 사용 가능합니다",
    ),
  full_name: z
    .string()
    .max(100, "이름은 최대 100자 이하여야 합니다")
    .nullish(),
  bio: z
    .string()
    .max(500, "소개는 최대 500자 이하여야 합니다")
    .nullish(),
  website: z
    .string()
    .url("유효한 URL 형식이어야 합니다 (http:// 또는 https://로 시작)")
    .nullish()
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
