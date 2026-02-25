import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export function hashPassword(password : string) : Promise<string>{
    return bcrypt.hash(password , 10);
}

export function comparePassword(password: string , hash : string) : Promise<boolean>{
    return bcrypt.compare(password,hash);
}

export interface payload{
    id : string,
    email : string,
}

export function signToken(payload : payload) : string{
    return jwt.sign(payload , JWT_SECRET , {expiresIn : "7d"});
}

export function verifyToken(token : string) : JwtPayload{
    return jwt.verify(token , JWT_SECRET) as JwtPayload;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
  return response;
}