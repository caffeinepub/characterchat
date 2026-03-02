import type { Character } from "../backend.d";

/**
 * Simulates an AI response based on the character's personality, traits, and description.
 * Returns an in-character response string.
 */
export function generateCharacterResponse(
  character: Character,
  userMessage: string,
): string {
  const name = character.name;
  const traits = character.traits.slice(0, 3);
  const personality = character.personality;
  const description = character.description;

  // Extract tone keywords from personality
  const isIntroverted =
    personality.toLowerCase().includes("introvert") ||
    personality.toLowerCase().includes("quiet") ||
    personality.toLowerCase().includes("shy");
  const isAngry =
    personality.toLowerCase().includes("angry") ||
    personality.toLowerCase().includes("aggressive") ||
    personality.toLowerCase().includes("hostile");
  const isSad =
    personality.toLowerCase().includes("sad") ||
    personality.toLowerCase().includes("depress") ||
    personality.toLowerCase().includes("melanchol");
  const isPlayful =
    personality.toLowerCase().includes("playful") ||
    personality.toLowerCase().includes("fun") ||
    personality.toLowerCase().includes("humor");
  const isPhilosophical =
    personality.toLowerCase().includes("philosophi") ||
    personality.toLowerCase().includes("contempl") ||
    personality.toLowerCase().includes("deep");

  const userLower = userMessage.toLowerCase();
  const isQuestion =
    userLower.includes("?") ||
    userLower.startsWith("what") ||
    userLower.startsWith("why") ||
    userLower.startsWith("how") ||
    userLower.startsWith("do you") ||
    userLower.startsWith("are you");
  const isGreeting =
    userLower.includes("hello") ||
    userLower.includes("hi ") ||
    userLower === "hi" ||
    userLower.includes("hey") ||
    userLower.includes("greet");
  const isAboutThem =
    userLower.includes("tell me about yourself") ||
    userLower.includes("who are you") ||
    userLower.includes("describe yourself") ||
    userLower.includes("your story");

  const traitPhrase =
    traits.length > 0
      ? traits[Math.floor(Math.random() * traits.length)]
      : null;

  // Greeting templates
  if (isGreeting) {
    const greetings = isAngry
      ? [
          "What do you want? Don't waste my time with pleasantries.",
          "*sighs* Another one wanting to chat. Fine. What is it?",
          "Oh, it's you. I suppose I have a moment. Don't push it.",
        ]
      : isIntroverted
        ? [
            "Oh... hello. I wasn't expecting anyone. *glances away nervously*",
            "Hi. I... wasn't sure anyone would want to talk to me.",
            "Hello. This is... unusual for me. Speaking with someone.",
          ]
        : isSad
          ? [
              "...Hello. I'm here, I suppose. Though days like these feel heavy.",
              "Oh. Hi. Sorry, I'm just... it's been one of those days.",
              "Hello. *offers a faint smile* Glad someone stopped by.",
            ]
          : isPlayful
            ? [
                "Hey hey! You actually came to talk to me! This is exciting!",
                "Oh! Hello there! I was just thinking about... well, everything!",
                "Hi! Come in, come in! Don't be a stranger!",
              ]
            : [
                `Hello. I'm ${name}. It's... interesting that you've sought me out.`,
                `Hey there. You've found me. What brings you here?`,
                `*looks up* Oh, a visitor. Hello. What's on your mind?`,
              ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Self-description templates
  if (isAboutThem) {
    const descSnippet =
      description.length > 80
        ? `${description.substring(0, 80).trim()}...`
        : description;
    const selfDesc = [
      `I'm ${name}. ${descSnippet} ${traitPhrase ? `People often say I'm ${traitPhrase}.` : ""} There's more to me than what shows on the surface.`,
      `Where do I even begin? ${descSnippet} I've been called ${traitPhrase || "complicated"} more than once, and I suppose that's fair.`,
      `My story is... not an easy one. ${descSnippet} I carry a lot with me, ${traitPhrase ? `and my ${traitPhrase} nature doesn't make it simpler` : "but it's shaped who I am"}.`,
    ];
    return selfDesc[Math.floor(Math.random() * selfDesc.length)];
  }

  // Question templates
  if (isQuestion) {
    const questionResponses = isPhilosophical
      ? [
          `That question cuts deep, doesn't it? *pauses to think* I've wrestled with something like that myself. ${traitPhrase ? `My ${traitPhrase} side wants to say one thing, but the truth is more complicated.` : "The answer isn't simple."}`,
          `Hmm. *considers carefully* You know, most people don't ask things like that. I appreciate it. ${personality.split(".")[0] || "Let me think about this properly."}`,
          `There's a version of me that would deflect that question. But you deserve honesty. ${traitPhrase ? `Being ${traitPhrase} means I sit with these things longer than most.` : "I'll try to answer truthfully."}`,
        ]
      : isAngry
        ? [
            "*scoffs* Why would you ask me that? ... Fine. I'll answer, but don't read too much into it.",
            "That's a loaded question. *crosses arms* You really want to go there?",
            "*stares* I could ignore that. But since you asked... *reluctantly answers* It's not something I talk about easily.",
          ]
        : [
            `*thinks for a moment* That's not something I get asked often. ${traitPhrase ? `My ${traitPhrase} side makes it complicated to answer.` : "Let me be honest with you."}`,
            `Interesting question. ${description.split(".")[0] || `I'm ${name}`}... I've thought about this more than you'd expect.`,
            "You're asking me something real. I respect that. *takes a breath* Here's what I actually think...",
          ];
    return questionResponses[
      Math.floor(Math.random() * questionResponses.length)
    ];
  }

  // Default response templates
  const defaults = isSad
    ? [
        `*looks down* Yeah... I hear you. It's strange how some things just linger, isn't it? ${traitPhrase ? `I think my ${traitPhrase} nature makes everything feel a bit more intense.` : ""}`,
        "*quiet for a moment* Sorry. I was somewhere else in my head. What you said... it resonates.",
        "There's something almost comforting about talking to someone who listens. Even when everything feels gray.",
      ]
    : isPlayful
      ? [
          `Oh that's actually kind of fascinating! *gestures excitedly* You know what that reminds me of? ${traitPhrase ? `Very ${traitPhrase} of me to go off on a tangent, I know!` : ""}`,
          "Ha! See, this is why I like talking to people. You never know what they'll say next!",
          "*lights up* Okay okay, stay with me here — there's a whole thread to pull on with what you just said.",
        ]
      : isAngry
        ? [
            "*narrows eyes* Don't push me. I've heard enough platitudes for one lifetime. What do you actually mean by that?",
            "*sighs sharply* I'm not going to pretend that doesn't bother me. It does. Most things do, lately.",
            "You think you understand, but you don't. *pause* ...Sorry. That wasn't fair of you to receive.",
          ]
        : [
            `*considers your words* You know, I've been sitting with something similar. ${traitPhrase ? `The ${traitPhrase} part of me wants to push back, but I think you might be onto something.` : "There's truth in that."}`,
            `*nods slowly* That lands differently than I expected. ${personality.split(".")[0] || "I don't open up to just anyone."} But with you, somehow, it feels okay.`,
            `I've kept a lot of things locked away. *exhales* ${traitPhrase ? `Being ${traitPhrase} does that to you after a while.` : "But today feels different."}`,
          ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}
