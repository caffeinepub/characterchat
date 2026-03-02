# CharacterChat

## Current State
- Chat page has voice output (TTS) via browser SpeechSynthesis, toggled with a single Volume button
- When TTS is on, the browser's default voice is used — no voice selection UI exists
- Role-play mode lets you pick a second character, but bots do not send an opening RP message when mode is first activated

## Requested Changes (Diff)

### Add
- Voice picker panel: when TTS is enabled, show a dropdown/list of available browser SpeechSynthesis voices (name + language); the selected voice is stored in state and passed to each utterance
- RP starter: when role-play mode is activated and a second character is selected, automatically generate and inject an opening RP message from the second character (styled as a *action* opener) into the local messages list so the scene feels immediately alive

### Modify
- `speakText` to use the currently selected `SpeechSynthesisVoice` instead of browser default
- Voice toggle button area: after enabling TTS, show an inline voice selector (Select component) sourcing voices from `window.speechSynthesis.getVoices()`
- Role-play `setSecondCharacter` handler: after setting the character, trigger a short delay then push an auto-generated RP opener message to `localMessages`

### Remove
- Nothing removed

## Implementation Plan
1. In `ChatPage.tsx`, add state: `selectedVoice: SpeechSynthesisVoice | null` and `availableVoices: SpeechSynthesisVoice[]`
2. On mount (and on `voiceschanged` event), populate `availableVoices` from `window.speechSynthesis.getVoices()`
3. Add a voice selector Select component that appears when `ttsEnabled === true`, listing each voice by `voice.name (lang)`; update `selectedVoice` on change
4. Update `speakText` to set `utterance.voice = selectedVoice` when one is chosen
5. In `aiSimulator.ts`, add `generateRpStarter(character: Character): string` that returns a short in-character *action* + dialogue opener
6. In `ChatPage.tsx`, when `secondCharacter` is set in role-play mode, after a 600ms delay inject an `assistant` message from the second character using `generateRpStarter`
