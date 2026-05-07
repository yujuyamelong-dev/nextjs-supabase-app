import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ProfileForm } from "@/components/profile-form";
import { getProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

async function ProfileContent() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub;

  const { data: profile, error: profileError } = await getProfile(supabase, userId);

  if (profileError || !profile) {
    redirect("/auth/login");
  }

  return <ProfileForm profile={profile} />;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded bg-muted" />
      <div className="h-10 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">프로필 설정</h1>
        <p className="mt-1 text-muted-foreground">공개 프로필 정보를 관리하세요</p>
      </div>

      <div className="max-w-2xl">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent />
        </Suspense>
      </div>
    </div>
  );
}
