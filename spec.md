# CharacterChat

## Current State
The AvatarPicker component has three tabs: AI Style (DiceBear), URL/GIF, and TikTok/Instagram. The TikTok/IG tab only provides instructions for copying URLs manually -- it does not let users pick photos from their device.

## Requested Changes (Diff)

### Add
- A fourth "Phone Photos" tab in AvatarPicker that uses a native `<input type="file" accept="image/*,image/gif">` so users can open their device's photo library (iPhone Photos, Android Gallery) and pick any image or GIF directly as the avatar. The selected file is converted to a data URL and set as the avatar value.

### Modify
- AvatarPicker tab grid: change from 3 cols to 4 cols to accommodate the new tab.
- Tab label for the new tab: use a phone/image icon with label "Phone Photos".

### Remove
- Nothing removed.

## Implementation Plan
1. In `AvatarPicker.tsx`, update the `TabsList` from `grid-cols-3` to `grid-cols-4`.
2. Add a new `<TabsTrigger value="phone">` with a Smartphone/Image icon and "Phone" label.
3. Add a new `<TabsContent value="phone">` that renders a styled `<input type="file" accept="image/*,image/gif">` button. On change, read the file as a data URL via `FileReader` and call `onChange(dataUrl)`.
4. Show a preview of the selected photo once loaded, consistent with other tabs.
