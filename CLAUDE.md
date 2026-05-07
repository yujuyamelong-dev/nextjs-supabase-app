# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 15 + Supabase 스타터 킷. Supabase Auth with cookies를 사용하여 전체 Next.js 스택(클라이언트, 서버, 라우트 핸들러, Server Actions)에서 사용자 세션을 사용 가능하게 합니다.

## 필수 명령어

```bash
npm run dev          # 개발 서버 시작 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
npm run lint         # ESLint 실행
```

## 환경 변수

`.env.local` 파일에 다음 변수들이 필요합니다:

```
NEXT_PUBLIC_SUPABASE_URL=[Supabase 프로젝트 URL]
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[Supabase Publishable Key]
```

## 아키텍처

### 디렉토리 구조

```
app/
├── auth/              # 인증 페이지 (로그인, 가입, 비밀번호 재설정)
├── protected/         # 인증이 필요한 라우트
│   ├── layout.tsx     # 보호된 레이아웃 (네비게이션, 인증 확인)
│   └── profile/       # 프로필 페이지
├── actions/           # Server Actions
│   └── profile.ts     # 프로필 업데이트 액션
├── layout.tsx         # 루트 레이아웃
└── page.tsx           # 홈페이지

lib/
├── supabase/
│   ├── client.ts      # 클라이언트 사이드 Supabase 인스턴스
│   ├── server.ts      # 서버 사이드 Supabase 인스턴스 (쿠키 기반)
│   ├── proxy.ts       # 프록시 라우트용 Supabase 설정
│   └── profiles.ts    # 프로필 데이터베이스 작업
├── validations/
│   └── profile.ts     # Zod 스키마 (프로필 폼 검증)
└── utils.ts           # 유틸리티 함수

components/           # React 컴포넌트들
```

### Supabase 클라이언트 구조

**클라이언트 사이드 (`lib/supabase/client.ts`)**

- 브라우저에서만 실행되는 Supabase 인스턴스
- 클라이언트 컴포넌트에서 사용
- 환경 변수는 `NEXT_PUBLIC_` 접두어 필요

**서버 사이드 (`lib/supabase/server.ts`)**

- 서버 컴포넌트와 Server Actions에서만 실행
- 쿠키를 통해 세션 관리
- 매번 새로운 인스턴스 생성 (Fluid compute 고려)
- 환경 변수는 비공개 변수 사용 가능

```typescript
// 서버 액션/컴포넌트에서의 사용
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
```

### Server Actions 패턴

`app/actions/` 디렉토리의 Server Actions는:

- FormData를 입력으로 받음
- Zod로 유효성 검사
- 서버의 Supabase 클라이언트 사용
- 성공/실패 상태와 에러 메시지 반환

```typescript
export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState>;
```

### 폼 검증

React Hook Form + Zod를 사용한 타입 안전한 폼 검증:

- 스키마는 `lib/validations/` 디렉토리
- Server Action에서도 같은 스키마로 재검증
- 에러는 `fieldErrors` 형태로 반환

## 주요 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **인증**: Supabase Auth (쿠키 기반)
- **폼**: React Hook Form + Zod
- **스타일**: Tailwind CSS + shadcn/ui
- **언어**: TypeScript (strict mode)

## 개발 시 주의사항

1. **Server/Client 분리**:
   - `use server`와 `use client` 지시문을 명확히 구분
   - 서버 액션은 항상 서버 Supabase 클라이언트 사용

2. **환경 변수**:
   - 클라이언트에 노출할 변수만 `NEXT_PUBLIC_` 사용
   - Supabase URL과 Publishable Key는 공개해도 안전 (RLS로 보호)

3. **폼 처리**:
   - 클라이언트 컴포넌트에서 React Hook Form으로 상태 관리
   - Server Action으로 데이터 제출
   - 성공/실패 메시지를 Toast 또는 인라인으로 표시

4. **Database 오류 처리**:
   - PostgreSQL 오류 코드 (예: 23505 = unique violation) 처리
   - 사용자 친화적인 메시지로 변환

## 참고

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
