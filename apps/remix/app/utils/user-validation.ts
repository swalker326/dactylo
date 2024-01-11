import { z } from "zod";

export const PasswordSchema = z
	.string({ required_error: "Password is required" })
	.min(6, { message: "Password is too short" })
	.max(100, { message: "Password is too long" });
export const PasswordAndConfirmPasswordSchema = z
	.object({ password: PasswordSchema, confirmPassword: PasswordSchema })
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				path: ["confirmPassword"],
				code: "custom",
				message: "The passwords must match",
			});
		}
	});
