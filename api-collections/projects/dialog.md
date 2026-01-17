# Dialog API

Electron native dialog operations for file/folder selection and messages.

## Channels

### `dialog:selectDirectory`

Open a native directory picker dialog.

**Parameters:** None

**Response:**
```typescript
ApiResponse<{
  canceled: boolean;   // True if user clicked Cancel
  filePath?: string;   // Selected directory path (if not canceled)
}>
```

**Example:**
```typescript
const response = await window.electronAPI.dialog.selectDirectory();

if (response.success && !response.data?.canceled) {
  const selectedPath = response.data?.filePath;
  console.log('Selected directory:', selectedPath);
} else {
  console.log('User canceled selection');
}
```

**Dialog Options:**
- Title: "Select Project Directory"
- Button: "Select"
- Allows creating new directories
- Opens focused on the main window

---

### `dialog:showMessage`

Show a native message box dialog.

**Parameters:**
```typescript
options: Electron.MessageBoxOptions
```

**MessageBoxOptions:**
```typescript
{
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];        // e.g., ['OK', 'Cancel']
  defaultId?: number;        // Index of default button
  cancelId?: number;         // Index of cancel button
  checkboxLabel?: string;    // Optional checkbox
  checkboxChecked?: boolean;
}
```

**Response:**
```typescript
ApiResponse<{
  response: number;         // Index of clicked button
  checkboxChecked: boolean; // Checkbox state (if shown)
}>
```

**Example - Confirmation Dialog:**
```typescript
const response = await window.electronAPI.dialog.showMessage({
  type: 'question',
  title: 'Delete Project',
  message: 'Are you sure you want to delete this project?',
  detail: 'This will remove the project from Aero Work but won\'t delete local files.',
  buttons: ['Delete', 'Cancel'],
  defaultId: 1,  // Focus on Cancel
  cancelId: 1
});

if (response.data?.response === 0) {
  // User clicked "Delete"
  await deleteProject(projectId);
}
```

**Example - Info Dialog:**
```typescript
await window.electronAPI.dialog.showMessage({
  type: 'info',
  title: 'Clone Complete',
  message: 'Repository cloned successfully',
  detail: 'The project has been added to your workspace.',
  buttons: ['OK']
});
```

**Example - With Checkbox:**
```typescript
const response = await window.electronAPI.dialog.showMessage({
  type: 'warning',
  title: 'Large Repository',
  message: 'This repository is very large (2GB+)',
  detail: 'Cloning may take several minutes.',
  buttons: ['Continue', 'Cancel'],
  checkboxLabel: 'Don\'t show this warning again',
  checkboxChecked: false
});

if (response.data?.checkboxChecked) {
  // User checked "Don't show again"
  saveSetting('skipLargeRepoWarning', true);
}
```

---

### `dialog:showError`

Show a native error dialog (blocking).

**Parameters:**
```typescript
title: string;    // Error dialog title
content: string;  // Error message content
```

**Response:**
```typescript
ApiResponse<void>
```

**Example:**
```typescript
await window.electronAPI.dialog.showError(
  'Clone Failed',
  'Unable to clone repository. Please check your network connection and try again.'
);
```

**Note:** This is a blocking dialog that waits for user acknowledgment. Use `showMessage` with `type: 'error'` for non-blocking error dialogs with custom buttons.

---

## Type Definitions

### DirectorySelectResult

```typescript
interface DirectorySelectResult {
  canceled: boolean;
  filePath?: string;
}
```

## Platform Differences

| Feature | macOS | Windows | Linux |
|---------|-------|---------|-------|
| Native file picker | Yes | Yes | Yes |
| Create directory button | Yes | Yes | Varies |
| Dialog style | Sheet | Modal | Modal |

## Best Practices

1. **Always check `canceled`** before using the result
2. **Use appropriate dialog types** for context (question, warning, error)
3. **Provide clear button labels** - avoid generic "Yes/No"
4. **Set `defaultId` and `cancelId`** for keyboard navigation
5. **Keep messages concise** - use `detail` for additional info
