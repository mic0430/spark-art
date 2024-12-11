import { NextRequest, NextResponse } from "next/server";

type RequestBody = {
    username: string;
    password: string;
}

export async function POST(req: NextRequest) {
    const { username, password } = await req.json() as RequestBody;

    if (!username || !password) {
        return NextResponse.json({
            errors: {
                username: "Username is required",
                password: "Password is required"
            }
        }, {
            status: 400
        })
    }

    const formdata = new FormData();
    formdata.append("username", username);
    formdata.append("password", password);

    try {
        const res = await fetch("http://127.0.0.1:8000/api/register", {
            method: "POST",
            body: formdata
        })

        if (!res.ok) {
            return NextResponse.json({
                errors: {
                    message: "Something went wrong while logging in"
                }
            }, {
                status: res.status
            })
        }

        let token = res.headers.get("Authorization") as string
        token = token.slice(7)

        const response = NextResponse.json({})

        response.cookies.set("authtoken", token, {
            httpOnly: false,
            path: "/",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
        })

        return response;

    } catch (err) {
        console.error(err)
        return NextResponse.json({
            errors: {
                message: "An error occurred while logging in"
            }
        }, {
            status: 500
        })
    }
}
