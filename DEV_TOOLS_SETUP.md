# 개발 도구 설정 가이드

개발 환경이 다음과 같이 설정되었습니다.

## 설치된 도구

### 1. **ESLint v9** (Flat Config)

- **목적**: 코드 품질 검사
- **규칙**:
  - `@typescript-eslint/no-explicit-any`: `any` 타입 사용 금지 (error)
  - `@typescript-eslint/no-non-null-assertion`: `!` 단언 경고 (warn)
  - `@typescript-eslint/consistent-type-imports`: `import type` 강제
  - `import/order`: import 문 자동 정렬 (그룹화 + 알파벳순)
  - `no-empty`: 빈 catch 블록 경고

**명령어**:

```bash
npm run lint          # 코드 검사
npm run lint:fix      # 자동 수정 가능한 부분 수정
```

### 2. **Prettier v3**

- **목적**: 코드 포맷 일관성 유지
- **설정**:
  - printWidth: 100자
  - 탭 크기: 2칸
  - 세미콜론: 필수
  - 큰따옴표 사용
  - `prettier-plugin-tailwindcss`: Tailwind 클래스 자동 정렬

**명령어**:

```bash
npm run format         # 모든 파일 포맷 적용
npm run format:check   # 포맷 검사 (수정 없음)
```

### 3. **TypeScript Type Check**

- **목적**: 타입 안전성 검증
- **설정**: `strict: true` (tsconfig.json)

**명령어**:

```bash
npm run type-check    # 타입 검사 실행
```

### 4. **Husky + lint-staged**

- **목적**: Git 커밋 전 자동 검사
- **훅**:
  - `pre-commit`: lint-staged 실행 → ESLint fix + Prettier
  - `pre-push`: TypeScript type-check 실행

**설정 위치**:

- `.husky/pre-commit`
- `.husky/pre-push`

### 5. **@next/bundle-analyzer**

- **목적**: 번들 크기 분석
- **명령어**:

```bash
npm run analyze       # 번들 분석 리포트 생성 및 오픈
```

## 사용 흐름

### 로컬 개발 중

1. **코드 작성**

   ```bash
   npm run dev          # 개발 서버 시작
   ```

2. **커밋 전 검사** (선택사항, Git 훅이 자동 실행)

   ```bash
   npm run type-check   # 타입 검사
   npm run lint         # ESLint 검사
   npm run format       # 포맷 적용
   ```

3. **Git 커밋**

   ```bash
   git add .
   git commit -m "feature: 새로운 기능 추가"
   ```

   → `pre-commit` 훅 자동 실행 (lint-staged)
   → `.ts`, `.tsx`, `.js` 파일만 ESLint fix + Prettier 적용

4. **Git push**
   ```bash
   git push origin main
   ```
   → `pre-push` 훅 자동 실행
   → TypeScript type-check 실행
   → 타입 오류 발견 시 push 차단

### 현재 경고 상태

**Non-null assertion 경고 (6개)**: `warn` 수준이므로 커밋은 가능하나 점진적 수정 권장

- `lib/supabase/client.ts` (2개)
- `lib/supabase/proxy.ts` (2개)
- `lib/supabase/server.ts` (2개)

이 경고들은 환경 변수 검증 로직을 추가하여 해결 가능합니다.

## npm scripts 전체 목록

| 명령어                 | 설명                                    |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | 개발 서버 시작 (localhost:3000)         |
| `npm run build`        | 프로덕션 빌드                           |
| `npm run start`        | 프로덕션 서버 시작                      |
| `npm run lint`         | ESLint 검사                             |
| `npm run lint:fix`     | ESLint 자동 수정                        |
| `npm run format`       | Prettier 포맷 적용                      |
| `npm run format:check` | Prettier 포맷 검사                      |
| `npm run type-check`   | TypeScript 타입 검사                    |
| `npm run analyze`      | 번들 분석                               |
| `npm run prepare`      | Husky 초기화 (npm install 시 자동 실행) |

## 설정 파일 위치

| 파일                | 설명                      |
| ------------------- | ------------------------- |
| `.prettierrc`       | Prettier 설정             |
| `.prettierignore`   | Prettier 무시 패턴        |
| `eslint.config.mjs` | ESLint v9 Flat Config     |
| `.husky/pre-commit` | Git pre-commit 훅         |
| `.husky/pre-push`   | Git pre-push 훅           |
| `.gitattributes`    | Git 줄바꿈 설정 (LF 강제) |

## Windows 환경 주의사항

### Husky 훅 실행

- Husky 훅은 **Git Bash**에서 실행됩니다.
- PowerShell이나 CMD에서 `git commit` 실행 시 Git Bash가 자동으로 훅을 실행합니다.
- `.husky/` 파일들은 반드시 **LF 줄바꿈**이어야 합니다 (CRLF 시 `\r: command not found` 오류).
- `.gitattributes`에서 `.husky/* text eol=lf`로 설정되어 있으므로 자동으로 관리됩니다.

### IDE 설정

VS Code 사용 시:

```json
{
  "files.eol": "\n",
  "[markdown]": {
    "files.eol": "\n"
  }
}
```

## 문제 해결

### "husky: not found" 오류

```bash
npm install
npm run prepare
```

### Prettier와 ESLint 충돌

- 설정이 이미 통합되어 있습니다 (`eslint-config-prettier`).
- 재발생 시: `npm run lint:fix` 후 `npm run format`

### type-check 실패

```bash
npm run type-check
# 타입 오류 내용 확인 후 코드 수정
```

## 다음 단계

1. **기존 Non-null assertion 제거** (점진적):
   - 환경 변수 검증 유틸리티 작성
   - `lib/supabase/` 파일들 리팩토링

2. **테스트 도구 추가** (선택사항):
   - Vitest 또는 Jest
   - React Testing Library

3. **CI/CD 파이프라인 통합**:
   - GitHub Actions에서 `npm run lint`, `npm run type-check` 실행
   - Pre-commit 단계에서 테스트 실행
