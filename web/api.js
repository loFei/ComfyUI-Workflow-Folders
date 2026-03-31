const API_BASE = "/wf/workflow-folders";

export const api = {
  async mkdir(path, name) {
    const resp = await fetch(`${API_BASE}/mkdir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, name })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Failed to create directory");
    return data.path;
  },

  async rename(oldPath, newName) {
    const resp = await fetch(`${API_BASE}/rename`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_path: oldPath, new_name: newName })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Failed to rename");
    return true;
  },

  async copy(srcPath, destName) {
    const resp = await fetch(`${API_BASE}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src_path: srcPath, dest_name: destName })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Failed to copy");
    return true;
  },

  async delete(path) {
    const resp = await fetch(`${API_BASE}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Failed to delete");
    return true;
  },

  async move(srcPath, destFolder) {
    const resp = await fetch(`${API_BASE}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src_path: srcPath, dest_folder: destFolder })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Failed to move");
    return true;
  },

  async listFolders() {
    const resp = await fetch(`${API_BASE}/folders`);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Failed to list folders");
    return data.folders;
  },

  async saveEmptyWorkflow(path, uuid, fileName = 'workflow.json') {
    const tmpPath = path.replaceAll('\/', '%2F');
    const encodedFileName = fileName.replaceAll('\/', '%2F');
    const resp = await fetch(`/api/userdata/workflows%2F${tmpPath}%2F${encodedFileName}?overwrite=false&full_info=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "id": uuid,
        "revision": 0,
        "last_node_id": 9,
        "last_link_id": 9,
        "nodes": [],
        "links": [],
        "groups": [],
        "config": {},
        "extra": {
          "ds": {
            "scale": 0.5,
            "offset": [
              0,
              0
            ]
          },
          "workflowRendererVersion": "LG",
          "ue_links": []
        },
        "version": 0.4
      })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Failed to save empty workflow");
    return true;
  }
};
