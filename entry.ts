import { label } from "./svg.ts";

function responseSvg(body: string) {
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml",
    },
  });
}

addEventListener("fetch", async (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname.replace(/^\/|\/$/g, "");
  const pathParts = path.split("/");

  console.log("->", pathParts);
  switch (pathParts[0]) {
    case "dday": {
      const from = new Date(pathParts[1]);
      const to = new Date(pathParts[2]);
    }
  }

  event.respondWith(responseSvg(label([{ text: "label.dist.be" }])));
});
