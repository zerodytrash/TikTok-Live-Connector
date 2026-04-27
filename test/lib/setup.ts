import 'dotenv/config';
import { afterEach, vi } from 'vitest';

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});
