import { auth } from "@/auth";

export const proxy = auth((req) => {
    if (!req.auth){
        return Response.redirect(new URL("/login", req.nextUrl.origin))
    }
})

export const config= {
    matcher: ["/profile/:path*", "/admin/:path*"],
}