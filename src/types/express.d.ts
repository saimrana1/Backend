declare global {
  namespace Express {
    interface Request {
      authUser?: { userId: string; username: string; role: string };
    }
  }
}

export {};
