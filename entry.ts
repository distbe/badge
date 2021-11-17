import { label } from "./svg.ts";
import { format } from "https://deno.land/std@0.115.0/datetime/mod.ts";

function responseSvg(body: string) {
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml",
    },
  });
}

const ONE_DAY = 1000 * 60 * 60 * 24;
function createDdayLabel(
  from: number | null,
  to: number | null,
  now: number,
): string {
  if (from && to) {
    if (from > to) {
      [from, to] = [to, from]; // swap
    }
    const text = `${format(new Date(from), "yyyy-MM-dd")} ~ ${
      format(new Date(to), "yyyy-MM-dd")
    }`;
    if (now < from) {
      const dday = Math.ceil((from - now) / ONE_DAY);
      return label([
        {
          text: text,
        },
        {
          text: `D-${dday}`,
          bgColor: "#2A8C82",
        },
      ]);
    }
    if (now < to + ONE_DAY) {
      const dday = Math.max(1, Math.ceil((now - from) / ONE_DAY));
      return label([
        {
          text: text,
        },
        {
          text: `Day ${dday}`,
          bgColor: "#05F2AF",
        },
      ]);
    }
    return label([
      {
        text: text,
        bgColor: "#cccccc",
      },
    ]);
  }

  if (from) {
    const text = `${format(new Date(from), "yyyy-MM-dd")}`;
    if (now < from) {
      const dday = Math.ceil((from - now) / ONE_DAY);
      return label([
        {
          text: text,
        },
        {
          text: `D-${dday}`,
          bgColor: "#2A8C82",
        },
      ]);
    }
    if (now < from + ONE_DAY) {
      return label([
        {
          text: text,
        },
        {
          text: `D-Day`,
          bgColor: "#05F2AF",
        },
      ]);
    }

    return label([
      {
        text: text,
        bgColor: "#cccccc",
      },
    ]);
  }

  return label([{ text: "D-Day", bgColor: "#05F2AF" }]);
}

addEventListener("fetch", async (event) => {
  const url = new URL(event.request.url);

  const path = url.pathname.replace(/^\/|\/$/g, "");
  const args = path.split("/");

  switch (args[0]) {
    case "dday": {
      let from = args[1] ? new Date(args[1]).getTime() : null;
      let to = args[2] ? new Date(args[2]).getTime() : null;
      const now = +(url.searchParams.get("now") ?? Date.now());

      event.respondWith(
        responseSvg(createDdayLabel(from, to, now)),
      );
      return;
    }
  }

  event.respondWith(responseSvg(label([{ text: "label.dist.be" }])));
});
