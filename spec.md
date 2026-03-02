# CharacterChat

## Current State
- Age-gated 18+ character chat app
- Characters have name, description, personality, backstory, traits, content warnings (including sexual content, eating disorders), isMature flag, avatarUrl
- Chat page with simulated AI responses based on character personality
- Create/edit character form with plain text avatar URL input only
- Messages stored in backend per user/character pair
- Discover page and My Characters page

## Requested Changes (Diff)

### Add
- **Role-play mode**: Toggle in chat page to switch between normal chat and role-play mode. In role-play mode, the UI shows narrative-style formatting (action tags like *actions*) and an option to add a second bot character to the scene for multi-character role-play.
- **Multi-bot role-play**: In role-play mode, user can pick a second character from their existing characters list. Both characters take turns responding in the scene.
- **Voice chat**: Microphone button in chat input area. Uses Web Speech API (SpeechRecognition) to convert voice to text input. Uses SpeechSynthesis API to read character responses aloud. A speaker button per message lets user replay TTS. Voice can be toggled on/off.
- **Avatar picker with tabs**: Replace plain URL input in CreateCharacterPage with a multi-tab picker:
  - "AI Style" tab: Pick from DiceBear illustrated avatar styles (adventurer, pixel-art, lorelei, micah, notionists, fun-emoji, big-smile, croodles). Previews update based on character name as seed.
  - "Upload / URL" tab: Text field for direct image URL (supports .gif, .jpg, .png, .webp). Shows live preview.
  - "TikTok & Instagram" tab: Instructions explaining how to get a direct media URL from TikTok/Instagram profile pictures or posts. URL input with preview. Supports GIF URLs.

### Modify
- **ChatPage**: Add mode toggle button in header (chat icon vs. drama masks icon for role-play). Add mic button and speaker toggle button to the input area. In role-play mode show a character selector for second bot.
- **CreateCharacterPage**: Replace the single `avatarUrl` input with the new `AvatarPicker` component.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `AvatarPicker` component with three tabs (AI Style, Upload/URL, TikTok & Instagram). DiceBear avatars use `https://api.dicebear.com/9.x/{style}/svg?seed={name}`. Shows preview. Outputs a URL string.
2. Update `CreateCharacterPage` to use `AvatarPicker` in place of plain avatar URL input.
3. Add voice input support to `ChatPage`: mic button triggers SpeechRecognition, transcribed text fills the input. Add speaker icon toggle; when enabled, use SpeechSynthesis to speak assistant responses.
4. Add role-play mode to `ChatPage`: toggle button switches mode. In role-play mode, show second-character selector (dropdown from user's characters). When two characters are selected, alternate bot responses between them in narrative style (character name in bold action lines).
5. Update aiSimulator to support role-play narrative formatting (wrap action text in * *, prepend character name).
