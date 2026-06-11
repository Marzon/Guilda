/**
 * Conversation Analysis Module for Smart Replies 2.0
 * Provides intent detection, topic extraction, and archetype complementarity calculation
 */

import type { Archetype } from '@/types/archetype';

// Intent types based on conversation patterns
export type ConversationIntent = 
  | 'seeking_help'      // "preciso de...", "não sei como..."
  | 'offering_help'     // "posso ajudar", "tenho experiência"
  | 'exploring_project' // "estou trabalhando em...", "meu projeto..."
  | 'networking'        // "quero conhecer", "vi seu perfil"
  | 'scheduling'        // "podemos marcar", "call"
  | 'question'          // ends with ?
  | 'general_chat';     // fallback

// Conversation stage in the relationship
export type ConversationStage = 
  | 'first_contact'     // empty or 1-2 messages
  | 'discovery'         // 3-10 messages, getting to know
  | 'established'       // 10+ messages
  | 'stale';            // 24h+ since last message

// Topic categories detected in messages
export type ConversationTopic = 
  | 'project'
  | 'skills'
  | 'challenge'
  | 'collaboration'
  | 'investment'
  | 'growth'
  | 'tech'
  | 'general';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

// Keyword patterns for intent detection (multilingual)
const INTENT_PATTERNS: Record<ConversationIntent, string[]> = {
  seeking_help: [
    'preciso', 'need', 'necesito',
    'ajuda', 'help', 'ayuda',
    'não sei', "don't know", 'no sé',
    'dificuldade', 'difficulty', 'dificultad',
    'problema', 'problem', 'stuck',
    'como faço', 'how do i', 'cómo hago'
  ],
  offering_help: [
    'posso ajudar', 'can help', 'puedo ayudar',
    'tenho experiência', 'have experience', 'tengo experiencia',
    'já fiz', 'already did', 'ya hice',
    'conheço bem', 'know well', 'conozco bien',
    'minha especialidade', 'my specialty', 'mi especialidad'
  ],
  exploring_project: [
    'projeto', 'project', 'proyecto',
    'startup', 'app', 'plataforma', 'platform',
    'estou trabalhando', 'working on', 'estoy trabajando',
    'minha ideia', 'my idea', 'mi idea',
    'mvp', 'produto', 'product', 'negócio', 'business'
  ],
  networking: [
    'vi seu perfil', 'saw your profile', 'vi tu perfil',
    'quero conhecer', 'want to know', 'quiero conocer',
    'interessante', 'interesting', 'interesante',
    'experiência', 'experience', 'experiencia'
  ],
  scheduling: [
    'marcar', 'schedule', 'agendar',
    'call', 'chamada', 'llamada',
    'meet', 'reunião', 'reunion',
    'disponibilidade', 'availability', 'disponibilidad',
    'horário', 'time', 'horario'
  ],
  question: [], // detected by ? at the end
  general_chat: []
};

// Keyword patterns for topic detection
const TOPIC_PATTERNS: Record<ConversationTopic, string[]> = {
  project: ['projeto', 'project', 'startup', 'app', 'plataforma', 'mvp', 'produto', 'product'],
  skills: ['skill', 'habilidade', 'experiência', 'experience', 'sabe', 'know', 'especialidade'],
  challenge: ['desafio', 'challenge', 'problema', 'problem', 'dificuldade', 'difficulty'],
  collaboration: ['parceria', 'partnership', 'colaborar', 'collaborate', 'juntos', 'together'],
  investment: ['investimento', 'investment', 'capital', 'funding', 'rodada', 'round'],
  growth: ['crescer', 'grow', 'growth', 'usuários', 'users', 'marketing', 'vendas', 'sales'],
  tech: ['código', 'code', 'desenvolvimento', 'development', 'tech', 'stack', 'react', 'backend'],
  general: []
};

/**
 * Detect the primary intent from the last few messages
 */
export function detectIntent(messages: Message[]): ConversationIntent {
  if (messages.length === 0) return 'general_chat';
  
  // Analyze last 3 messages for context
  const recentMessages = messages.slice(-3);
  const lastMessage = messages[messages.length - 1];
  
  // Check if last message is a question
  if (lastMessage.content?.trim().endsWith('?')) {
    return 'question';
  }
  
  // Combine recent content for analysis
  const combinedContent = recentMessages
    .map(m => m.content || '')
    .join(' ')
    .toLowerCase();
  
  // Check each intent pattern
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as [ConversationIntent, string[]][]) {
    if (intent === 'question' || intent === 'general_chat') continue;
    
    const matchCount = patterns.filter(p => combinedContent.includes(p.toLowerCase())).length;
    if (matchCount >= 2) return intent;
    if (matchCount >= 1 && patterns.some(p => lastMessage.content?.toLowerCase().includes(p.toLowerCase()))) {
      return intent;
    }
  }
  
  return 'general_chat';
}

/**
 * Extract topics from conversation content
 */
export function extractTopics(messages: Message[]): ConversationTopic[] {
  if (messages.length === 0) return [];
  
  const recentMessages = messages.slice(-5);
  const combinedContent = recentMessages
    .map(m => m.content || '')
    .join(' ')
    .toLowerCase();
  
  const detectedTopics: ConversationTopic[] = [];
  
  for (const [topic, patterns] of Object.entries(TOPIC_PATTERNS) as [ConversationTopic, string[]][]) {
    if (topic === 'general') continue;
    
    const matchCount = patterns.filter(p => combinedContent.includes(p.toLowerCase())).length;
    if (matchCount >= 1) {
      detectedTopics.push(topic);
    }
  }
  
  return detectedTopics.length > 0 ? detectedTopics : ['general'];
}

/**
 * Determine the stage of the conversation
 */
export function detectConversationStage(
  messages: Message[],
  currentUserId: string
): ConversationStage {
  if (messages.length === 0) return 'first_contact';
  
  const lastMessage = messages[messages.length - 1];
  const hoursSinceLastMessage = (Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastMessage > 24) return 'stale';
  
  if (messages.length <= 2) return 'first_contact';
  if (messages.length <= 10) return 'discovery';
  return 'established';
}

/**
 * Calculate archetype complementarity score
 * Builder + Seller = high (best match)
 * Same archetype = medium (can collaborate)
 * With Investor = medium (specific dynamic)
 * With Starter = low (one-sided)
 */
export function calculateComplementarity(
  userArchetype?: string,
  otherArchetype?: string
): 'high' | 'medium' | 'low' {
  if (!userArchetype || !otherArchetype) return 'low';
  
  const u = userArchetype.toUpperCase() as Archetype;
  const o = otherArchetype.toUpperCase() as Archetype;
  
  // Perfect complementarity: Builder + Seller
  if ((u === 'BUILDER' && o === 'SELLER') || (u === 'SELLER' && o === 'BUILDER')) {
    return 'high';
  }
  
  // Same archetype - can collaborate on similar interests
  if (u === o) {
    return 'medium';
  }
  
  // Investor interactions
  if (u === 'INVESTOR' || o === 'INVESTOR') {
    return 'medium';
  }
  
  // Starter with any established archetype
  if (u === 'STARTER' || o === 'STARTER') {
    return 'low';
  }
  
  return 'medium';
}

/**
 * Check if a skill matches any in the other user's skill set
 */
export function hasMatchingSkill(
  userSkills: string[] | undefined,
  otherSkills: string[] | undefined
): string | null {
  if (!userSkills?.length || !otherSkills?.length) return null;
  
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  const normalizedOtherSkills = otherSkills.map(s => s.toLowerCase());
  
  // Find complementary skills (user can help with what other needs)
  for (const skill of normalizedOtherSkills) {
    if (normalizedUserSkills.includes(skill)) {
      return otherSkills.find(s => s.toLowerCase() === skill) || skill;
    }
  }
  
  return null;
}

/**
 * Check if message content indicates a specific project stage interest
 */
export function detectProjectStageInterest(content: string): 'IDEA' | 'MVP' | 'SCALE' | null {
  const lower = content.toLowerCase();
  
  if (lower.includes('ideia') || lower.includes('idea') || lower.includes('validação') || lower.includes('validation')) {
    return 'IDEA';
  }
  
  if (lower.includes('mvp') || lower.includes('protótipo') || lower.includes('prototype') || lower.includes('primeiros usuários')) {
    return 'MVP';
  }
  
  if (lower.includes('escalar') || lower.includes('scale') || lower.includes('crescimento') || lower.includes('growth') || lower.includes('investimento')) {
    return 'SCALE';
  }
  
  return null;
}
