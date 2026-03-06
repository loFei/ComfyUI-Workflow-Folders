# -*- coding: UTF-8 -*-

import os


def get_workflow_root():
    import folder_paths

    user_dir = folder_paths.get_user_directory()
    return os.path.join(user_dir, "default", "workflows")


WORKFLOW_ROOT = get_workflow_root()


def validate_path(relative_path):
    if not relative_path:
        return True

    if ".." in relative_path:
        return False

    clean_path = relative_path.replace("/", os.sep).replace("\\", os.sep)
    abs_target = os.path.abspath(os.path.join(WORKFLOW_ROOT, clean_path))
    abs_root = os.path.abspath(WORKFLOW_ROOT)

    return abs_target.startswith(abs_root + os.sep) or abs_target == abs_root


def is_safe_filename(name):
    if not name or not name.strip():
        return False
    invalid_chars = ["/", "\\", ":", "*", "?", '"', "<", ">", "|"]
    return not any(c in name for c in invalid_chars)


def normalize_path(path_str):
    if not path_str:
        return ""
    return path_str.replace("/", os.sep).replace("\\", os.sep)


def get_relative_path(full_path):
    try:
        rel = os.path.relpath(full_path, WORKFLOW_ROOT)
        return rel.replace(os.sep, "/")
    except ValueError:
        return ""
