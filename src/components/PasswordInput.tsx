"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PasswordInput(props: Omit<ComponentProps<typeof Input>, "type">) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Input
                {...props}
                type={show ? "text" : "password"}
                className={`pr-10 ${props.className ?? ""}`}
            />
            <button
                type="button"
                onClick={() => setShow((value) => !value)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}