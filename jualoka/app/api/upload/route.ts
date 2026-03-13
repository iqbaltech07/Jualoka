import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { verifyAuth } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        // Require authentication for uploads
        const userId = await verifyAuth(req)
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ message: "File is required" }, { status: 400 })
        }

        // Validate file type (basic check to ensure it's an image)
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 })
        }

        // Generate a unique filename: store_images/[userId]-[timestamp]-[filename]
        const timestamp = Date.now()
        // Clean filename of spaces and special chars
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
        const filename = `store_images/${userId}-${timestamp}-${safeName}`

        // Upload to Vercel Blob (private store — do not use access: "public")
        const blob = await put(filename, file, {
            access: "public",
            addRandomSuffix: false,
        })

        return NextResponse.json({ url: blob.url }, { status: 200 })

    } catch (error: any) {
        console.error("Upload Error:", error)
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
