# -*- coding: UTF-8 -*-

import server
from aiohttp import web
import os

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./web"

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
PLUGIN_NAME = os.path.basename(CURRENT_DIR)


def setup():
    try:
        from .app import routes

        routes.register_routes()
        print("[Workflow Folders] Setup complete. Check browser console.")
    except Exception as e:
        print(f"[Workflow Folders] Error: {e}")
        import traceback

        traceback.print_exc()


setup()
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
