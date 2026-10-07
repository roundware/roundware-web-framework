import { ApiClient } from "./api-client";

describe("ApiClient", () => {
  let urls: string[];

  beforeEach(() => {
    urls = [];
    global.fetch = jest.fn(async (url: RequestInfo | URL) => {
      urls.push(url.toString());
      return { ok: true, json: async () => ({}) } as Response;
    }) as jest.Mock;
  });

  it("sends lang on GETs only", async () => {
    const client = new ApiClient("https://api.example.test/api/3");
    client.language = "es";
    await client.get("/tags/", { project_id: 1 });
    await client.post("/votes/", { session_id: 1 });
    expect(new URL(urls[0]).searchParams.get("lang")).toBe("es");
    expect(new URL(urls[1]).searchParams.has("lang")).toBe(false);
  });

  it("sends site on every request, on a test site (server docs/021)", async () => {
    const client = new ApiClient("https://api.example.test/api/3");
    client.site = "test";
    await client.get("/tags/", { project_id: 1 });
    await client.post("/assets/", new FormData(), {
      contentType: "multipart/form-data",
    });
    expect(urls.map((u) => new URL(u).searchParams.get("site"))).toEqual([
      "test",
      "test",
    ]);
  });

  it("sends no site on the live site", async () => {
    const client = new ApiClient("https://api.example.test/api/3");
    await client.get("/tags/", { project_id: 1 });
    expect(new URL(urls[0]).searchParams.has("site")).toBe(false);
  });
});
