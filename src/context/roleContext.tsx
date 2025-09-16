"use client"
import { createContext } from "react";
interface roleContext {
    role:string,
    toggle:()=>void
}

const roleContext = createContext<roleContext>({
    role:"User",
    toggle:()=>{}
})
export default roleContext;