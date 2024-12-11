"use client";

export default function Login() {
    const inputDiv = "flex flex-col items-center justify-center space-y-1 w-full";
    const inputStyle = "border-b-2 border-indigo-500 w-3/5 text-center bg-gray-100 rounded";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password
            })
        });

        if (response.ok) {
            window.location.href = "/dashboard";
        } else {
            alert("Login failed. Please check your credentials and try again.");
        }
    };

    return (
        <main>
            <h1 className="text-center text-4xl pt-8 font-semibold text-indigo-500">Login</h1>
            <div className="flex justify-center mt-4">
                <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center py-8 w-1/2 xl:w-1/3 border-4 space-y-4">
                    <div className={inputDiv}>
                        <label htmlFor="username" className="text-indigo-500 text-lg">Username</label>
                        <input type="text" name="username" id="username" className={inputStyle} required />
                    </div>
                    <div className={inputDiv}>
                        <label htmlFor="password" className="text-indigo-500 text-lg">Password</label>
                        <input type="password" name="password" id="password" className={inputStyle} required />
                    </div>
                    <div className={inputDiv}>
                        <button type="submit" className="bg-indigo-500 text-white p-2 rounded-md w-64 hover:bg-indigo-600 transition ease-in-out duration-150">Login</button>
                    </div>
                    <div>
                        <p className="text-black-500">Don&apos;t have an account?
                            <a href="/register" className="ml-1 text-indigo-500 underline">Register</a>
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}
