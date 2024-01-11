import { Form } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import GoogleIcon from "~/icons/google.svg?react";

export const GOOGLE_PROVIDER_NAME = "google";
// to add another provider, set their name here and add it to the providerNames below

export const providerNames = [GOOGLE_PROVIDER_NAME] as const;
export const ProviderNameSchema = z.enum(providerNames);
export type ProviderName = z.infer<typeof ProviderNameSchema>;

export const providerLabels: Record<ProviderName, string> = {
	[GOOGLE_PROVIDER_NAME]: "Google",
} as const;

export const providerIcons: Record<ProviderName, React.ReactNode> = {
	[GOOGLE_PROVIDER_NAME]: <GoogleIcon className="w-5 h-5" />,
} as const;

export function ProviderConnectionForm({
	redirectTo,
	// type,
	providerName,
}: {
	redirectTo?: string | null;
	type: "Connect" | "Login" | "Signup";
	providerName: ProviderName;
}) {
	const label = providerLabels[providerName];
	const formAction = `/auth/${providerName}`;
	// const isPending = useIsPending({ formAction });
	return (
		<Form
			className="flex items-center justify-center gap-2"
			action={formAction}
			method="POST"
		>
			{redirectTo ? (
				<input type="hidden" name="redirectTo" value={redirectTo} />
			) : null}
			<Button type="submit" className="w-full">
				<span className="inline-flex items-center gap-1.5">
					{providerIcons[providerName]}
					<span>{label}</span>
				</span>
			</Button>
		</Form>
	);
}
