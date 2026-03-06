const translations = {
  zh: {
    new_folder: '新建文件夹',
    rename: '重命名',
    copy: '复制',
    delete: '删除',
    cancel: '取消',
    ok: '确认',
    confirm: '确认',
    new_folder_name: '新建文件夹名',
    rename_to: '重命名：',
    copy_as: '拷贝为：',
    delete_confirm_tip: '操作无法撤回，确认删除 "%s"？',
    error: '错误：%s',
    name_cannot_be_empty: '文件夹名不能为空',
  },
  en: {
    new_folder: 'New Folder',
    rename: 'Rename',
    copy: 'Duplicate',
    delete: 'Delete',
    cancel: 'Cancel',
    ok: 'OK',
    confirm: 'Confirm',
    new_folder_name: 'New Folder Name',
    rename_to: 'Rename to:',
    copy_as: 'Duplicate as:',
    delete_confirm_tip: 'Delete "%s"? This cannot be undone.',
    error: 'Error:%s',
    name_cannot_be_empty: 'Name cannot be empty',
  },
  // ja: { new_folder: '📁 新しいフォルダー', ... },
  // fr: { new_folder: '📁 Nouveau dossier', ... }
};

export function getText(key, ...args) {
  // const rawLang = navigator.language || 'en';
  const rawLang = 'en';
  const langCode = rawLang.split('-')[0];

  let text = translations[langCode]?.[key]
    || translations['en']?.[key]
    || key;

  if (args.length > 0) {
    let argIndex = 0;
    return text.replace(/%s/g, () => {
      if (argIndex >= args.length) return '%s';
      return String(args[argIndex++]);
    });
  }

  return text;
}

