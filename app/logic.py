# -*- coding: UTF-8 -*-

import os
import shutil
import json
from .security import (
    WORKFLOW_ROOT,
    validate_path,
    is_safe_filename,
    normalize_path,
    get_relative_path,
)


def scan_directory(current_path, relative_base=""):
    result = []
    try:
        entries = sorted(os.listdir(current_path))
    except (FileNotFoundError, PermissionError):
        return result

    for entry in entries:
        full_path = os.path.join(current_path, entry)

        if relative_base:
            rel_entry = os.path.join(relative_base, entry)
        else:
            rel_entry = entry

        rel_entry = get_relative_path(os.path.join(WORKFLOW_ROOT, rel_entry))

        if os.path.isdir(full_path):
            children = scan_directory(full_path, rel_entry)
            result.append(
                {
                    "name": entry,
                    "path": rel_entry,
                    "type": "folder",
                    "children": children,
                }
            )
        else:
            if entry.endswith(".json"):
                result.append({"name": entry, "path": rel_entry, "type": "file"})

    return result


def create_directory(parent_path, name):
    if not is_safe_filename(name):
        raise ValueError("Invalid directory name")
    if not validate_path(parent_path):
        raise ValueError("Invalid parent path")

    clean_parent = normalize_path(parent_path)
    target_dir = (
        os.path.join(WORKFLOW_ROOT, clean_parent, name)
        if clean_parent
        else os.path.join(WORKFLOW_ROOT, name)
    )

    final_rel = get_relative_path(target_dir)
    if not validate_path(final_rel):
        raise ValueError("Security check failed: Path escapes root")

    try:
        os.makedirs(target_dir, exist_ok=False)
        return final_rel
    except OSError as e:
        raise ValueError(f"Security check failed: {e}")


def rename_item(old_path, new_name):
    if not validate_path(old_path):
        raise ValueError("Invalid source path")
    if not is_safe_filename(new_name):
        raise ValueError("Invalid new name")

    old_full = os.path.join(WORKFLOW_ROOT, normalize_path(old_path))
    if not os.path.exists(old_full):
        raise FileNotFoundError("Source not found")

    parent_dir = os.path.dirname(old_full)
    new_full = os.path.join(parent_dir, new_name)

    new_rel = get_relative_path(new_full)
    if not validate_path(new_rel):
        raise ValueError("Invalid destination path")

    os.rename(old_full, new_full)
    return True


def copy_item(src_path, dest_name):
    if not validate_path(src_path):
        raise ValueError("Invalid source path")
    if not is_safe_filename(dest_name):
        raise ValueError("Invalid destination name")

    src_full = os.path.join(WORKFLOW_ROOT, normalize_path(src_path))
    if not os.path.exists(src_full):
        raise FileNotFoundError("Source not found")

    parent_dir = os.path.dirname(src_full)
    dest_full = os.path.join(parent_dir, dest_name)

    dest_rel = get_relative_path(dest_full)
    if not validate_path(dest_rel):
        raise ValueError("Invalid destination path")

    if os.path.isdir(src_full):
        shutil.copytree(src_full, dest_full)
    else:
        shutil.copy2(src_full, dest_full)
    return True


def delete_item(path):
    if not validate_path(path):
        raise ValueError("Invalid path")

    target = os.path.join(WORKFLOW_ROOT, normalize_path(path))

    if os.path.abspath(target) == os.path.abspath(WORKFLOW_ROOT):
        raise PermissionError("Cannot delete root directory")

    if not os.path.exists(target):
        raise FileNotFoundError("Target not found")

    if os.path.isdir(target):
        shutil.rmtree(target)
    else:
        os.remove(target)
    return True


def load_workflow_content(path):
    if not validate_path(path):
        raise ValueError("Invalid path")

    target = os.path.join(WORKFLOW_ROOT, normalize_path(path))

    if not os.path.isfile(target):
        raise FileNotFoundError("File not found")

    with open(target, "r", encoding="utf-8") as f:
        return json.load(f)
