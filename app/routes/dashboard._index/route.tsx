import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { prisma } from "~/db.server";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const videos = await prisma.video.findMany({
    where: { user: { id: userId } },
    select: {
      id: true,
      name: true,
      url: true,
      status: true,
      sign: true,
      gifUrl: true
    },
    take: 10
  });
  return typedjson({ videos });
}

export default function DashboardIndex() {
  const { videos } = useTypedLoaderData<typeof loader>();

  return (
    <div className="flex flex-col pb-12">
      <h2 className="text-4xl">Your Videos</h2>
      <div className="flex gap-3 flex-wrap">
        {videos.map(({ id, gifUrl, sign: { id: signId, term } }) => (
          <Card key={id}>
            <div className="w-full">
              <CardHeader>
                <Link to={`/sign/${signId}`}>
                  <CardTitle className="underline capitalize">{term}</CardTitle>
                </Link>
              </CardHeader>
              <CardContent>
                <Link to={`/sign/${signId}`}>
                  <img
                    src={gifUrl || ""}
                    alt="sign video"
                    className="w-full object-contain"
                  />
                </Link>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
