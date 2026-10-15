import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Opts a route (or controller) out of the global JWT authentication. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
