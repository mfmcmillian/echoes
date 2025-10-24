/**
 * Story Wave Dialogues
 * Conversations for each wave transition
 */

import { DialogueLine } from '../ui/DialogueScreen'

export const WAVE_DIALOGUES: Record<number, DialogueLine[]> = {
  1: [
    { speaker: 'ALARA', text: 'The gas station... this is where it all started.', duration: 3000 },
    { speaker: 'DR. YAN', text: 'Fragment Seven is stabilizing. The anomalies are manifesting.', duration: 3000 },
    { speaker: 'ALARA', text: "I can see them... they're everywhere.", duration: 2500 },
    { speaker: 'DR. YAN', text: 'Stay focused. Clear the area. Find survivors if you can.', duration: 3000 }
  ],
  2: [
    { speaker: 'ALARA', text: "The downtown area... it's deserted.", duration: 2500 },
    { speaker: 'DR. YAN', text: 'The evacuation point should be ahead. Push through.', duration: 3000 },
    { speaker: 'ALARA', text: 'These things are getting larger... stronger.', duration: 2500 },
    { speaker: 'DR. YAN', text: 'Your mind is generating more intense manifestations. Be careful.', duration: 3500 }
  ],
  3: [
    { speaker: 'ALARA', text: 'The shopping district... I remember this place.', duration: 2500 },
    { speaker: 'DR. YAN', text: 'Good. The memory is becoming clearer. Keep moving.', duration: 3000 },
    { speaker: 'ALARA', text: 'How many more of these... anomalies?', duration: 2500 },
    { speaker: 'DR. YAN', text: 'Unknown. Your subconscious is creating them as defense mechanisms.', duration: 3500 }
  ],
  4: [
    { speaker: 'ALARA', text: "The industrial zone... this doesn't feel right.", duration: 2500 },
    { speaker: 'DR. YAN', text: "You're getting close to the core memory. The trauma is resisting.", duration: 3500 },
    { speaker: 'ALARA', text: "They're... everywhere. I can barely hold them off.", duration: 2500 },
    { speaker: 'DR. YAN', text: "Stay strong. You're almost there. Don't give up now.", duration: 3000 }
  ],
  5: [
    { speaker: 'ALARA', text: 'The evacuation point... this is it.', duration: 2500 },
    { speaker: 'DR. YAN', text: 'This is the epicenter. The source of your trauma.', duration: 3000 },
    { speaker: 'ALARA', text: 'I can feel it... the memory is right here.', duration: 2500 },
    { speaker: 'DR. YAN', text: 'Clear the area. Break through. This is your last push.', duration: 3500 },
    { speaker: 'ALARA', text: "I'm ready. Let's end this.", duration: 2500 }
  ]
}
