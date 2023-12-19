import { createCookie } from "@remix-run/node";
import { CSRF, CSRFError } from "remix-utils/csrf/server";

const cookie = createCookie("csrf", {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  secrets: ["mys3cr3t"]
});

export const csrf = new CSRF({ cookie });

export async function validateCSRF(formData: FormData, headers: Headers) {
  try {
    console.log("validateCSRF");
    console.log(csrf);
    await csrf.validate(formData, headers);
  } catch (error) {
    if (error instanceof CSRFError) {
      throw new Response("Invalid CSRF token", { status: 403 });
    }
    throw error;
  }
}
