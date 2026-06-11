import { useMemo, useEffect, useState, useCallback } from 'react';
import { differenceInHours } from 'date-fns';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  MessageCircle, Lightbulb, HelpCircle, Calendar, Sparkles, 
  ThumbsUp, Clock, Code, TrendingUp, Target, Users, Briefcase,
  Rocket, HandshakeIcon, Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  detectIntent,
  extractTopics,
  detectConversationStage,
  calculateComplementarity,
  hasMatchingSkill,
  type ConversationIntent,
  type ConversationStage,
  type ConversationTopic
} from '@/lib/conversationAnalysis';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface OtherUserProject {
  title: string;
  status: string; // IDEA, MVP, SCALE
}

interface OtherUser {
  username: string;
  archetype?: string;
  bio?: string;
  main_skills?: string[];
  projects?: OtherUserProject[];
}

interface CurrentUser {
  archetype?: string;
  main_skills?: string[];
}

export interface SmartReply {
  id: string;
  text: string;
  icon: LucideIcon;
  category: 'greeting' | 'follow_up' | 'question' | 'action' | 'stale' | 
            'skill_exchange' | 'project_interest' | 'challenge_share' | 
            'action_oriented' | 'compliment' | 'resource_share';
  priority?: number; // Higher = more relevant
}

interface UseSmartRepliesOptions {
  messages: Message[];
  currentUserId: string;
  currentUser?: CurrentUser;
  otherUser?: OtherUser;
  isTyping?: boolean;
  conversationId?: string;
}

const USED_SUGGESTIONS_KEY = 'smart_replies_used';

/**
 * Get used suggestions from localStorage for a conversation
 */
function getUsedSuggestions(conversationId?: string): string[] {
  if (!conversationId) return [];
  try {
    const stored = localStorage.getItem(`${USED_SUGGESTIONS_KEY}_${conversationId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save used suggestion to localStorage
 */
function saveUsedSuggestion(conversationId: string | undefined, suggestionId: string) {
  if (!conversationId) return;
  try {
    const used = getUsedSuggestions(conversationId);
    if (!used.includes(suggestionId)) {
      used.push(suggestionId);
      // Keep only last 20 to prevent bloat
      const trimmed = used.slice(-20);
      localStorage.setItem(`${USED_SUGGESTIONS_KEY}_${conversationId}`, JSON.stringify(trimmed));
    }
  } catch {
    // Ignore storage errors
  }
}

export const useSmartReplies = ({
  messages,
  currentUserId,
  currentUser,
  otherUser,
  isTyping = false,
  conversationId,
}: UseSmartRepliesOptions) => {
  const { t } = useLanguage();
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  
  // Load used suggestions on mount
  useEffect(() => {
    setUsedSuggestions(getUsedSuggestions(conversationId));
  }, [conversationId]);

  // Function to mark a suggestion as used
  const markAsUsed = useCallback((suggestionId: string) => {
    saveUsedSuggestion(conversationId, suggestionId);
    setUsedSuggestions(prev => [...prev, suggestionId]);
  }, [conversationId]);

  const suggestions = useMemo((): SmartReply[] => {
    // Hide suggestions when typing
    if (isTyping) return [];

    // Detect conversation context
    const stage = detectConversationStage(messages, currentUserId);
    const intent = detectIntent(messages);
    const topics = extractTopics(messages);
    const complementarity = calculateComplementarity(
      currentUser?.archetype,
      otherUser?.archetype
    );
    
    const lastMessage = messages[messages.length - 1];
    const lastContent = lastMessage?.content || '';
    const isFromOther = lastMessage?.sender_id !== currentUserId;

    let allSuggestions: SmartReply[] = [];

    // ========================================
    // 1. FIRST CONTACT SUGGESTIONS
    // ========================================
    if (stage === 'first_contact' && messages.length === 0) {
      // Personalized greetings based on other user's profile
      if (otherUser?.projects?.[0]) {
        allSuggestions.push({
          id: 'ask_about_project',
          text: t('smartReplies.askAboutProject', `Me conta do ${otherUser.projects[0].title}!`),
          icon: Rocket,
          category: 'project_interest',
          priority: 10
        });
      }

      if (complementarity === 'high') {
        if (currentUser?.archetype === 'BUILDER') {
          allSuggestions.push({
            id: 'builder_intro',
            text: t('smartReplies.builderIntro', 'Oi! Sou dev e vi que você é de negócios 👋'),
            icon: Code,
            category: 'greeting',
            priority: 9
          });
        } else if (currentUser?.archetype === 'SELLER') {
          allSuggestions.push({
            id: 'seller_intro',
            text: t('smartReplies.sellerIntro', 'E aí! Sou da área de negócios 🤝'),
            icon: TrendingUp,
            category: 'greeting',
            priority: 9
          });
        }
      }

      // Generic greetings
      allSuggestions.push(
        { id: 'hi', text: t('smartReplies.hi', 'Oi! 👋'), icon: MessageCircle, category: 'greeting', priority: 5 },
        { id: 'sawYourProfile', text: t('smartReplies.sawYourProfile', 'Vi seu perfil...'), icon: Sparkles, category: 'greeting', priority: 4 }
      );
    }

    // ========================================
    // 2. STALE CONVERSATION RE-ENGAGEMENT
    // ========================================
    if (stage === 'stale') {
      allSuggestions.push(
        { id: 'anyNews', text: t('smartReplies.anyNews', 'E aí, novidades? 📬'), icon: MessageCircle, category: 'stale', priority: 10 },
        { id: 'howDidItGo', text: t('smartReplies.howDidItGo', 'Como foi?'), icon: HelpCircle, category: 'stale', priority: 8 },
        { id: 'letsMeetUp', text: t('smartReplies.letsMeetUp', 'Bora marcar uma call? 📅'), icon: Calendar, category: 'action_oriented', priority: 7 }
      );
      
      // Filter and return early for stale conversations
      return filterAndSort(allSuggestions, usedSuggestions);
    }

    // ========================================
    // 3. RESPONSE TO QUESTIONS
    // ========================================
    if (intent === 'question' && isFromOther) {
      allSuggestions.push(
        { id: 'yes', text: t('smartReplies.yes', 'Sim!'), icon: ThumbsUp, category: 'question', priority: 10 },
        { id: 'notYet', text: t('smartReplies.notYet', 'Ainda não'), icon: Clock, category: 'question', priority: 8 },
        { id: 'depends', text: t('smartReplies.depends', 'Depende...'), icon: HelpCircle, category: 'question', priority: 6 },
        { id: 'tellMeMore', text: t('smartReplies.tellMeMore', 'Conta mais!'), icon: Sparkles, category: 'follow_up', priority: 5 }
      );
    }

    // ========================================
    // 4. COMPLEMENTARITY-BASED SUGGESTIONS
    // ========================================
    if (complementarity === 'high' && stage !== 'first_contact') {
      if (currentUser?.archetype === 'BUILDER') {
        // Builder talking to Seller
        allSuggestions.push(
          { id: 'offer_tech_help', text: t('smartReplies.offerTechHelp', 'Posso ajudar no tech!'), icon: Code, category: 'skill_exchange', priority: 9 },
          { id: 'ask_validation', text: t('smartReplies.askValidation', 'Qual validação você já fez?'), icon: Target, category: 'question', priority: 7 },
          { id: 'ask_channels', text: t('smartReplies.askChannels', 'Que canais de aquisição você pensa?'), icon: TrendingUp, category: 'question', priority: 6 }
        );
      } else if (currentUser?.archetype === 'SELLER') {
        // Seller talking to Builder
        allSuggestions.push(
          { id: 'offer_business_help', text: t('smartReplies.offerBusinessHelp', 'Posso ajudar no growth!'), icon: TrendingUp, category: 'skill_exchange', priority: 9 },
          { id: 'ask_stack', text: t('smartReplies.askStack', 'Qual stack você usa?'), icon: Code, category: 'question', priority: 7 },
          { id: 'offer_leads', text: t('smartReplies.offerLeads', 'Tenho leads que podem testar!'), icon: Users, category: 'resource_share', priority: 6 }
        );
      }
    }

    // Same archetype collaboration
    if (complementarity === 'medium' && currentUser?.archetype === otherUser?.archetype) {
      allSuggestions.push(
        { id: 'ask_tools', text: t('smartReplies.askTools', 'Quais ferramentas você usa?'), icon: Zap, category: 'question', priority: 7 },
        { id: 'share_experience', text: t('smartReplies.shareExperience', 'Já tentei algo parecido!'), icon: Lightbulb, category: 'challenge_share', priority: 6 },
        { id: 'suggest_partnership', text: t('smartReplies.suggestPartnership', 'Podemos fazer uma parceria!'), icon: HandshakeIcon, category: 'action_oriented', priority: 5 }
      );
    }

    // ========================================
    // 5. PROJECT-BASED SUGGESTIONS
    // ========================================
    const otherProject = otherUser?.projects?.[0];
    if (otherProject && isFromOther) {
      if (otherProject.status === 'IDEA') {
        allSuggestions.push(
          { id: 'ask_validation_idea', text: t('smartReplies.askValidationIdea', 'Como você validou a ideia?'), icon: Target, category: 'project_interest', priority: 8 },
          { id: 'ask_challenge', text: t('smartReplies.askChallenge', 'Qual o maior desafio agora?'), icon: HelpCircle, category: 'question', priority: 7 }
        );
      } else if (otherProject.status === 'MVP') {
        allSuggestions.push(
          { id: 'ask_users', text: t('smartReplies.askUsers', 'Quantos usuários já tem?'), icon: Users, category: 'project_interest', priority: 8 },
          { id: 'ask_feedback', text: t('smartReplies.askFeedback', 'Como está o feedback?'), icon: MessageCircle, category: 'question', priority: 7 }
        );
      } else if (otherProject.status === 'SCALE') {
        allSuggestions.push(
          { id: 'ask_operation', text: t('smartReplies.askOperation', 'Como está a operação?'), icon: Briefcase, category: 'project_interest', priority: 8 },
          { id: 'ask_investment', text: t('smartReplies.askInvestment', 'Buscando investimento?'), icon: TrendingUp, category: 'question', priority: 7 }
        );
      }
    }

    // ========================================
    // 6. INTENT-BASED SUGGESTIONS
    // ========================================
    if (intent === 'seeking_help' && isFromOther) {
      allSuggestions.push(
        { id: 'been_there', text: t('smartReplies.beenThere', 'Já passei por isso!'), icon: Lightbulb, category: 'challenge_share', priority: 9 },
        { id: 'can_help_with', text: t('smartReplies.canHelpWith', 'Posso ajudar com isso!'), icon: ThumbsUp, category: 'action', priority: 8 }
      );
    }

    if (intent === 'exploring_project' && isFromOther) {
      allSuggestions.push(
        { id: 'looks_great', text: t('smartReplies.looksGreat', 'Parece ótimo!'), icon: Sparkles, category: 'compliment', priority: 7 },
        { id: 'whats_stage', text: t('smartReplies.whatsTheStage', 'Qual o estágio?'), icon: Target, category: 'question', priority: 6 }
      );
    }

    if (intent === 'scheduling') {
      allSuggestions.push(
        { id: 'available_week', text: t('smartReplies.availableThisWeek', 'Disponível essa semana!'), icon: Calendar, category: 'action_oriented', priority: 9 },
        { id: 'send_calendar', text: t('smartReplies.sendCalendar', 'Te mando meu Calendly!'), icon: Calendar, category: 'action_oriented', priority: 8 }
      );
    }

    // ========================================
    // 7. SKILL-BASED SUGGESTIONS
    // ========================================
    const matchingSkill = hasMatchingSkill(currentUser?.main_skills, otherUser?.main_skills);
    if (matchingSkill && stage === 'discovery') {
      allSuggestions.push({
        id: 'skill_match',
        text: t('smartReplies.skillMatch', `Também trabalho com ${matchingSkill}!`),
        icon: Zap,
        category: 'skill_exchange',
        priority: 8
      });
    }

    // ========================================
    // 8. TOPIC-BASED SUGGESTIONS
    // ========================================
    if (topics.includes('challenge') && isFromOther) {
      allSuggestions.push(
        { id: 'challenge_share', text: t('smartReplies.challengeShare', 'Passei por algo parecido...'), icon: Lightbulb, category: 'challenge_share', priority: 7 }
      );
    }

    if (topics.includes('collaboration') && isFromOther) {
      allSuggestions.push(
        { id: 'interested', text: t('smartReplies.interested', 'Tenho interesse!'), icon: Sparkles, category: 'action_oriented', priority: 8 },
        { id: 'schedule_call', text: t('smartReplies.scheduleCall', 'Bora agendar uma call?'), icon: Calendar, category: 'action_oriented', priority: 7 }
      );
    }

    // ========================================
    // 9. DEFAULT FALLBACK SUGGESTIONS
    // ========================================
    if (allSuggestions.length < 3 && isFromOther) {
      allSuggestions.push(
        { id: 'interesting', text: t('smartReplies.interesting', 'Interessante!'), icon: Sparkles, category: 'follow_up', priority: 3 },
        { id: 'tell_me_more', text: t('smartReplies.tellMeMore', 'Conta mais! 🤔'), icon: HelpCircle, category: 'follow_up', priority: 2 },
        { id: 'have_idea', text: t('smartReplies.haveAnIdea', 'Tenho uma ideia 💡'), icon: Lightbulb, category: 'action', priority: 1 }
      );
    }

    return filterAndSort(allSuggestions, usedSuggestions);
  }, [messages, currentUserId, currentUser, otherUser, isTyping, t, usedSuggestions]);

  return {
    suggestions,
    hasContext: suggestions.length > 0,
    markAsUsed
  };
};

/**
 * Filter out used suggestions and sort by priority
 */
function filterAndSort(suggestions: SmartReply[], usedSuggestions: string[]): SmartReply[] {
  // Remove duplicates by id
  const unique = suggestions.filter(
    (s, i, arr) => arr.findIndex(x => x.id === s.id) === i
  );
  
  // Filter out recently used suggestions
  const filtered = unique.filter(s => !usedSuggestions.includes(s.id));
  
  // Sort by priority (higher first)
  const sorted = filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  // Return max 4 suggestions
  return sorted.slice(0, 4);
}
