"use client";

import { useActionState, useOptimistic } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileAction, type ProfileActionState } from "@/app/actions/profile";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";
import type { Profile } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const initialState: ProfileActionState = {
  success: false,
  message: "",
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );

  const [optimisticProfile, setOptimisticProfile] = useOptimistic(profile);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username,
      full_name: profile.full_name ?? "",
      bio: profile.bio ?? "",
      website: profile.website ?? "",
    },
  });

  const values = watch();

  const onSubmit = (values: ProfileFormValues) => {
    setOptimisticProfile({
      ...optimisticProfile,
      username: values.username,
      full_name: values.full_name ?? null,
      bio: values.bio ?? null,
      website: values.website && values.website !== "" ? values.website : null,
    });

    const formData = new FormData();
    formData.set("username", values.username);
    if (values.full_name) formData.set("full_name", values.full_name);
    if (values.bio) formData.set("bio", values.bio);
    if (values.website) formData.set("website", values.website);

    formAction(formData);
  };

  return (
    <div className="space-y-6">
      {state.message && (
        <Card
          className={`p-4 ${
            state.success
              ? "bg-green-50 border-green-200 text-green-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {state.message}
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">사용자명 *</Label>
          <Input
            id="username"
            placeholder="john_doe"
            {...register("username")}
            aria-invalid={!!errors.username}
            disabled={isPending}
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
          {state.errors?.username && (
            <p className="text-sm text-red-600">{state.errors.username[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">이름</Label>
          <Input
            id="full_name"
            placeholder="John Doe"
            {...register("full_name")}
            aria-invalid={!!errors.full_name}
            disabled={isPending}
          />
          {errors.full_name && (
            <p className="text-sm text-red-600">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">소개</Label>
          <Textarea
            id="bio"
            placeholder="자신을 소개해주세요"
            {...register("bio")}
            aria-invalid={!!errors.bio}
            disabled={isPending}
            className="resize-none"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {(values.bio?.length ?? 0)}/500
          </p>
          {errors.bio && (
            <p className="text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">웹사이트</Label>
          <Input
            id="website"
            placeholder="https://example.com"
            {...register("website")}
            aria-invalid={!!errors.website}
            disabled={isPending}
          />
          {errors.website && (
            <p className="text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "저장 중..." : "프로필 저장"}
        </Button>
      </form>

      <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
        <p>
          가입일: {new Date(optimisticProfile.created_at).toLocaleDateString("ko-KR")}
        </p>
        <p>
          최종 수정:{" "}
          {new Date(optimisticProfile.updated_at).toLocaleDateString("ko-KR")}
        </p>
      </div>
    </div>
  );
}
