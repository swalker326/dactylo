import { useState } from "react";
import { ZodError, ZodSchema, z } from "zod";

export async function parseFormData<T>(
	formData: FormData,
	schema: ZodSchema<T>,
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const object: Record<string, any> = {};
	formData.forEach((value, key) => {
		// Check if the key already exists
		// eslint-disable-next-line no-prototype-builtins
		if (Object.hasOwn(object, key)) {
			// If the key exists and it's not an array, convert it into an array
			if (!Array.isArray(object[key])) {
				object[key] = [object[key]];
			}
			// Push the new value to the array
			object[key].push(value);
		} else {
			// If the key doesn't exist, add it to the object
			object[key] = value;
		}
	});
	const response = await schema.safeParseAsync(object);
	return response;
}

type ErrorMessages<T> = {
	[P in keyof T]?: string;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useZodErrors<T extends ZodSchema<any>>(schema: T) {
	type SchemaShape = z.infer<typeof schema>;
	type SchemaErrorMessages = ErrorMessages<SchemaShape>;
	const [errors, setErrors] = useState<ZodError<SchemaShape> | null>(null);
	const [hasError, setHasError] = useState(false);
	const [errorMessages, setErrorMessages] = useState<SchemaErrorMessages>();

	const parse = async (fd: FormData) => {
		const response = await parseFormData(fd, schema);
		if (response.success) {
			setErrors(null);
			setErrorMessages({});
			setHasError(false);
			return response.success; // Return the parsed data
		}
		setErrors(response.error);
		setErrorMessages(
			response.error.issues.reduce(
				(acc, issue) => {
					acc[issue.path.join(".")] = issue.message;
					return acc;
				},
				{} as Record<string, string>,
			),
		);
		setHasError(true);
		return null; // Return null to indicate a validation error
	};

	return { parse, hasError, error: errors, errorMessages };
}
