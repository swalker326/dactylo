import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import { loader as resourceLoader } from "~/routes/resources.sign/route";

export function SignSelect({
	name,
	defaultValue,
}: {
	name: string;
	defaultValue?: string;
}) {
	const signFetcher = useFetcher<typeof resourceLoader>();
	const signs = signFetcher.data?.signs;
	const [selectedSign, setSelectedSign] = useState<string>(defaultValue || "");
	const [query, setQuery] = useState("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
useEffect(() => {
		if (defaultValue) {
			signFetcher.submit(
				{ query: "", id: defaultValue },
				{ method: "GET", action: "/resources/sign" },
			);
		}
	}, [defaultValue]);

	console.log("Sign Fetcher Data: ", signFetcher.data);
	const filteredSigns =
		query === ""
			? signs
			: signs?.filter((sign) => {
					return sign.term.word.toLowerCase().includes(query.toLowerCase());
			  });

	return (
		<Combobox
			name={name}
			value={selectedSign}
			onChange={setSelectedSign}
			defaultValue={defaultValue}
		>
			<div className="relative">
				<Combobox.Input
					className={`flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"`}
					displayValue={(signId) => {
						const sign = filteredSigns?.find((s) => s.id === signId);
						console.log("SignSelect SIGN", sign);
						if (!sign) {
							return "";
						}
						return sign.term.word;
					}}
					defaultValue={""}
					placeholder={"Select a Sign"}
					onChange={(event) => {
						const value = event.target.value;
						setQuery(value);
						signFetcher.submit(
							{ query: value ?? "" },
							{ method: "GET", action: "/resources/sign" },
						);
					}}
				/>
				<Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-sm bg-gray-200 drop-shadow-2xl py-1 text-base ring-1 ring-black/5 focus:outline-none sm:text-sm">
					{filteredSigns && filteredSigns.length > 0 ? (
						filteredSigns.map((sign) => (
							<Combobox.Option
								className={({ active }) =>
									`relative cursor-default select-none p-2 rounded-sm pl-10 pr-4 ${
										active ? "bg-blue-600 text-white" : "text-gray-900"
									}`
								}
								key={sign.id}
								value={sign.id}
							>
								{sign.term.word}
							</Combobox.Option>
						))
					) : (
						<button
							type="button"
							className="relative cursor-default select-none p-2 rounded-sm pl-10 pr-4"
						>
							<h2>No Word Found - Request a new one?</h2>
						</button>
					)}
				</Combobox.Options>
			</div>
		</Combobox>
	);
}
