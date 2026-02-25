    import { NextRequest , NextResponse } from "next/server";
    import { hashPassword , signToken } from "@/lib/auth";
    import { prisma } from "@/lib/prisma";

    export async function POST(req : NextRequest){
        try{
            const { fullName , email , password } = await req.json();

            if(!fullName || !email || !password){
                return NextResponse.json({error : "All fields are required!"} , { status : 400 });
            }

            //find if the entered user exists
            const existingUser = await prisma.user.findUnique({where : {email}});

            if(existingUser){
                return NextResponse.json({error : "Email already exists"} , {status : 409})
            }

            //we hash it using our auth middlewarea
            const hashedPassword = await hashPassword(password);

            const user = await prisma.user.create({
                data : {fullName , email , password : hashedPassword},
            });

            const token = signToken({id : user.id , email : user.email});

            const response = NextResponse.json({
                success : true,
                user : { id: user.id , fullName : user.fullName , email : user.email},
            },{status : 201});

            response.cookies.set("token" , token , {
                httpOnly : true , 
                secure : process.env.NODE_ENV === "production",
                sameSite : "lax",
                maxAge : 60*60*24*7,
            });

            return response;
        }catch(error){
            console.error("Signup error:", error)
            return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
        }
    }