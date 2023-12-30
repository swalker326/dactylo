import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import ImageWithPlaceholder from "~/components/image-placeholder";
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
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {videos.map(({ id, gifUrl, sign: { id: signId, term } }) => (
          <div key={id} className="p-4 w-full">
            <Link to={`/sign/${signId}`}>
              <Card>
                <div>
                  <CardHeader>
                    <CardTitle className="underline capitalize">
                      {term}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageWithPlaceholder
                      src={gifUrl}
                      alt="sign video"
                      className="aspect-square w-full object-cover overflow-hidden rounded-lg"
                    />
                    {/* <img
                    src={gifUrl || ""}
                    alt="sign video"
                    className="w-full object-contain"
                  /> */}
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
