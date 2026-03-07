import { api } from './api.js';
import { triggerWorkflowRefresh } from './trigger.js';
import { simpleGenerateUUID } from './utils.js';
import { getText } from './i18n.js';

export async function handleAction(actionType, nodeData, modal) {
  if (nodeData == undefined) {
    try {
      if (actionType === 'new_folder') {
        const newName = await modal.prompt(getText('new_folder_name'));
        if (newName) {
          await api.mkdir(".", newName);
          await api.saveEmptyWorkflow(`./${newName}`, simpleGenerateUUID());
          refreshTree();
        }
      }
    } catch (e) {
      alert(getText('error', e.message));
    }

    return true;
  }

  try {
    const { path, name, type } = nodeData;

    if (actionType === 'new_folder') {
      const newName = await modal.prompt(getText('new_folder_name'));
      if (newName) {
        await api.mkdir(path, newName);
        await api.saveEmptyWorkflow(`${path}/${newName}`, simpleGenerateUUID());
        refreshTree();
      }
    } else if (actionType === 'rename') {
      const newName = await modal.prompt(getText('rename_to'), name);
      if (newName && newName !== name) {
        await api.rename(path, newName);
        refreshTree();
      }
    } else if (actionType === 'copy') {
      const defaultName = type === 'file' ? name.replace(/\.json$/, '_copy.json') : name + '_copy';
      const newName = await modal.prompt(getText('copy_as'), defaultName);
      if (newName) {
        await api.copy(path, newName);
        refreshTree();
      }
    } else if (actionType === 'delete') {
      const confirmed = await modal.confirm(getText('delete_confirm_tip', path));
      if (confirmed) {
        await api.delete(path);
        refreshTree();
      }
    }
  } catch (e) {
    alert(getText('error', e.message));
  }
  return true;
}

function refreshTree() {
  triggerWorkflowRefresh()
  console.log("[Workflow Folders] Data updated. Please refresh the sidebar manually if needed.");
}


