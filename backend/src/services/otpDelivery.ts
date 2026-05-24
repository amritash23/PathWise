import nodemailer from "nodemailer";
import { env } from "../config/env";

export async function deliverOtp(email: string, code: string) {
  if (env.OTP_DELIVERY === "log" || env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[otp] email=${email} code=${code}`);
    return { delivered: "log" as const };
  }

  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    throw new Error("SMTP is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Your PathWise OTP code",
    text: `Your PathWise OTP code is: ${code}. It expires in ${env.OTP_TTL_MINUTES} minutes.`
  });

  return { delivered: "smtp" as const };
}

