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
  offset: number,
): string {
  if (from && to) {
    if (from > to) {
      [from, to] = [to, from]; // swap
    }
    const text = `${format(new Date(from + offset), "yyyy-MM-dd")} ~ ${
      format(new Date(to + offset), "yyyy-MM-dd")
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
    const text = `${format(new Date(from + offset), "yyyy-MM-dd")}`;
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

addEventListener("fetch", (event) => {
  try {
    const url = new URL(event.request.url);

    const path = url.pathname.replace(/^\/|\/$/g, "");
    const args = path.split("/");

    switch (args[0]) {
      case "dday": {
        const offset = +(url.searchParams.get("offset") ?? 0);
        const from = args[1] ? new Date(args[1]).getTime() - offset : null;
        const to = args[2] ? new Date(args[2]).getTime() - offset : null;
        const now = +(url.searchParams.get("now") ?? Date.now());

        event.respondWith(
          responseSvg(createDdayLabel(from, to, now, offset)),
        );
        return;
      }
      case "error": {
        throw new Error("error");
      }
    }

    event.respondWith(
      responseSvg(label([{ text: "badge.dist.be", bgColor: "#4D86DB" }])),
    );
  } catch (e) {
    console.warn("[error]", e);
    event.respondWith(
      responseSvg(label([{ text: "#Error", bgColor: "#D95436" }])),
    );
  }
});
