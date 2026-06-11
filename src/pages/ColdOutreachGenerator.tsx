import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Send, Copy, Check, MessageSquare, Mail, Phone, Linkedin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolPageLayout } from "@/components/tools/ToolPageLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { useToolTracking } from "@/hooks/useToolTracking";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Channel = "linkedin" | "email" | "whatsapp" | "coldcall";
type MessageType = "first-contact" | "followup-1" | "followup-2" | "interest-response";
type NicheKey = "consulting" | "accounting" | "saas" | "freelance-tech" | "marketing" | "design" | "training" | "ecommerce" | "architecture" | "photography";

interface Template {
  subject?: string;
  body: string;
  tip: string;
}

interface FormData {
  prospectName: string;
  prospectRole: string;
  prospectCompany: string;
  senderName: string;
  niche: NicheKey;
  channel: Channel;
  messageType: MessageType;
  trigger: string;
  painPoint: string;
}

const CHANNEL_CONFIG: Record<Channel, { icon: typeof Send; label: string; maxChars: number; color: string }> = {
  linkedin: { icon: Linkedin, label: "LinkedIn", maxChars: 300, color: "bg-blue-100 text-blue-700" },
  email: { icon: Mail, label: "Email", maxChars: 2000, color: "bg-red-100 text-red-700" },
  whatsapp: { icon: MessageSquare, label: "WhatsApp", maxChars: 1000, color: "bg-green-100 text-green-700" },
  coldcall: { icon: Phone, label: "Cold Call", maxChars: 5000, color: "bg-purple-100 text-purple-700" },
};

const NICHE_LABELS: Record<NicheKey, { pt: string; en: string; es: string }> = {
  consulting: { pt: "Consultoria", en: "Consulting", es: "Consultoría" },
  accounting: { pt: "Contabilidade", en: "Accounting", es: "Contabilidad" },
  saas: { pt: "SaaS B2B", en: "SaaS B2B", es: "SaaS B2B" },
  "freelance-tech": { pt: "Freelancer Tech", en: "Tech Freelancer", es: "Freelancer Tech" },
  marketing: { pt: "Marketing Digital", en: "Digital Marketing", es: "Marketing Digital" },
  design: { pt: "Design", en: "Design", es: "Diseño" },
  training: { pt: "Treinamentos", en: "Training", es: "Capacitación" },
  ecommerce: { pt: "E-commerce", en: "E-commerce", es: "E-commerce" },
  architecture: { pt: "Arquitetura", en: "Architecture", es: "Arquitectura" },
  photography: { pt: "Fotografia", en: "Photography", es: "Fotografía" },
};

const MESSAGE_TYPE_LABELS: Record<MessageType, { pt: string; en: string; es: string }> = {
  "first-contact": { pt: "Primeira Abordagem", en: "First Contact", es: "Primer Contacto" },
  "followup-1": { pt: "Follow-up 1 (3-5 dias)", en: "Follow-up 1 (3-5 days)", es: "Seguimiento 1 (3-5 días)" },
  "followup-2": { pt: "Follow-up 2 (último)", en: "Follow-up 2 (final)", es: "Seguimiento 2 (final)" },
  "interest-response": { pt: "Resposta a Interesse", en: "Interest Response", es: "Respuesta a Interés" },
};

// Templates de mensagens
const getTemplate = (
  channel: Channel,
  messageType: MessageType,
  niche: NicheKey,
  data: FormData,
  lang: string
): Template => {
  const { prospectName, prospectRole, prospectCompany, senderName, trigger, painPoint } = data;

  const nicheValue = niche === "saas" ? "SaaS" : 
    lang === "pt" ? NICHE_LABELS[niche].pt : 
    lang === "es" ? NICHE_LABELS[niche].es : 
    NICHE_LABELS[niche].en;

  const triggerText = trigger || (lang === "pt" 
    ? `Vi que você lidera a área de ${prospectRole} na ${prospectCompany} — muito bacana o trabalho que estão fazendo.`
    : lang === "es"
    ? `Vi que lideras el área de ${prospectRole} en ${prospectCompany} — muy interesante el trabajo que están haciendo.`
    : `I saw that you lead the ${prospectRole} area at ${prospectCompany} — very interesting work you're doing.`);

  const painText = painPoint || (lang === "pt"
    ? "otimizar processos e aumentar resultados"
    : lang === "es"
    ? "optimizar procesos y aumentar resultados"
    : "optimize processes and increase results");

  // Templates por canal e tipo
  if (channel === "linkedin") {
    if (messageType === "first-contact") {
      return {
        body: lang === "pt"
          ? `Olá ${prospectName}!\n\n${triggerText}\n\nEstou ajudando empresas como a ${prospectCompany} a ${painText}.\n\nFaz sentido trocarmos uma ideia rápida?\n\nAbraço,\n${senderName}`
          : lang === "es"
          ? `¡Hola ${prospectName}!\n\n${triggerText}\n\nEstoy ayudando a empresas como ${prospectCompany} a ${painText}.\n\n¿Tiene sentido que charlemos rápidamente?\n\nSaludos,\n${senderName}`
          : `Hi ${prospectName}!\n\n${triggerText}\n\nI'm helping companies like ${prospectCompany} to ${painText}.\n\nDoes it make sense to chat?\n\nBest,\n${senderName}`,
        tip: lang === "pt"
          ? "LinkedIn funciona melhor com mensagens curtas e personalizadas. Mencione algo específico do perfil da pessoa."
          : lang === "es"
          ? "LinkedIn funciona mejor con mensajes cortos y personalizados. Menciona algo específico del perfil de la persona."
          : "LinkedIn works best with short, personalized messages. Mention something specific from their profile.",
      };
    }
    if (messageType === "followup-1") {
      return {
        body: lang === "pt"
          ? `Oi ${prospectName}, tudo bem?\n\nEntendo que a agenda deve estar corrida. Só queria reforçar que podemos conversar em 15 minutos sobre como ${painText}.\n\nSe preferir, posso mandar um resumo por aqui mesmo.\n\nAbraço,\n${senderName}`
          : lang === "es"
          ? `Hola ${prospectName}, ¿cómo estás?\n\nEntiendo que la agenda debe estar apretada. Solo quería reforzar que podemos conversar 15 minutos sobre cómo ${painText}.\n\nSi prefieres, puedo enviarte un resumen por aquí.\n\nSaludos,\n${senderName}`
          : `Hi ${prospectName}, how are you?\n\nI understand you must be busy. Just wanted to reinforce that we can chat for 15 minutes about how to ${painText}.\n\nIf you prefer, I can send a summary here.\n\nBest,\n${senderName}`,
        tip: lang === "pt"
          ? "No follow-up, seja breve e ofereça uma alternativa (resumo escrito). Não seja insistente."
          : lang === "es"
          ? "En el seguimiento, sé breve y ofrece una alternativa (resumen escrito). No seas insistente."
          : "In follow-ups, be brief and offer an alternative (written summary). Don't be pushy.",
      };
    }
    if (messageType === "followup-2") {
      return {
        body: lang === "pt"
          ? `${prospectName}, última tentativa!\n\nSei que timing é tudo. Se não for o momento, sem problemas — posso voltar em alguns meses.\n\nMas se fizer sentido agora, é só responder 👍\n\n${senderName}`
          : lang === "es"
          ? `${prospectName}, ¡último intento!\n\nSé que el timing lo es todo. Si no es el momento, sin problemas — puedo volver en unos meses.\n\nPero si tiene sentido ahora, solo responde 👍\n\n${senderName}`
          : `${prospectName}, last try!\n\nI know timing is everything. If it's not the right moment, no problem — I can reach out in a few months.\n\nBut if it makes sense now, just reply 👍\n\n${senderName}`,
        tip: lang === "pt"
          ? "O último follow-up deve ser leve e sem pressão. Deixe a porta aberta para o futuro."
          : lang === "es"
          ? "El último seguimiento debe ser ligero y sin presión. Deja la puerta abierta para el futuro."
          : "The last follow-up should be light and pressure-free. Leave the door open for the future.",
      };
    }
    return {
      body: lang === "pt"
        ? `Oba, ${prospectName}! 🎉\n\nMuito bom saber que faz sentido! Podemos marcar uma call de 20 min essa semana?\n\nMe fala 2-3 horários que funcionam pra você.\n\nAbraço,\n${senderName}`
        : lang === "es"
        ? `¡Genial, ${prospectName}! 🎉\n\n¡Qué bueno saber que tiene sentido! ¿Podemos agendar una llamada de 20 min esta semana?\n\nDime 2-3 horarios que te funcionen.\n\nSaludos,\n${senderName}`
        : `Great, ${prospectName}! 🎉\n\nGlad to hear it makes sense! Can we schedule a 20 min call this week?\n\nLet me know 2-3 times that work for you.\n\nBest,\n${senderName}`,
      tip: lang === "pt"
        ? "Quando há interesse, seja direto e sugira próximos passos concretos."
        : lang === "es"
        ? "Cuando hay interés, sé directo y sugiere próximos pasos concretos."
        : "When there's interest, be direct and suggest concrete next steps.",
    };
  }

  if (channel === "email") {
    if (messageType === "first-contact") {
      return {
        subject: lang === "pt"
          ? `${prospectName}, uma ideia para ${prospectCompany}`
          : lang === "es"
          ? `${prospectName}, una idea para ${prospectCompany}`
          : `${prospectName}, an idea for ${prospectCompany}`,
        body: lang === "pt"
          ? `Olá ${prospectName},\n\n${triggerText}\n\nTrabalho com ${nicheValue} e tenho ajudado empresas similares a ${painText}.\n\nRecentemente, conseguimos [RESULTADO ESPECÍFICO] para um cliente no mesmo segmento.\n\nSeria interessante trocarmos uma ideia sobre como isso poderia funcionar para a ${prospectCompany}?\n\nPosso apresentar alguns cases em uma call de 15 minutos.\n\nAbraço,\n${senderName}\n\nP.S.: Sem compromisso, é só uma conversa inicial.`
          : lang === "es"
          ? `Hola ${prospectName},\n\n${triggerText}\n\nTrabajo con ${nicheValue} y he estado ayudando a empresas similares a ${painText}.\n\nRecientemente, logramos [RESULTADO ESPECÍFICO] para un cliente en el mismo segmento.\n\n¿Sería interesante intercambiar ideas sobre cómo esto podría funcionar para ${prospectCompany}?\n\nPuedo presentar algunos casos en una llamada de 15 minutos.\n\nSaludos,\n${senderName}\n\nP.D.: Sin compromiso, es solo una conversación inicial.`
          : `Hi ${prospectName},\n\n${triggerText}\n\nI work with ${nicheValue} and have been helping similar companies to ${painText}.\n\nRecently, we achieved [SPECIFIC RESULT] for a client in the same segment.\n\nWould it be interesting to exchange ideas about how this could work for ${prospectCompany}?\n\nI can present some cases in a 15-minute call.\n\nBest,\n${senderName}\n\nP.S.: No commitment, just an initial conversation.`,
        tip: lang === "pt"
          ? "Emails funcionam melhor com assunto personalizado e um case concreto. O P.S. aumenta a taxa de resposta."
          : lang === "es"
          ? "Los emails funcionan mejor con asunto personalizado y un caso concreto. El P.D. aumenta la tasa de respuesta."
          : "Emails work best with personalized subject and a concrete case. The P.S. increases response rate.",
      };
    }
    if (messageType === "followup-1") {
      return {
        subject: lang === "pt"
          ? `Re: ${prospectName}, uma ideia para ${prospectCompany}`
          : lang === "es"
          ? `Re: ${prospectName}, una idea para ${prospectCompany}`
          : `Re: ${prospectName}, an idea for ${prospectCompany}`,
        body: lang === "pt"
          ? `Oi ${prospectName},\n\nSó passando para ver se você teve chance de ver meu email anterior.\n\nEntendo que a rotina é corrida, então vou direto ao ponto: posso mostrar em 15 minutos como ${painText} sem aumentar sua equipe ou orçamento.\n\nSe preferir, posso mandar um resumo por escrito.\n\nQual opção funciona melhor?\n\nAbraço,\n${senderName}`
          : lang === "es"
          ? `Hola ${prospectName},\n\nSolo pasando para ver si tuviste oportunidad de ver mi email anterior.\n\nEntiendo que la rutina es apretada, así que iré directo al punto: puedo mostrarte en 15 minutos cómo ${painText} sin aumentar tu equipo o presupuesto.\n\nSi prefieres, puedo enviarte un resumen por escrito.\n\n¿Qué opción funciona mejor?\n\nSaludos,\n${senderName}`
          : `Hi ${prospectName},\n\nJust checking in to see if you had a chance to see my previous email.\n\nI understand you're busy, so I'll get straight to the point: I can show you in 15 minutes how to ${painText} without increasing your team or budget.\n\nIf you prefer, I can send a written summary.\n\nWhich option works best?\n\nBest,\n${senderName}`,
        tip: lang === "pt"
          ? "Use 'Re:' no assunto para parecer uma continuação natural. Ofereça alternativas."
          : lang === "es"
          ? "Usa 'Re:' en el asunto para parecer una continuación natural. Ofrece alternativas."
          : "Use 'Re:' in subject to seem like a natural continuation. Offer alternatives.",
      };
    }
    if (messageType === "followup-2") {
      return {
        subject: lang === "pt"
          ? `Fechando o loop, ${prospectName}`
          : lang === "es"
          ? `Cerrando el loop, ${prospectName}`
          : `Closing the loop, ${prospectName}`,
        body: lang === "pt"
          ? `${prospectName},\n\nNão quero ser aquela pessoa chata que não para de mandar email.\n\nSe não for o momento, tudo bem — posso voltar em 3-6 meses.\n\nMas se fizer sentido conversar agora, é só responder "sim" que eu mando opções de horário.\n\n${senderName}`
          : lang === "es"
          ? `${prospectName},\n\nNo quiero ser esa persona molesta que no para de enviar emails.\n\nSi no es el momento, todo bien — puedo volver en 3-6 meses.\n\nPero si tiene sentido conversar ahora, solo responde "sí" y te envío opciones de horario.\n\n${senderName}`
          : `${prospectName},\n\nI don't want to be that annoying person who keeps sending emails.\n\nIf it's not the right time, totally fine — I can reach out in 3-6 months.\n\nBut if it makes sense to chat now, just reply "yes" and I'll send time options.\n\n${senderName}`,
        tip: lang === "pt"
          ? "Humor leve funciona bem no último follow-up. Facilite ao máximo a resposta."
          : lang === "es"
          ? "El humor ligero funciona bien en el último seguimiento. Facilita al máximo la respuesta."
          : "Light humor works well in the last follow-up. Make responding as easy as possible.",
      };
    }
    return {
      subject: lang === "pt"
        ? `Re: Próximos passos - ${prospectCompany}`
        : lang === "es"
        ? `Re: Próximos pasos - ${prospectCompany}`
        : `Re: Next steps - ${prospectCompany}`,
      body: lang === "pt"
        ? `Que ótimo, ${prospectName}!\n\nFico feliz que faça sentido.\n\nPara nossa conversa, preparei alguns pontos que gostaria de abordar:\n\n1. Entender melhor o cenário atual da ${prospectCompany}\n2. Mostrar como resolvemos ${painText}\n3. Definir próximos passos\n\nQue tal essa semana? Me fala 2-3 horários que funcionam.\n\nAbraço,\n${senderName}`
        : lang === "es"
        ? `¡Qué bueno, ${prospectName}!\n\nMe alegra que tenga sentido.\n\nPara nuestra conversación, preparé algunos puntos que me gustaría abordar:\n\n1. Entender mejor el escenario actual de ${prospectCompany}\n2. Mostrar cómo resolvemos ${painText}\n3. Definir próximos pasos\n\n¿Qué tal esta semana? Dime 2-3 horarios que te funcionen.\n\nSaludos,\n${senderName}`
        : `Great, ${prospectName}!\n\nGlad it makes sense.\n\nFor our conversation, I prepared some points I'd like to address:\n\n1. Better understand ${prospectCompany}'s current scenario\n2. Show how we solve ${painText}\n3. Define next steps\n\nHow about this week? Let me know 2-3 times that work.\n\nBest,\n${senderName}`,
      tip: lang === "pt"
        ? "Quando há interesse, estruture a conversa para gerar valor desde o início."
        : lang === "es"
        ? "Cuando hay interés, estructura la conversación para generar valor desde el inicio."
        : "When there's interest, structure the conversation to deliver value from the start.",
    };
  }

  if (channel === "whatsapp") {
    if (messageType === "first-contact") {
      return {
        body: lang === "pt"
          ? `Oi ${prospectName}! 👋\n\n${triggerText}\n\nTrabalho com ${nicheValue} e achei que poderia ser interessante trocarmos uma ideia.\n\nPosso mandar mais detalhes?`
          : lang === "es"
          ? `¡Hola ${prospectName}! 👋\n\n${triggerText}\n\nTrabajo con ${nicheValue} y pensé que podría ser interesante intercambiar ideas.\n\n¿Puedo enviarte más detalles?`
          : `Hi ${prospectName}! 👋\n\n${triggerText}\n\nI work with ${nicheValue} and thought it might be interesting to chat.\n\nCan I send more details?`,
        tip: lang === "pt"
          ? "WhatsApp é pessoal. Peça permissão antes de mandar muito conteúdo. Emojis moderados são OK."
          : lang === "es"
          ? "WhatsApp es personal. Pide permiso antes de enviar mucho contenido. Emojis moderados están OK."
          : "WhatsApp is personal. Ask permission before sending lots of content. Moderate emojis are OK.",
      };
    }
    if (messageType === "followup-1") {
      return {
        body: lang === "pt"
          ? `Oi ${prospectName}! Só passando pra ver se viu minha mensagem 😊\n\nSem pressa, só queria saber se faz sentido conversarmos sobre ${painText}.\n\nQualquer coisa, é só falar!`
          : lang === "es"
          ? `¡Hola ${prospectName}! Solo pasando para ver si viste mi mensaje 😊\n\nSin prisa, solo quería saber si tiene sentido que hablemos sobre ${painText}.\n\n¡Cualquier cosa, solo dime!`
          : `Hi ${prospectName}! Just checking if you saw my message 😊\n\nNo rush, just wanted to know if it makes sense to chat about ${painText}.\n\nLet me know!`,
        tip: lang === "pt"
          ? "Follow-up no WhatsApp deve ser leve e curto. Uma mensagem muito longa afasta."
          : lang === "es"
          ? "El seguimiento en WhatsApp debe ser ligero y corto. Un mensaje muy largo aleja."
          : "WhatsApp follow-up should be light and short. A very long message pushes people away.",
      };
    }
    if (messageType === "followup-2") {
      return {
        body: lang === "pt"
          ? `${prospectName}, última mensagem sobre isso!\n\nSe não for o momento, tranquilo 👍\n\nQualquer coisa no futuro, só chamar!`
          : lang === "es"
          ? `${prospectName}, ¡último mensaje sobre esto!\n\nSi no es el momento, tranqui 👍\n\n¡Cualquier cosa en el futuro, solo llama!`
          : `${prospectName}, last message about this!\n\nIf it's not the right time, no worries 👍\n\nAnytime in the future, just reach out!`,
        tip: lang === "pt"
          ? "Encerre de forma positiva. Não queime a ponte para contatos futuros."
          : lang === "es"
          ? "Cierra de forma positiva. No quemes el puente para contactos futuros."
          : "End on a positive note. Don't burn the bridge for future contacts.",
      };
    }
    return {
      body: lang === "pt"
        ? `Opa, massa! 🙌\n\nVou te mandar algumas opções de horário pra gente conversar:\n\n📅 [HORÁRIO 1]\n📅 [HORÁRIO 2]\n📅 [HORÁRIO 3]\n\nQual funciona melhor pra você?`
        : lang === "es"
        ? `¡Opa, genial! 🙌\n\nTe envío algunas opciones de horario para conversar:\n\n📅 [HORARIO 1]\n📅 [HORARIO 2]\n📅 [HORARIO 3]\n\n¿Cuál funciona mejor para ti?`
        : `Great! 🙌\n\nHere are some time options to chat:\n\n📅 [TIME 1]\n📅 [TIME 2]\n📅 [TIME 3]\n\nWhich works best for you?`,
      tip: lang === "pt"
        ? "Use emojis para facilitar a leitura e responda rápido para manter o momentum."
        : lang === "es"
        ? "Usa emojis para facilitar la lectura y responde rápido para mantener el momentum."
        : "Use emojis for easy reading and respond quickly to maintain momentum.",
    };
  }

  // Cold Call Script
  if (channel === "coldcall") {
    if (messageType === "first-contact") {
      return {
        body: lang === "pt"
          ? `[ABERTURA]\n"Oi ${prospectName}, aqui é ${senderName}. Tudo bem? Sei que você é ${prospectRole} na ${prospectCompany} e não vou tomar muito do seu tempo."\n\n[GANCHO - 10 segundos]\n"${triggerText} Estou entrando em contato porque tenho ajudado empresas como a sua a ${painText}."\n\n[PERGUNTA QUALIFICADORA]\n"Me conta: vocês estão satisfeitos com [área relacionada ao problema]?"\n\n[ESCUTA ATIVA]\n→ Se SIM: "Entendi! O que vocês fazem diferente que funciona tão bem?"\n→ Se NÃO: "O que seria ideal para vocês?"\n→ Se TALVEZ: "O que faria a diferença para melhorar?"\n\n[PROPOSTA DE VALOR]\n"Legal. O que a gente faz é [BENEFÍCIO PRINCIPAL]. Recentemente ajudamos [CLIENTE SIMILAR] a [RESULTADO ESPECÍFICO] em [PRAZO]."\n\n[FECHAMENTO]\n"Faz sentido marcarmos uma call de 15 minutos para eu te mostrar como isso funcionaria para a ${prospectCompany}?"\n\n[OBJEÇÕES COMUNS]\n→ "Não tenho tempo agora" → "Entendo! Posso ligar em outro momento ou mandar um resumo por email?"\n→ "Já temos fornecedor" → "Ótimo! Só por curiosidade, o que mais gostam nele? Talvez eu possa complementar."\n→ "Mande por email" → "Claro! Qual o melhor email? Posso incluir um case de empresa similar."`
          : lang === "es"
          ? `[APERTURA]\n"Hola ${prospectName}, aquí ${senderName}. ¿Cómo estás? Sé que eres ${prospectRole} en ${prospectCompany} y no voy a tomar mucho de tu tiempo."\n\n[GANCHO - 10 segundos]\n"${triggerText} Me comunico porque he estado ayudando a empresas como la tuya a ${painText}."\n\n[PREGUNTA CALIFICADORA]\n"Cuéntame: ¿están satisfechos con [área relacionada al problema]?"\n\n[ESCUCHA ACTIVA]\n→ Si SÍ: "¡Entendido! ¿Qué hacen diferente que funciona tan bien?"\n→ Si NO: "¿Qué sería ideal para ustedes?"\n→ Si TAL VEZ: "¿Qué haría la diferencia para mejorar?"\n\n[PROPUESTA DE VALOR]\n"Genial. Lo que hacemos es [BENEFICIO PRINCIPAL]. Recientemente ayudamos a [CLIENTE SIMILAR] a [RESULTADO ESPECÍFICO] en [PLAZO]."\n\n[CIERRE]\n"¿Tiene sentido agendar una llamada de 15 minutos para mostrarte cómo funcionaría esto para ${prospectCompany}?"\n\n[OBJECIONES COMUNES]\n→ "No tengo tiempo ahora" → "¡Entiendo! ¿Puedo llamar en otro momento o enviarte un resumen por email?"\n→ "Ya tenemos proveedor" → "¡Genial! Solo por curiosidad, ¿qué les gusta más de él? Tal vez pueda complementar."\n→ "Mándame por email" → "¡Claro! ¿Cuál es el mejor email? Puedo incluir un caso de empresa similar."`
          : `[OPENING]\n"Hi ${prospectName}, this is ${senderName}. How are you? I know you're ${prospectRole} at ${prospectCompany} and I won't take much of your time."\n\n[HOOK - 10 seconds]\n"${triggerText} I'm reaching out because I've been helping companies like yours to ${painText}."\n\n[QUALIFYING QUESTION]\n"Tell me: are you satisfied with [area related to problem]?"\n\n[ACTIVE LISTENING]\n→ If YES: "Got it! What do you do differently that works so well?"\n→ If NO: "What would be ideal for you?"\n→ If MAYBE: "What would make a difference to improve?"\n\n[VALUE PROPOSITION]\n"Great. What we do is [MAIN BENEFIT]. Recently we helped [SIMILAR CLIENT] to [SPECIFIC RESULT] in [TIMEFRAME]."\n\n[CLOSE]\n"Does it make sense to schedule a 15-minute call to show you how this would work for ${prospectCompany}?"\n\n[COMMON OBJECTIONS]\n→ "I don't have time now" → "I understand! Can I call at another time or send a summary by email?"\n→ "We already have a provider" → "Great! Just curious, what do you like most about them? Maybe I can complement."\n→ "Send me an email" → "Sure! What's the best email? I can include a case from a similar company."`,
        tip: lang === "pt"
          ? "Pratique o script até soar natural. Os primeiros 10 segundos são críticos para não ser desligado."
          : lang === "es"
          ? "Practica el script hasta que suene natural. Los primeros 10 segundos son críticos para no ser colgado."
          : "Practice the script until it sounds natural. The first 10 seconds are critical to avoid being hung up on.",
      };
    }
    return {
      body: lang === "pt"
        ? `[ABERTURA]\n"Oi ${prospectName}, aqui é ${senderName} novamente. Liguei na [data anterior] sobre ${painText}. Tem um minutinho?"\n\n[REFORÇO]\n"Só queria ver se faz sentido continuarmos aquela conversa."\n\n[FECHAMENTO]\n"Podemos marcar 15 minutos essa semana?"`
        : lang === "es"
        ? `[APERTURA]\n"Hola ${prospectName}, aquí ${senderName} de nuevo. Llamé el [fecha anterior] sobre ${painText}. ¿Tienes un minutito?"\n\n[REFUERZO]\n"Solo quería ver si tiene sentido continuar aquella conversación."\n\n[CIERRE]\n"¿Podemos agendar 15 minutos esta semana?"`
        : `[OPENING]\n"Hi ${prospectName}, this is ${senderName} again. I called on [previous date] about ${painText}. Do you have a minute?"\n\n[REINFORCEMENT]\n"Just wanted to see if it makes sense to continue that conversation."\n\n[CLOSE]\n"Can we schedule 15 minutes this week?"`,
      tip: lang === "pt"
        ? "Em follow-ups por telefone, seja breve e relembre o contexto anterior."
        : lang === "es"
        ? "En seguimientos por teléfono, sé breve y recuerda el contexto anterior."
        : "In phone follow-ups, be brief and remind them of the previous context.",
    };
  }

  return { body: "", tip: "" };
};

const ColdOutreachGenerator = () => {
  const { t, currentLanguage } = useLanguage();
  const lang = currentLanguage as "pt" | "en" | "es";
  const { trackCalculation } = useToolTracking("cold-outreach");
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    prospectName: "",
    prospectRole: "",
    prospectCompany: "",
    senderName: "",
    niche: "saas",
    channel: "linkedin",
    messageType: "first-contact",
    trigger: "",
    painPoint: "",
  });

  const template = useMemo(() => {
    return getTemplate(formData.channel, formData.messageType, formData.niche, formData, lang);
  }, [formData, lang]);

  const charCount = template.body.length;
  const maxChars = CHANNEL_CONFIG[formData.channel].maxChars;
  const charStatus = charCount > maxChars ? "text-destructive" : charCount > maxChars * 0.8 ? "text-amber-600" : "text-muted-foreground";

  const handleCopy = async () => {
    const textToCopy = template.subject ? `Assunto: ${template.subject}\n\n${template.body}` : template.body;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(t("tools.cold-outreach.copied"));
    trackCalculation({ channel: formData.channel, messageType: formData.messageType, niche: formData.niche });
    setTimeout(() => setCopied(false), 2000);
  };

  const isFormValid = formData.prospectName && formData.senderName;

  const ChannelIcon = CHANNEL_CONFIG[formData.channel].icon;

  return (
    <ToolPageLayout toolId="cold-outreach" icon={Send}>
      <Helmet>
        <title>{t("tools.cold-outreach.title")} | Guilda</title>
        <meta name="description" content={t("tools.cold-outreach.description")} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/cold-outreach" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  {t("tools.cold-outreach.form.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Channel Selection */}
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(CHANNEL_CONFIG) as Channel[]).map((ch) => {
                    const Icon = CHANNEL_CONFIG[ch].icon;
                    return (
                      <button
                        key={ch}
                        onClick={() => setFormData(prev => ({ ...prev, channel: ch }))}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${
                          formData.channel === ch 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${formData.channel === ch ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-xs font-medium">{CHANNEL_CONFIG[ch].label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Message Type */}
                <div className="space-y-2">
                  <Label>{t("tools.cold-outreach.form.messageType")}</Label>
                  <Select
                    value={formData.messageType}
                    onValueChange={(v: MessageType) => setFormData(prev => ({ ...prev, messageType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(MESSAGE_TYPE_LABELS) as MessageType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {MESSAGE_TYPE_LABELS[type][lang]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Niche */}
                <div className="space-y-2">
                  <Label>{t("tools.cold-outreach.form.niche")}</Label>
                  <Select
                    value={formData.niche}
                    onValueChange={(v: NicheKey) => setFormData(prev => ({ ...prev, niche: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(NICHE_LABELS) as NicheKey[]).map((niche) => (
                        <SelectItem key={niche} value={niche}>
                          {NICHE_LABELS[niche][lang]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prospect Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("tools.cold-outreach.form.prospectName")} *</Label>
                    <Input
                      value={formData.prospectName}
                      onChange={(e) => setFormData(prev => ({ ...prev, prospectName: e.target.value }))}
                      placeholder="João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("tools.cold-outreach.form.prospectRole")}</Label>
                    <Input
                      value={formData.prospectRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, prospectRole: e.target.value }))}
                      placeholder="CEO"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("tools.cold-outreach.form.prospectCompany")}</Label>
                    <Input
                      value={formData.prospectCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, prospectCompany: e.target.value }))}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("tools.cold-outreach.form.senderName")} *</Label>
                    <Input
                      value={formData.senderName}
                      onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                      placeholder="Maria Costa"
                    />
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="space-y-2">
                  <Label>{t("tools.cold-outreach.form.trigger")}</Label>
                  <Textarea
                    value={formData.trigger}
                    onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value }))}
                    placeholder={t("tools.cold-outreach.form.triggerPlaceholder")}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("tools.cold-outreach.form.painPoint")}</Label>
                  <Textarea
                    value={formData.painPoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, painPoint: e.target.value }))}
                    placeholder={t("tools.cold-outreach.form.painPointPlaceholder")}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChannelIcon className="w-5 h-5 text-primary" />
                    {t("tools.cold-outreach.preview.title")}
                  </CardTitle>
                  <Badge className={CHANNEL_CONFIG[formData.channel].color}>
                    {CHANNEL_CONFIG[formData.channel].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject (for email) */}
                {template.subject && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("tools.cold-outreach.preview.subject")}</Label>
                    <div className="p-2 bg-muted rounded-md text-sm font-medium">
                      {template.subject}
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">{t("tools.cold-outreach.preview.message")}</Label>
                    <span className={`text-xs ${charStatus}`}>
                      {charCount}/{maxChars} {t("tools.cold-outreach.preview.chars")}
                    </span>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap min-h-[200px] max-h-[400px] overflow-y-auto">
                    {template.body}
                  </div>
                </div>

                {/* Tip */}
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {template.tip}
                  </p>
                </div>

                {/* Copy Button */}
                <Button 
                  onClick={handleCopy} 
                  disabled={!isFormValid}
                  className="w-full"
                  size="lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {t("tools.cold-outreach.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      {t("tools.cold-outreach.copy")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("tools.cold-outreach.bestPractices.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• {t("tools.cold-outreach.bestPractices.tip1")}</li>
                  <li>• {t("tools.cold-outreach.bestPractices.tip2")}</li>
                  <li>• {t("tools.cold-outreach.bestPractices.tip3")}</li>
                  <li>• {t("tools.cold-outreach.bestPractices.tip4")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default ColdOutreachGenerator;
