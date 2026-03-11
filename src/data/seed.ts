import { AppRepository } from '../domain/repository';
import { Pack, Card, Template } from '../domain/models';

export const SEED_PACKS: Pack[] = [
  {
    id: "pack-base",
    name: "Base",
    description: "Perguntas fundamentais para quebrar a inércia.",
    createdAt: new Date().toISOString()
  },
  {
    id: "pack-perfeccionismo",
    name: "Perfeccionismo",
    description: "Desmonte a ilusão do trabalho impecável.",
    createdAt: new Date().toISOString()
  },
  {
    id: "pack-medo",
    name: "Medo",
    description: "Enfrente a aversão ao desconforto e ao julgamento.",
    createdAt: new Date().toISOString()
  }
];

export const SEED_TEMPLATES: Omit<Template, "id">[] = [
  {
    name: "Email Difícil",
    titlePrefix: "Email: ",
    defaultNextStep: "Abrir o rascunho e escrever a primeira frase ruim",
    category: "Comunicação"
  },
  {
    name: "Revisão de Código",
    titlePrefix: "PR: ",
    defaultNextStep: "Abrir o link e ler a descrição",
    category: "Trabalho"
  },
  {
    name: "Estudo",
    titlePrefix: "Estudar: ",
    defaultNextStep: "Abrir o material na página correta",
    category: "Pessoal"
  }
];

export const SEED_CARDS: Card[] = [
  // Base (25 cards)
  { id: "c-b1", packId: "pack-base", title: "Evidência", question: "Qual evidência sustenta essa desculpa?", followup: "Fatos, não sentimentos." },
  { id: "c-b2", packId: "pack-base", title: "2 minutos", question: "Qual ação de 2 minutos reduz o atrito agora?", followup: "Faça apenas isso." },
  { id: "c-b3", packId: "pack-base", title: "Consequência", question: "Se eu repetir isso por 30 dias, o que acontece?", followup: "Calcule o custo composto." },
  { id: "c-b4", packId: "pack-base", title: "Controle", question: "O que depende de mim agora?", followup: "Ignore o resto." },
  { id: "c-b5", packId: "pack-base", title: "O Óbvio", question: "Qual é a menor ação possível que você pode fazer agora?", followup: "Se for menos de 2 minutos, faça agora." },
  { id: "c-b6", packId: "pack-base", title: "O Pior Cenário", question: "O que acontece se você não fizer isso hoje?", followup: "Você consegue conviver com essa consequência?" },
  { id: "c-b7", packId: "pack-base", title: "A Mentira", question: "Você está mentindo para si mesmo sobre a importância disso?", followup: "Se não é importante, por que está na lista?" },
  { id: "c-b8", packId: "pack-base", title: "A Fuga", question: "Do que você está tentando fugir?", followup: "O desconforto da tarefa é pior que a culpa de adiar?" },
  { id: "c-b9", packId: "pack-base", title: "Amanhã", question: "Por que amanhã será diferente de hoje?", followup: "Você terá a mesma preguiça amanhã." },
  { id: "c-b10", packId: "pack-base", title: "Prioridade", question: "Isso é realmente a coisa mais importante agora?", followup: "Se sim, aja. Se não, reavalie." },
  { id: "c-b11", packId: "pack-base", title: "Energia", question: "Você está sem energia ou apenas sem vontade?", followup: "A vontade vem depois da ação." },
  { id: "c-b12", packId: "pack-base", title: "Clareza", question: "Você sabe exatamente o que precisa ser feito?", followup: "Se não, o próximo passo é definir o passo." },
  { id: "c-b13", packId: "pack-base", title: "Atrito", question: "O que está tornando essa tarefa mais difícil do que deveria?", followup: "Remova o obstáculo." },
  { id: "c-b14", packId: "pack-base", title: "Identidade", question: "Que tipo de pessoa adia isso?", followup: "É essa pessoa que você quer ser?" },
  { id: "c-b15", packId: "pack-base", title: "Custo de Oportunidade", question: "O que você está escolhendo fazer em vez disso?", followup: "Vale a pena?" },
  { id: "c-b16", packId: "pack-base", title: "Desconforto", question: "Você pode tolerar 5 minutos de desconforto?", followup: "Comece e veja se passa." },
  { id: "c-b17", packId: "pack-base", title: "Permissão", question: "Quem você está esperando que te dê permissão?", followup: "Ninguém virá salvar você." },
  { id: "c-b18", packId: "pack-base", title: "Urgência", question: "Isso precisa ser feito hoje?", followup: "Se não, agende. Se sim, faça." },
  { id: "c-b19", packId: "pack-base", title: "Recompensa", question: "Qual é o benefício imediato de terminar isso?", followup: "Foque no alívio." },
  { id: "c-b20", packId: "pack-base", title: "Simplicidade", question: "Como isso seria se fosse simples?", followup: "Não complique o que é básico." },
  { id: "c-b21", packId: "pack-base", title: "Decisão", question: "Você já decidiu que não vai fazer?", followup: "Assuma a responsabilidade pela escolha." },
  { id: "c-b22", packId: "pack-base", title: "Histórico", question: "Quantas vezes você já adiou isso?", followup: "Quebre o ciclo hoje." },
  { id: "c-b23", packId: "pack-base", title: "Foco", question: "Onde está sua atenção agora?", followup: "Traga de volta para o que importa." },
  { id: "c-b24", packId: "pack-base", title: "Resultado", question: "O que muda quando isso estiver pronto?", followup: "Visualize o fim." },
  { id: "c-b25", packId: "pack-base", title: "Ação", question: "Qual é o movimento físico necessário?", followup: "Levantar, abrir o app, digitar." },

  // Perfeccionismo (15 cards)
  { id: "c-p1", packId: "pack-perfeccionismo", title: "Padrão Real", question: "Qual é o padrão mínimo aceitável para isso?", followup: "Entregue o mínimo primeiro." },
  { id: "c-p2", packId: "pack-perfeccionismo", title: "Rascunho", question: "Você pode fazer uma versão ruim de propósito?", followup: "Apenas para começar." },
  { id: "c-p3", packId: "pack-perfeccionismo", title: "Julgamento", question: "Quem realmente se importa se não estiver perfeito?", followup: "Provavelmente só você." },
  { id: "c-p4", packId: "pack-perfeccionismo", title: "Custo do Polimento", question: "Quanto tempo a mais você vai gastar para melhorar 10%?", followup: "O ROI compensa?" },
  { id: "c-p5", packId: "pack-perfeccionismo", title: "Paralisia", question: "O perfeccionismo está sendo usado como desculpa para não agir?", followup: "Seja honesto." },
  { id: "c-p6", packId: "pack-perfeccionismo", title: "Iteração", question: "Você pode melhorar isso depois de entregue?", followup: "Feito é melhor que perfeito." },
  { id: "c-p7", packId: "pack-perfeccionismo", title: "Expectativa", question: "Sua expectativa é realista para o tempo que você tem?", followup: "Ajuste o escopo." },
  { id: "c-p8", packId: "pack-perfeccionismo", title: "Medo do Fracasso", question: "Você prefere falhar por não tentar ou por tentar imperfeitamente?", followup: "A inação já é uma falha." },
  { id: "c-p9", packId: "pack-perfeccionismo", title: "Limite de Tempo", question: "Se você tivesse apenas 30 minutos, o que faria?", followup: "Faça isso." },
  { id: "c-p10", packId: "pack-perfeccionismo", title: "Valor", question: "Onde está o verdadeiro valor dessa tarefa?", followup: "Foque no núcleo, ignore os enfeites." },
  { id: "c-p11", packId: "pack-perfeccionismo", title: "Aprovação", question: "Você está buscando aprovação ou resultado?", followup: "Resultados não precisam de aplausos." },
  { id: "c-p12", packId: "pack-perfeccionismo", title: "Detalhes", question: "Você está preso em um detalhe irrelevante?", followup: "Dê um passo para trás." },
  { id: "c-p13", packId: "pack-perfeccionismo", title: "Conclusão", question: "O que define que isso está 'pronto'?", followup: "Estabeleça um critério claro." },
  { id: "c-p14", packId: "pack-perfeccionismo", title: "Ego", question: "Seu ego está atrapalhando a entrega?", followup: "Desapegue do resultado ideal." },
  { id: "c-p15", packId: "pack-perfeccionismo", title: "Progresso", question: "Qualquer progresso é melhor que nenhum?", followup: "Sim. Mova-se." },

  // Medo (15 cards)
  { id: "c-m1", packId: "pack-medo", title: "Pior Cenário Real", question: "Qual é a pior coisa que pode acontecer de verdade?", followup: "É tão ruim assim?" },
  { id: "c-m2", packId: "pack-medo", title: "Rejeição", question: "Você está com medo de ouvir um 'não'?", followup: "O 'não' você já tem." },
  { id: "c-m3", packId: "pack-medo", title: "Exposição", question: "O que você está tentando esconder?", followup: "A vulnerabilidade é necessária." },
  { id: "c-m4", packId: "pack-medo", title: "Incerteza", question: "Você precisa de 100% de certeza para agir?", followup: "Aja com a informação que tem." },
  { id: "c-m5", packId: "pack-medo", title: "Desconforto", question: "Onde no seu corpo você sente esse medo?", followup: "Observe e aja mesmo assim." },
  { id: "c-m6", packId: "pack-medo", title: "História", question: "Que história você está contando a si mesmo sobre isso?", followup: "É um fato ou uma suposição?" },
  { id: "c-m7", packId: "pack-medo", title: "Preparação", question: "Você está usando a 'preparação' como procrastinação?", followup: "Você já sabe o suficiente." },
  { id: "c-m8", packId: "pack-medo", title: "Julgamento", question: "De quem é o julgamento que você teme?", followup: "A opinião deles paga suas contas?" },
  { id: "c-m9", packId: "pack-medo", title: "Falha", question: "O que você aprende se falhar nisso?", followup: "O fracasso é dados." },
  { id: "c-m10", packId: "pack-medo", title: "Sucesso", question: "Você tem medo do que acontece se der certo?", followup: "O sucesso traz responsabilidade." },
  { id: "c-m11", packId: "pack-medo", title: "Controle", question: "Você está tentando controlar o incontrolável?", followup: "Foque apenas na sua ação." },
  { id: "c-m12", packId: "pack-medo", title: "Coragem", question: "O que uma pessoa corajosa faria agora?", followup: "Faça isso." },
  { id: "c-m13", packId: "pack-medo", title: "Atraso", question: "Adiar diminui o medo?", followup: "Não, só o prolonga." },
  { id: "c-m14", packId: "pack-medo", title: "Identidade", question: "Você é o seu medo?", followup: "Você é quem age apesar dele." },
  { id: "c-m15", packId: "pack-medo", title: "Ação Imediata", question: "Qual é o passo mais seguro que você pode dar agora?", followup: "Dê esse passo." }
];

export async function ensureSeed(repository: AppRepository) {
  const packs = await repository.listPacks();
  if (packs.length === 0) {
    await repository.seedPacksAndCards(SEED_PACKS, SEED_CARDS);
  }
  
  const templates = await repository.listTemplates();
  if (templates.length === 0) {
    for (const t of SEED_TEMPLATES) {
      await repository.createTemplate(t);
    }
  }
}
