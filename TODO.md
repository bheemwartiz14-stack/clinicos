# TODO - MediClinic build fixes

## Step 1: Fix Select2Field export
- [ ] Inspect current `apps/web/components/form-controls.tsx` exports
- [ ] Implement and export a compatible `Select2Field` component

## Step 2: Restore missing protected patient routes
- [ ] Add shared base routes under `apps/web/app/(protected)/patients/**` required by re-export stubs:
  - [ ] `patients/page.tsx`
  - [ ] `patients/[id]/page.tsx`
  - [ ] `patients/[id]/timeline/page.tsx`
  - [ ] `patients/[id]/documents/page.tsx`
  - [ ] `patients/[id]/billing/page.tsx`
- [ ] Ensure these routes export a default React component (server component unless clearly client)

## Step 3: Re-run build
- [ ] Run `bun run build --filter @mediclinic/web` (or `turbo build --filter @mediclinic/web`)
- [ ] Resolve any remaining build errors

