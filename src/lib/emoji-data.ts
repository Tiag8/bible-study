/**
 * Emoji picker data com suporte a busca por nome e keywords
 * Baseado em pesquisa arquitetural da Aria
 */

export interface EmojiData {
  emoji: string;
  shortname: string;
  keywords: string[];
}

/**
 * Database de emojis mais comuns (~100 emojis mais usados)
 * Organizado por categorias para referência futura
 */
export const EMOJIS: EmojiData[] = [
  // Smileys & Faces (😀-😜)
  { emoji: '😀', shortname: 'grinning', keywords: ['smile', 'happy', 'face'] },
  { emoji: '😁', shortname: 'grinning_face_with_smiling_eyes', keywords: ['happy', 'smile'] },
  { emoji: '😂', shortname: 'joy', keywords: ['laugh', 'happy', 'tear', 'lol'] },
  { emoji: '😃', shortname: 'smiley', keywords: ['happy', 'smile', 'face'] },
  { emoji: '😄', shortname: 'smile', keywords: ['happy', 'joy', 'smile'] },
  { emoji: '😅', shortname: 'sweat_smile', keywords: ['shy', 'happy', 'relief'] },
  { emoji: '😆', shortname: 'laughing', keywords: ['laugh', 'funny', 'happy'] },
  { emoji: '😇', shortname: 'innocent', keywords: ['halo', 'angel', 'good'] },
  { emoji: '😉', shortname: 'wink', keywords: ['wink', 'eye', 'face'] },
  { emoji: '😊', shortname: 'blissful', keywords: ['happy', 'smile', 'face'] },
  { emoji: '😌', shortname: 'relieved', keywords: ['calm', 'peaceful', 'happy'] },
  { emoji: '😍', shortname: 'heart_eyes', keywords: ['love', 'happy', 'eyes'] },
  { emoji: '😘', shortname: 'kissing_heart', keywords: ['kiss', 'love', 'heart'] },
  { emoji: '😗', shortname: 'kissing', keywords: ['kiss', 'face', 'love'] },
  { emoji: '😚', shortname: 'kissing_closed_eyes', keywords: ['kiss', 'love', 'closed'] },
  { emoji: '😙', shortname: 'kissing_smiling_eyes', keywords: ['kiss', 'love', 'smile'] },
  { emoji: '🥰', shortname: 'smiling_face_with_hearts', keywords: ['love', 'heart', 'smile'] },
  { emoji: '😋', shortname: 'face_savoring_food', keywords: ['food', 'yum', 'taste'] },
  { emoji: '😛', shortname: 'stuck_out_tongue', keywords: ['silly', 'playful', 'tongue'] },
  { emoji: '😜', shortname: 'stuck_out_tongue_winking_eye', keywords: ['silly', 'wink', 'playful'] },
  { emoji: '🤪', shortname: 'zany_face', keywords: ['silly', 'crazy', 'playful'] },
  { emoji: '😌', shortname: 'pensive', keywords: ['sad', 'thoughtful', 'pensive'] },
  { emoji: '😔', shortname: 'disappointed', keywords: ['sad', 'unhappy', 'disappoint'] },
  { emoji: '😑', shortname: 'expressionless', keywords: ['unexpressive', 'serious', 'neutral'] },
  { emoji: '😐', shortname: 'neutral_face', keywords: ['meh', 'neutral', 'expressionless'] },
  { emoji: '😶', shortname: 'no_mouth', keywords: ['silent', 'quiet', 'shh'] },
  { emoji: '😏', shortname: 'smirk', keywords: ['smug', 'face', 'smirk'] },
  { emoji: '😒', shortname: 'unamused', keywords: ['unamused', 'unimpressed', 'angry'] },
  { emoji: '😞', shortname: 'disappointed_relieved', keywords: ['sad', 'unhappy', 'upset'] },
  { emoji: '😔', shortname: 'pensive', keywords: ['pensive', 'thoughtful', 'worried'] },
  { emoji: '😲', shortname: 'astonished', keywords: ['surprised', 'shocked', 'wonder'] },
  { emoji: '☹️', shortname: 'frowning', keywords: ['sad', 'angry', 'unhappy'] },
  { emoji: '🙁', shortname: 'slightly_frowning_face', keywords: ['sad', 'unhappy', 'disapprove'] },
  { emoji: '😮', shortname: 'open_mouth', keywords: ['surprise', 'shocked', 'amazed'] },
  { emoji: '😯', shortname: 'hushed', keywords: ['surprised', 'shocked', 'amazed'] },
  { emoji: '😳', shortname: 'flushed', keywords: ['embarrassed', 'shy', 'blush'] },
  { emoji: '😳', shortname: 'flushed', keywords: ['embarrassed', 'shy', 'blush'] },
  { emoji: '🥺', shortname: 'pleading_face', keywords: ['sad', 'tears', 'eyes'] },
  { emoji: '😦', shortname: 'frowning_open_mouth', keywords: ['sad', 'surprised', 'upset'] },
  { emoji: '😧', shortname: 'anguished', keywords: ['worried', 'distressed', 'anguished'] },
  { emoji: '😨', shortname: 'fearful', keywords: ['scared', 'frightened', 'fear'] },
  { emoji: '😰', shortname: 'weary', keywords: ['worried', 'stressed', 'anxious'] },
  { emoji: '😥', shortname: 'disappointed_relieved', keywords: ['sad', 'discouraged', 'disappointed'] },
  { emoji: '😢', shortname: 'crying_face', keywords: ['sad', 'tears', 'cry'] },
  { emoji: '😭', shortname: 'persevere', keywords: ['sad', 'cry', 'tears'] },
  { emoji: '😱', shortname: 'scream', keywords: ['scared', 'shocked', 'horror'] },
  { emoji: '😖', shortname: 'confounded', keywords: ['confused', 'upset', 'worried'] },
  { emoji: '😣', shortname: 'persevere', keywords: ['struggle', 'effort', 'trying'] },
  { emoji: '😞', shortname: 'disappointed_relieved', keywords: ['sad', 'unhappy', 'discouraged'] },
  { emoji: '😓', shortname: 'sweat', keywords: ['sad', 'tired', 'stressed'] },
  { emoji: '😩', shortname: 'weary', keywords: ['tired', 'sleepy', 'exhausted'] },
  { emoji: '😫', shortname: 'tired_face', keywords: ['tired', 'exhausted', 'sleepy'] },
  { emoji: '🥱', shortname: 'yawning_face', keywords: ['yawn', 'sleepy', 'tired'] },
  { emoji: '😤', shortname: 'triumph', keywords: ['angry', 'annoyed', 'frustrated'] },
  { emoji: '😡', shortname: 'rage', keywords: ['angry', 'mad', 'furious'] },
  { emoji: '😠', shortname: 'angry', keywords: ['angry', 'mad', 'furious'] },
  { emoji: '🤬', shortname: 'cursing_face', keywords: ['angry', 'swear', 'curse'] },
  { emoji: '😈', shortname: 'smiling_imp', keywords: ['devil', 'evil', 'grin'] },
  { emoji: '👿', shortname: 'imp', keywords: ['devil', 'evil', 'angry'] },
  { emoji: '💀', shortname: 'skull', keywords: ['death', 'dying', 'dead'] },
  { emoji: '💩', shortname: 'shit', keywords: ['poop', 'funny', 'gross'] },
  { emoji: '🤡', shortname: 'clown_face', keywords: ['clown', 'funny', 'fool'] },
  { emoji: '👹', shortname: 'japanese_ogre', keywords: ['monster', 'ogre', 'demon'] },
  { emoji: '👺', shortname: 'japanese_goblin', keywords: ['monster', 'goblin', 'demon'] },
  { emoji: '👻', shortname: 'ghost', keywords: ['ghost', 'spooky', 'scary'] },
  { emoji: '👽', shortname: 'alien', keywords: ['alien', 'space', 'ufo'] },
  { emoji: '👾', shortname: 'space_invader', keywords: ['game', 'space', 'invader'] },
  { emoji: '🤖', shortname: 'robot', keywords: ['robot', 'ai', 'machine'] },

  // Hand Gestures
  { emoji: '👋', shortname: 'waving_hand', keywords: ['hand', 'wave', 'hello', 'goodbye'] },
  { emoji: '🤚', shortname: 'raised_back_of_hand', keywords: ['hand', 'palm', 'wave'] },
  { emoji: '🖐️', shortname: 'hand', keywords: ['hand', 'palm', 'five'] },
  { emoji: '✋', shortname: 'raised_hand', keywords: ['hand', 'palm', 'stop'] },
  { emoji: '🖖', shortname: 'vulcan_salute', keywords: ['live', 'long', 'prosper'] },
  { emoji: '👌', shortname: 'ok_hand', keywords: ['ok', 'good', 'perfect'] },
  { emoji: '🤌', shortname: 'pinched_fingers', keywords: ['small', 'tiny', 'itsy'] },
  { emoji: '🤏', shortname: 'pinching_hand', keywords: ['small', 'tiny', 'little'] },
  { emoji: '✌️', shortname: 'victory', keywords: ['peace', 'victory', 'v'] },
  { emoji: '🤞', shortname: 'crossed_fingers', keywords: ['hope', 'luck', 'fingers'] },
  { emoji: '🫰', shortname: 'hand_with_index_finger_and_thumb_crossed', keywords: ['fingers', 'ok', 'small'] },
  { emoji: '🤟', shortname: 'love_you_gesture', keywords: ['love', 'rock', 'hand'] },
  { emoji: '🤘', shortname: 'sign_of_the_horns', keywords: ['rock', 'metal', 'horns'] },
  { emoji: '🤙', shortname: 'call_me_hand', keywords: ['call', 'telephone', 'hand'] },
  { emoji: '👍', shortname: 'thumbsup', keywords: ['good', 'ok', 'yes', 'positive'] },
  { emoji: '👎', shortname: 'thumbsdown', keywords: ['bad', 'no', 'negative'] },
  { emoji: '✊', shortname: 'fist', keywords: ['punch', 'fist', 'hand'] },
  { emoji: '👊', shortname: 'fist_oncoming', keywords: ['punch', 'fist', 'power'] },
  { emoji: '🤛', shortname: 'fist_oncoming', keywords: ['fist', 'punch', 'left'] },
  { emoji: '🤜', shortname: 'fist_oncoming', keywords: ['fist', 'punch', 'right'] },
  { emoji: '💪', shortname: 'muscle', keywords: ['strong', 'power', 'biceps'] },
  { emoji: '🦵', shortname: 'leg', keywords: ['leg', 'foot', 'kick'] },
  { emoji: '🦶', shortname: 'foot', keywords: ['foot', 'sole', 'kick'] },
  { emoji: '👂', shortname: 'ear', keywords: ['ear', 'listen', 'hear'] },
  { emoji: '👃', shortname: 'nose', keywords: ['nose', 'smell', 'sniff'] },
  { emoji: '🧠', shortname: 'brain', keywords: ['brain', 'smart', 'mind'] },
  { emoji: '🦷', shortname: 'tooth', keywords: ['tooth', 'teeth', 'dental'] },
  { emoji: '🦴', shortname: 'bone', keywords: ['bone', 'skeleton', 'anatomy'] },

  // Hearts & Objects
  { emoji: '❤️', shortname: 'heart', keywords: ['love', 'red', 'heart'] },
  { emoji: '🧡', shortname: 'orange_heart', keywords: ['love', 'orange', 'heart'] },
  { emoji: '💛', shortname: 'yellow_heart', keywords: ['love', 'yellow', 'heart'] },
  { emoji: '💚', shortname: 'green_heart', keywords: ['love', 'green', 'heart'] },
  { emoji: '💙', shortname: 'blue_heart', keywords: ['love', 'blue', 'heart'] },
  { emoji: '💜', shortname: 'purple_heart', keywords: ['love', 'purple', 'heart'] },
  { emoji: '🖤', shortname: 'black_heart', keywords: ['love', 'black', 'heart'] },
  { emoji: '🤍', shortname: 'white_heart', keywords: ['love', 'white', 'heart'] },
  { emoji: '🤎', shortname: 'brown_heart', keywords: ['love', 'brown', 'heart'] },
  { emoji: '💔', shortname: 'broken_heart', keywords: ['sad', 'love', 'break'] },
  { emoji: '💕', shortname: 'two_hearts', keywords: ['love', 'heart', 'multiple'] },
  { emoji: '💞', shortname: 'revolving_hearts', keywords: ['love', 'heart', 'rotate'] },
  { emoji: '💓', shortname: 'beating_heart', keywords: ['love', 'heart', 'beat'] },
  { emoji: '💗', shortname: 'growing_heart', keywords: ['love', 'heart', 'grow'] },
  { emoji: '💖', shortname: 'sparkling_heart', keywords: ['love', 'heart', 'sparkle'] },
  { emoji: '💘', shortname: 'cupid', keywords: ['love', 'arrow', 'cupid'] },
  { emoji: '💝', shortname: 'gift_heart', keywords: ['love', 'gift', 'present'] },
  { emoji: '💟', shortname: 'heart_decoration', keywords: ['love', 'heart', 'decoration'] },

  // Symbols
  { emoji: '✨', shortname: 'sparkles', keywords: ['shine', 'stars', 'magic'] },
  { emoji: '⭐', shortname: 'star2', keywords: ['star', 'shine', 'favorite'] },
  { emoji: '🌟', shortname: 'star', keywords: ['star', 'shine', 'golden'] },
  { emoji: '⚡', shortname: 'zap', keywords: ['lightning', 'electric', 'fast'] },
  { emoji: '🔥', shortname: 'fire', keywords: ['hot', 'flame', 'fire', 'awesome'] },
  { emoji: '💧', shortname: 'droplet', keywords: ['water', 'drop', 'liquid'] },
  { emoji: '💯', shortname: 'hundred_points', keywords: ['perfect', '100', 'excellent'] },
  { emoji: '💥', shortname: 'boom', keywords: ['explosion', 'bang', 'pow'] },
  { emoji: '🎉', shortname: 'party_popper', keywords: ['party', 'celebrate', 'celebration'] },
  { emoji: '🎊', shortname: 'confetti_ball', keywords: ['party', 'celebrate', 'confetti'] },
  { emoji: '🎯', shortname: 'target', keywords: ['goal', 'focus', 'aim'] },
  { emoji: '🏆', shortname: 'trophy', keywords: ['winner', 'award', 'achievement'] },

  // Objects
  { emoji: '📚', shortname: 'books', keywords: ['read', 'study', 'education', 'learn'] },
  { emoji: '📖', shortname: 'book', keywords: ['read', 'open', 'education'] },
  { emoji: '📝', shortname: 'memo', keywords: ['write', 'note', 'document'] },
  { emoji: '✏️', shortname: 'pencil2', keywords: ['write', 'edit', 'edit'] },
  { emoji: '🖊️', shortname: 'pen', keywords: ['write', 'pen', 'edit'] },
  { emoji: '🖍️', shortname: 'crayon', keywords: ['draw', 'color', 'art'] },
  { emoji: '💡', shortname: 'bulb', keywords: ['idea', 'light', 'smart'] },
  { emoji: '🔍', shortname: 'mag', keywords: ['search', 'find', 'magnifying'] },
  { emoji: '🔎', shortname: 'mag_right', keywords: ['search', 'find', 'magnifying'] },
  { emoji: '📱', shortname: 'iphone', keywords: ['phone', 'mobile', 'device'] },
  { emoji: '💻', shortname: 'laptop', keywords: ['computer', 'laptop', 'work'] },
  { emoji: '🖥️', shortname: 'desktop_computer', keywords: ['desktop', 'computer', 'monitor'] },
  { emoji: '⌨️', shortname: 'keyboard', keywords: ['keyboard', 'type', 'input'] },
  { emoji: '🖱️', shortname: 'mouse_button', keywords: ['mouse', 'click', 'input'] },
  { emoji: '🖨️', shortname: 'printer', keywords: ['printer', 'print', 'document'] },
  { emoji: '🧮', shortname: 'abacus', keywords: ['count', 'math', 'calculate'] },
  { emoji: '🎮', shortname: 'video_game', keywords: ['game', 'video', 'play'] },
  { emoji: '🎯', shortname: 'dart', keywords: ['target', 'goal', 'aim'] },
  { emoji: '🎲', shortname: 'game_die', keywords: ['dice', 'game', 'random'] },
  { emoji: '🎪', shortname: 'circus_tent', keywords: ['circus', 'fun', 'entertainment'] },
  { emoji: '🎭', shortname: 'performing_arts', keywords: ['theater', 'drama', 'mask'] },
  { emoji: '🎨', shortname: 'art', keywords: ['art', 'paint', 'creative'] },
  { emoji: '🎬', shortname: 'movie_clapper', keywords: ['film', 'movie', 'cinema'] },
  { emoji: '🎤', shortname: 'microphone', keywords: ['sing', 'speak', 'microphone'] },
  { emoji: '🎧', shortname: 'headphones', keywords: ['music', 'listen', 'audio'] },
  { emoji: '🎼', shortname: 'musical_score', keywords: ['music', 'song', 'score'] },
  { emoji: '🎹', shortname: 'musical_keyboard', keywords: ['music', 'piano', 'keyboard'] },
  { emoji: '🎸', shortname: 'guitar', keywords: ['music', 'guitar', 'rock'] },
  { emoji: '🎺', shortname: 'trumpet', keywords: ['music', 'trumpet', 'brass'] },
  { emoji: '🎷', shortname: 'saxophone', keywords: ['music', 'jazz', 'saxophone'] },
  { emoji: '🥁', shortname: 'drum', keywords: ['music', 'drum', 'beat'] },
];

/**
 * Busca emojis por palavra-chave (shortname ou keywords)
 * @param query - Termo de busca (case-insensitive)
 * @returns Array de emojis que correspondem à busca, limitado a 10
 */
export function searchEmojis(query: string): EmojiData[] {
  if (!query) return EMOJIS.slice(0, 15); // Primeiros 15 se vazio

  const lowerQuery = query.toLowerCase().trim();

  // Busca em shortname primeiro (mais específico)
  const shortnamMatches = EMOJIS.filter((emoji) =>
    emoji.shortname.includes(lowerQuery)
  );

  // Depois em keywords (menos específico)
  const keywordMatches = EMOJIS.filter(
    (emoji) =>
      !emoji.shortname.includes(lowerQuery) &&
      emoji.keywords.some((keyword) => keyword.includes(lowerQuery))
  );

  // Retorna combinado, limitado a 12
  return [...shortnamMatches, ...keywordMatches].slice(0, 12);
}
