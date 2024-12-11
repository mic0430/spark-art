"use server";

import { UserRepo } from "@/repo";
import { cookies } from "next/headers";
import Image from "next/image";
import React from "react";

export default async function Navbar() {
    const navlinkStyle = "hover:bg-indigo-500 hover:text-white px-2 py-1 rounded-lg transition ease-in-out duration-250";
    /**
     * NavlinkProps is a helper type for the Navlink component.
     */
    type NavlinkProps = {
        link: string;
        name: string;
    }
    /**
     * Navlink is a helper component for a single link in the navbar.
     */
    function Navlink(props: NavlinkProps) {
        return (
            <a href={props.link} className={navlinkStyle}>
                {props.name}
            </a>
        );
    };

    // Get cookie store
    const cookieStore = cookies();

    // Get authtoken from cookies
    const authtoken = cookieStore.get("authtoken")?.value;

    // Check if user is authenticated
    const isAuthenticated = authtoken !== undefined;

    const user = isAuthenticated ? await UserRepo.getAuthUser(authtoken) : null;

    return (
        <nav className="bg-indigo-600 text-indigo-50 flex justify-between px-16 py-4 items-center">
            <h1 className="text-2xl font-semibold">
                <a href="/dashboard">SparkArt</a>
            </h1>
            <ul className="flex space-x-2">
                <Navlink link="/dashboard" name="Dashboard" />
                <Navlink link="/topics" name="Topics" />
                {isAuthenticated && <Navlink link={"/users/" + user?.id} name="Profile" />}
                {isAuthenticated && <Navlink link="/api/logout" name="Logout" />}
                {isAuthenticated &&
                    <div>
                        <Image src={user ? user.profileImageUrl : ""} alt="" width={50} height={50} className="h-8 w-8 bg-blue-500 rounded-full" />
                    </div>
                }
                {!isAuthenticated && <Navlink link="/login" name="Login" />}
                {!isAuthenticated && <Navlink link="/register" name="Register" />}
            </ul>
        </nav>
    );
}