import { Project } from "./project";
import { ApiClient } from "./api-client";

// The answers' text (2026-10-27): what participants see is a tag's
// description; a tag without one shows its value, the admin's short name.
describe("Project.fetchUIConfig", () => {
  const tags = [
    { id: 1, value: "Story", description: "Tell us a story about this place", tag_category_id: 1 },
    { id: 2, value: "Visitor", description: "", tag_category_id: 1 },
    { id: 3, value: "Local", description: null, tag_category_id: 1 },
  ];
  const groups = [
    {
      id: 10,
      name: "Who",
      ui_mode: "speak",
      is_active: true,
      header_text: "Who are you?",
      select_type: "single",
      ui_item_filter: "none",
      ui_items: tags.map((t, i) => ({
        id: 100 + i,
        tag_id: t.id,
        sort_index: i,
        is_active: true,
        is_default: false,
        parent_id: null,
      })),
    },
  ];
  const apiClient = {
    get: jest.fn((path: string) => Promise.resolve(path.startsWith("/uigroups/") ? groups : tags)),
  } as unknown as ApiClient;

  it("shows the description, else the value", async () => {
    const config = await new Project(1, { apiClient }).fetchUIConfig();
    expect(config.speak![0].display_items.map((i) => i.tag_display_text)).toEqual([
      "Tell us a story about this place",
      "Visitor",
      "Local",
    ]);
  });
});
