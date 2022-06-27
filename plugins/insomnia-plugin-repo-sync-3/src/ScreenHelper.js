const { dirname } = require('path');
class ScreenHelper {
  static async alertError(context, message) {
    return await context.app.alert('Error!', message);
  }

  static async askRepoPath(context, options = {}) {
    await context.app.alert(
      'Select repository',
      `Choose the repository to synchronize your workspace\nCurrent path: ${
        options.currentPath ?? 'none'
      }`
    );
    const path = await context.app.showSaveDialog({
      defaultPath: options.workspaceName,
    });

    return path ? dirname(path) : null;
  }
}

module.exports = ScreenHelper;
