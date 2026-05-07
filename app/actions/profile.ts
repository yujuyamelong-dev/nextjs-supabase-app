"use server";

import { revalidatePath } from "next/cache";

import { updateProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile";

export type ProfileActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    return { success: false, message: "인증되지 않은 요청입니다" };
  }

  const userId = claimsData.claims.sub;

  const rawData = {
    username: formData.get("username"),
    full_name: formData.get("full_name") || null,
    bio: formData.get("bio") || null,
    website: formData.get("website") || null,
  };

  const parsed = profileSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "입력값 검증에 실패했습니다",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await updateProfile(supabase, userId, {
    username: parsed.data.username,
    full_name: parsed.data.full_name ?? null,
    bio: parsed.data.bio ?? null,
    website: parsed.data.website && parsed.data.website !== "" ? parsed.data.website : null,
  });

  if (error) {
    // PostgreSQL 오류 코드 23505: unique violation (username 중복)
    if (error.code === "23505") {
      return {
        success: false,
        message: "이 사용자명은 이미 사용 중입니다",
        errors: { username: ["이미 사용 중인 사용자명입니다"] },
      };
    }
    return { success: false, message: `오류: ${error.message}` };
  }

  revalidatePath("/protected/profile");
  return { success: true, message: "프로필이 성공적으로 업데이트되었습니다" };
}
