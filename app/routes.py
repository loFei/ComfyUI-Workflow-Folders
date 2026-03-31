# -*- coding: UTF-8 -*-

import server
from aiohttp import web
from . import logic
from .security import WORKFLOW_ROOT

async def mkdir_handler(request):
    """POST /wf/workflow-folders/mkdir"""
    try:
        data = await request.json()
        path = data.get("path", "")
        name = data.get("name", "")

        new_path = logic.create_directory(path, name)
        return web.json_response({"success": True, "path": new_path})
    except ValueError as e:
        return web.json_response({"error": str(e)}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def rename_handler(request):
    """POST /wf/workflow-folders/rename"""
    try:
        data = await request.json()
        logic.rename_item(data.get("old_path"), data.get("new_name"))
        return web.json_response({"success": True})
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)}, status=404)
    except ValueError as e:
        return web.json_response({"error": str(e)}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def copy_handler(request):
    """POST /wf/workflow-folders/copy"""
    try:
        data = await request.json()
        logic.copy_item(data.get("src_path"), data.get("dest_name"))
        return web.json_response({"success": True})
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)}, status=404)
    except ValueError as e:
        return web.json_response({"error": str(e)}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def delete_handler(request):
    """POST /wf/workflow-folders/delete"""
    try:
        data = await request.json()
        logic.delete_item(data.get("path"))
        return web.json_response({"success": True})
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)}, status=404)
    except PermissionError as e:
        return web.json_response({"error": str(e)}, status=403)
    except ValueError as e:
        return web.json_response({"error": str(e)}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

async def move_handler(request):
    """POST /wf/workflow-folders/move"""
    try:
        data = await request.json()
        logic.move_item(data.get("src_path"), data.get("dest_folder", ""))
        return web.json_response({"success": True})
    except FileNotFoundError as e:
        return web.json_response({"error": str(e)}, status=404)
    except ValueError as e:
        return web.json_response({"error": str(e)}, status=400)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def list_folders_handler(request):
    """GET /wf/workflow-folders/folders"""
    try:
        folders = logic.list_folders()
        return web.json_response({"success": True, "folders": folders})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


def register_routes():
    prompt_server = server.PromptServer.instance
    app = prompt_server.app

    app.router.add_post("/wf/workflow-folders/mkdir", mkdir_handler)
    app.router.add_post("/wf/workflow-folders/rename", rename_handler)
    app.router.add_post("/wf/workflow-folders/copy", copy_handler)
    app.router.add_post("/wf/workflow-folders/delete", delete_handler)
    app.router.add_post("/wf/workflow-folders/move", move_handler)
    app.router.add_get("/wf/workflow-folders/folders", list_folders_handler)

    print("[Workflow Folders] Routes registered.")
