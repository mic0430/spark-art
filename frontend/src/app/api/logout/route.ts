import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
    const url = new URL(req.nextUrl);

    // modify url to redirect to the dashboard
    url.pathname = "/dashboard";

    // create a response with a redirect to the dashboard
    const res = NextResponse.redirect(url.toString());

    // remove authtoken cookie
    res.cookies.delete("authtoken");

    return res;
}