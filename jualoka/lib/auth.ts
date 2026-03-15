import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOTP } from "better-auth/plugins";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: false, // Require email verification before allowing sign-in
        requireEmailVerification: true,
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                const subject = type === "sign-in" ? "Kode Login Jualoka" : "Kode Verifikasi Jualoka";
                const html = `
                    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                        <h2 style="color: #1a7035; text-align: center;">Jualoka</h2>
                        <p>Halo,</p>
                        <p>Berikut adalah kode verifikasi Anda (berlaku 10 menit):</p>
                        <h1 style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #333; background: #f5f5f5; padding: 15px; border-radius: 8px;">
                            ${otp}
                        </h1>
                        <p>Jangan berikan kode ini kepada siapapun.</p>
                    </div>
                `;

                await transporter.sendMail({
                    from: `"Jualoka" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject,
                    html,
                });
            },
        })
    ],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await prisma.store.create({
                        data: {
                            userId: user.id,
                            name: user.name,
                            slug: user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 6),
                            whatsappNumber: "",
                        }
                    });
                }
            }
        }
    },
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
    trustedOrigins: (request) => {
        const origin = request?.headers.get("origin") || "";
        const allowed = [
            "http://localhost:3000",
            "https://jualoka.my.id",
            "https://www.jualoka.my.id",
            process.env.BETTER_AUTH_URL,
            process.env.NEXT_PUBLIC_APP_URL,
        ].filter(Boolean) as string[];
        if (allowed.includes(origin)) return allowed;
        // Allow any Cloudflare tunnel URL (http or https)
        if (/^https?:\/\/.*\.trycloudflare\.com$/.test(origin)) return [...allowed, origin];
        return allowed;
    },
});

import { headers } from "next/headers";

export async function verifyAuth(req: Request): Promise<string> {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user) {
        throw new Error("Missing or invalid token");
    }
    return session.user.id;
}
