import { invariant } from "@epic-web/invariant";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { signId } = params;
  invariant(signId, "sign-id is required");
  const sign = await prisma.sign.findUnique({
    where: { id: signId }
  });
  invariant(sign, "sign not found");
  return json({ sign });
}

export default function SignIdRoute() {
  const { sign } = useLoaderData<typeof loader>();
  console.log(sign);

  return (
    <div className="flex flex-col">
      <h2 className="text-4xl">{sign.term}</h2>
    </div>
  );
}
