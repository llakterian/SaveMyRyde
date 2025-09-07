import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtUserPayload extends jwt.JwtPayload {
    userId: string;
    role: string;
    email?: string | null;
    phone?: string | null;
}

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');
    return secret;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const header = req.headers['authorization'];
        if (!header || !header.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = header.slice('Bearer '.length);
        const decoded = jwt.verify(token, getJwtSecret()) as JwtUserPayload;
        (req as any).user = decoded; // attach to request
        next();
        return;
    } catch (e) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
};

export const requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as any).user as JwtUserPayload | undefined;
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (user.role !== role) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        next();
        return;
    };
};

export const signJwt = (payload: JwtUserPayload): string => {
    const expiresIn: jwt.SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as any) || '7d';
    return jwt.sign(payload as object, getJwtSecret() as jwt.Secret, { expiresIn } as jwt.SignOptions);
};