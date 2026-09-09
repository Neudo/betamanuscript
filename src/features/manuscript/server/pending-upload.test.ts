import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cookies: vi.fn(), rpc: vi.fn(), maybeSingle: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: () => ({
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }) }), rpc: mocks.rpc,
}) }));
import { claimUpload, digestUploadToken, getUpload, requireSameOrigin } from "./pending-upload";

const id = "a289014e-c405-4ccd-9f3c-70a35ecf477c";
const owner = "843ef547-994c-4c55-bb7e-cb319ef1fa38";
const secret = "a".repeat(43);
const upload = () => ({ id, state: "ready", owner_id: null as string | null, expires_at: new Date(Date.now()+60000).toISOString(), token_digest: digestUploadToken(secret) });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.cookies.mockResolvedValue({ get: () => ({ value: `${id}.${secret}` }) });
  mocks.maybeSingle.mockResolvedValue({ data: upload(), error: null });
  mocks.rpc.mockResolvedValue({ data: true, error: null });
});
describe("pending manuscript ownership", () => {
  it("claims only after verifying the uploader's secret", async () => {
    expect((await claimUpload(id,owner)).owner_id).toBe(owner);
    expect(mocks.rpc).toHaveBeenCalledWith("claim_manuscript_upload", { p_id: id, p_digest: digestUploadToken(secret), p_owner: owner });
  });
  it.each([undefined, `${id}.${"b".repeat(43)}`, `other.${secret}`])("rejects a missing or incorrect cookie: %s", async (value) => {
    mocks.cookies.mockResolvedValue({ get: () => value ? { value } : undefined });
    await expect(claimUpload(id,owner)).rejects.toMatchObject({ status: 403 });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("lets the bound account resume without the original browser cookie, even after four hours", async () => {
    mocks.cookies.mockResolvedValue({ get: () => undefined });
    mocks.maybeSingle.mockResolvedValue({ data: { ...upload(), owner_id: owner, state: "claimed", expires_at: new Date(0).toISOString() }, error: null });
    expect((await claimUpload(id,owner)).owner_id).toBe(owner);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects a different account even with the original uploader cookie", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { ...upload(), owner_id: "another-owner" }, error: null });
    await expect(claimUpload(id,owner)).rejects.toMatchObject({ status: 403 });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects expired anonymous files before cleanup has physically removed them", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { ...upload(), expires_at: new Date(0).toISOString() }, error: null });
    await expect(getUpload(id)).rejects.toMatchObject({ status: 410 });
  });
  it("never exposes files already selected for cleanup", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { ...upload(), state: "deleting" }, error: null });
    await expect(claimUpload(id,owner)).rejects.toMatchObject({ status: 410 });
  });
  it("handles two claims by the same account without losing the file", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    mocks.maybeSingle.mockResolvedValueOnce({ data: upload(), error: null }).mockResolvedValueOnce({ data: { ...upload(), owner_id: owner }, error: null });
    expect((await claimUpload(id,owner)).owner_id).toBe(owner);
  });
  it("blocks cross-origin writes", () => {
    expect(() => requireSameOrigin(new Request("https://betamanuscript.com/api/manuscript-uploads", { headers: { origin: "https://attacker.test" } }))).toThrow("Invalid request origin");
    expect(() => requireSameOrigin(new Request("https://betamanuscript.com/api/manuscript-uploads", { headers: { origin: "https://betamanuscript.com" } }))).not.toThrow();
  });
});
