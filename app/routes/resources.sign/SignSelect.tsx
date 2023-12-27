import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import { loader as resouceLoader } from "~/routes/resources.sign/route";

export function SignSelect({ name }: { name: string }) {
  const signFetcher = useFetcher<typeof resouceLoader>();
  const signs = signFetcher.data?.signs;
  const [selectedSign, setSelectedSign] = useState<string>("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    signFetcher.submit(
      { query: query ?? "" },
      { method: "GET", action: "/resources/sign" }
    );
  }, [query]);

  const filteredSigns =
    query === ""
      ? signs
      : signs?.filter((sign) => {
          return sign.term.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox name={name} value={selectedSign} onChange={setSelectedSign}>
      <div className="relative">
        <Combobox.Input
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"`}
          displayValue={(signId) => {
            const sign = filteredSigns?.find((s) => s.id === signId);
            if (!sign) {
              return "";
            }
            return sign.term;
          }}
          defaultValue={""}
          placeholder={"Search"}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          {filteredSigns?.map((sign) => (
            <Combobox.Option
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? "bg-blue-200 text-white" : "text-gray-900"
                }`
              }
              key={sign.id}
              value={sign.id}
            >
              {sign.term}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
