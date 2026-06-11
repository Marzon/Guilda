

## Otimizacao de Imagens da Pagina /aceleracao - 4 Frentes

### Resumo

Otimizar o carregamento das 16 imagens da pagina de aceleracao com 4 estrategias complementares: conversao WebP, lazy loading, preload do hero e dimensoes explicitas.

---

### Frente 1: Conversao automatica para WebP no build

Instalar o plugin `vite-plugin-image-optimizer` com `sharp` para comprimir e gerar versoes otimizadas automaticamente no build. Isso reduz o tamanho dos PNGs em ~30-50% sem necessidade de converter manualmente cada arquivo.

**Configuracao no `vite.config.ts`:**
- Adicionar `ViteImageOptimizer` com quality 80 para PNG e 80 para WebP
- O plugin otimiza as imagens estaticas em tempo de build

**Nota importante:** Este plugin comprime as imagens no build, mas nao gera arquivos `.webp` separados automaticamente para uso com `<picture>`. Para a abordagem `<picture>` com fallback, precisariamos de uma solucao diferente.

**Alternativa mais pratica:** Usar `vite-imagetools` que permite importar imagens com query params para gerar formatos diferentes em tempo de build:

```tsx
// Importacao com conversao automatica
import heroWebp from "@/assets/aceleracao-hero-illustration.png?format=webp";
import heroPng from "@/assets/aceleracao-hero-illustration.png";
```

Isso gera o WebP automaticamente no build. No componente, usamos `<picture>`:

```tsx
<picture>
  <source srcSet={heroWebp} type="image/webp" />
  <img src={heroPng} alt="..." />
</picture>
```

**Dependencia:** `vite-imagetools` (instalar como devDependency)

---

### Frente 2: Lazy Loading com LazyImage (below the fold)

Atualizar o componente `LazyImage` existente para suportar `<picture>` com WebP + PNG fallback. Aplicar em todas as imagens abaixo da dobra.

**Componente `LazyImage` atualizado:**
- Aceitar nova prop `webpSrc` opcional
- Quando presente, renderizar `<picture>` com `<source type="image/webp">`
- Manter fallback PNG no `<img>`

**Componentes afetados (12 imagens):**
- `Aceleracao2Problem.tsx` - 1 imagem
- `Aceleracao2HowItWorks.tsx` - 3 imagens
- `Aceleracao2Benefits.tsx` - 6 imagens
- `Aceleracao2ForWhom.tsx` - 2 imagens

---

### Frente 3: Preload da imagem Hero

Adicionar `<link rel="preload">` via Helmet no `Aceleracao2Hero.tsx` para a imagem principal, priorizando seu download.

```tsx
<Helmet>
  <link rel="preload" as="image" href={heroWebp} type="image/webp" />
</Helmet>
```

---

### Frente 4: Dimensoes explicitas nos containers

Adicionar altura fixa nos containers de imagem para evitar layout shift (CLS) durante o carregamento.

---

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `package.json` | Adicionar `vite-imagetools` |
| `vite.config.ts` | Registrar plugin `imagetools()` |
| `src/components/LazyImage.tsx` | Suporte a `webpSrc` com `<picture>` |
| `Aceleracao2Hero.tsx` | Preload + import WebP + `<picture>` |
| `Aceleracao2Problem.tsx` | LazyImage com WebP (1 img) |
| `Aceleracao2HowItWorks.tsx` | LazyImage com WebP (3 imgs) |
| `Aceleracao2Benefits.tsx` | LazyImage com WebP (6 imgs) |
| `Aceleracao2ForWhom.tsx` | LazyImage com WebP (2 imgs) |

### Impacto esperado

- Reducao de ~30-50% no tamanho total das imagens via WebP
- Carregamento inicial reduzido de 16 para 1 imagem (hero preloaded)
- Fallback PNG automatico para navegadores sem suporte WebP
- Blur placeholder melhora percepcao de velocidade
- Zero layout shift com dimensoes explicitas

