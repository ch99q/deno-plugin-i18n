import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { identify, override } from "../main.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  identify(req);
  
  const res = await ctx.next();

  return override(res)
}