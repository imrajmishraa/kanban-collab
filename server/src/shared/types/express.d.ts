declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: {
        userId: string;
        email: string;
        fullName: string;
      };
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export {};
