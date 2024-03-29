import { json, redirect } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "@dactylo/db";
import { getDomainUrl } from "~/utils/misc";
import { generateTOTP, verifyTOTP } from "~/utils/totp.server";
import { Submission } from "@conform-to/react";
import { verifySessionStorage } from "~/utils/verification.server";
import { parseWithZod } from "@conform-to/zod";
import { invariant } from "@epic-web/invariant";

export const codeQueryParam = "code";
export const targetQueryParam = "target";
export const typeQueryParam = "type";
export const redirectToQueryParam = "redirectTo";

const types = ["onboarding", "reset-password", "change-email", "2fa"] as const;
export const onboardingEmailSessionKey = "onboardingEmail";
export const VerificationTypeSchema = z.enum(types);
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>;
export const twoFAVerificationType = "2fa" satisfies VerificationTypes;
export const VerifySchema = z.object({
	code: z.string().min(6).max(6),
	type: VerificationTypeSchema,
	target: z.string(),
	redirectTo: z.string().optional(),
});

export type VerifyFunctionArgs = {
	request: Request;
	submission: Submission<z.infer<typeof VerifySchema>>;
	body: FormData | URLSearchParams;
};
export function getRedirectToUrl({
	request,
	type,
	target,
	redirectTo,
}: {
	request: Request;
	type: VerificationTypes;
	target: string;
	redirectTo?: string;
}) {
	const redirectToUrl = new URL(`${getDomainUrl(request)}/auth/verify`);
	redirectToUrl.searchParams.set(typeQueryParam, type);
	redirectToUrl.searchParams.set(targetQueryParam, target);
	if (redirectTo) {
		redirectToUrl.searchParams.set(redirectToQueryParam, redirectTo);
	}
	return redirectToUrl;
}

export async function prepareVerification({
	period,
	request,
	type,
	target,
}: {
	period: number;
	request: Request;
	type: VerificationTypes;
	target: string;
}) {
	const verifyUrl = getRedirectToUrl({ request, type, target });
	const redirectTo = new URL(verifyUrl.toString());

	const { otp, ...verificationConfig } = generateTOTP({
		algorithm: "SHA256",
		// Leaving off 0 and O on purpose to avoid confusing users.
		charSet: "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
		period,
	});
	const verificationData = {
		type,
		target,
		...verificationConfig,
		expiresAt: new Date(Date.now() + verificationConfig.period * 5000),
	};
	await prisma.verification.upsert({
		where: { target_type: { target, type } },
		create: verificationData,
		update: verificationData,
	});

	// add the otp to the url we'll email the user.
	verifyUrl.searchParams.set(codeQueryParam, otp);

	return { otp, redirectTo, verifyUrl };
}

export async function handleOnboardingVerification({
	submission,
}: VerifyFunctionArgs) {
	invariant(
		submission.status === "success",
		"submission.value should be defined by now",
	);
	const verifySession = await verifySessionStorage.getSession();
	verifySession.set(onboardingEmailSessionKey, submission.value.target);
	return redirect("/auth/onboarding", {
		headers: {
			"set-cookie": await verifySessionStorage.commitSession(verifySession),
		},
	});
}

export async function isCodeValid({
	code,
	type,
	target,
}: {
	code: string;
	type: VerificationTypes | typeof twoFAVerificationType;
	target: string;
}) {
	const verification = await prisma.verification.findUnique({
		where: {
			target_type: {
				target,
				type,
			},
			AND: {
				expiresAt: {
					gt: new Date(),
				},
			},
		},
		select: { algorithm: true, secret: true, period: true, charSet: true },
	});
	if (!verification) return false;
	const result = verifyTOTP({
		otp: code,
		...verification,
	});
	if (!result) return false;

	return true;
}

export async function validateRequest(
	request: Request,
	body: URLSearchParams | FormData,
) {
	const submission = await parseWithZod(body, {
		schema: VerifySchema.superRefine(async (data, ctx) => {
			const codeIsValid = await isCodeValid({
				code: data[codeQueryParam],
				type: data[typeQueryParam],
				target: data[targetQueryParam],
			});
			if (!codeIsValid) {
				ctx.addIssue({
					path: ["code"],
					code: z.ZodIssueCode.custom,
					message: "Invalid code",
				});
				return;
			}
		}),
		async: true,
	});

	if (submission.status !== "success") {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === "error" ? 400 : 200 },
		);
	}

	// this code path could be part of a loader (GET request), so we need to make
	// sure we're running on primary because we're about to make writes.
	// await ensurePrimary();

	const { value: submissionValue } = submission;

	async function deleteVerification() {
		await prisma.verification.delete({
			where: {
				target_type: {
					type: submissionValue[typeQueryParam],
					target: submissionValue[targetQueryParam],
				},
			},
		});
	}

	switch (submissionValue[typeQueryParam]) {
		// case "reset-password": {
		// 	await deleteVerification();
		// 	return handleResetPasswordVerification({ request, body, submission });
		// }
		case "onboarding": {
			await deleteVerification();
			return handleOnboardingVerification({ request, body, submission });
		}
		// case "change-email": {
		// 	await deleteVerification();
		// 	return handleChangeEmailVerification({ request, body, submission });
		// }
		// case "2fa": {
		// 	return handleLoginTwoFactorVerification({ request, body, submission });
		// }
	}
}
