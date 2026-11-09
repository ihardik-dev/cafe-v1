import { authorize } from '../../plugins/auth.js';

/** Shared ADMIN-only guard. Admin privileges are intentionally limited to menu/category routes. */
export const adminOnly = authorize('ADMIN');
