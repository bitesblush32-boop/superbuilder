# Refactoring Prompt: Dashboard Routing, Admin Sync, and Dynamic Content

Please execute the following refactoring plan to fix our routing issues, sync admin stage descriptions, and enable dynamic schedule content for the Orientation stage.

## Background Context
- **Routing**: `app/dashboard/page.tsx` and `lib/auth/getStudentOrRedirect.ts` currently point students to old `/register/stage-2/...` and `/register/stage-3/...` routes. We want all these user flows inside `/dashboard/` directly.
- **Admin Setup**: The admin panel (`StagesClient.tsx`) still describes Stage 1 as "Applications", but the user flow now includes Personal Info, Parents Info, and Team Building all inside Stage 1.
- **Dynamic Content**: The admin `/schedule` page allows creating schedule items with `targetSection="orientation"`, but `OrientationClient.tsx` ignores them and uses a statically hardcoded YouTube iframe.

---

## Execution Steps

**1. Move Routes to Dashboard:**
*   Move `app/register/stage-2/domain` -> `app/dashboard/domain`
*   Move `app/register/stage-2/idea` -> `app/dashboard/idea`
*   Move `app/register/stage-2/orientation` -> `app/dashboard/intro`
*   Move `app/register/stage-2/quiz` -> `app/dashboard/quiz`
*   Move `app/register/stage-3/engage` -> `app/dashboard/engage`
*   Move `app/register/stage-3/pay` -> `app/dashboard/pay`

*(You may need to update imports for components imported from outside these directories!)*

**2. Update Navigation Logic in `lib/auth/getStudentOrRedirect.ts`:**
*   In `getStage2SubRoute`, modify the returned strings to match the new dashboard routes:
    *   `/register/stage-2/orientation` -> `/dashboard/intro`
    *   `/register/stage-2/domain` -> `/dashboard/domain`
    *   `/register/stage-2/quiz` -> `/dashboard/quiz`

**3. Update Hardcoded Links in `app/dashboard/page.tsx`:**
*   In the `NEXT_STEP` dictionary mapping, update the `href` strings:
    *   `href: '/register/stage-2/orientation'` -> `href: '/dashboard/intro'`
    *   `href: '/register/stage-3/engage'` -> `href: '/dashboard/engage'`

**4. Admin Stage Sync in `app/admin/(protected)/stages/_components/StagesClient.tsx`:**
*   Update `STAGE_META` descriptions. In `stage_1_open`, change `name: 'Applications'` to `name: 'Applications & Team Building'`. Change description to "Students fill in personal info, parent details, and create/join a team."

**5. Wire dynamic admin videos into Orientation:**
*   **In `app/dashboard/intro/page.tsx`**: Add Drizzle query to fetch from `schedule_items` table where `targetSection === 'orientation'` and `isVisible === true`. Pass the returned items down to the client component.
*   **In `app/dashboard/intro/_components/OrientationClient.tsx`**: Add `adminVideos` to props. Map through the videos array to render dynamic YouTube iframes using the `url` from the database. Hide the static hardcoded "Watch First" `<iframe>` if dynamic videos exist.
